import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { 
  CreateAppointmentHandler, 
  UpdateAppointmentStatusHandler, 
  SqsToUpdateStatus, 
  FindAllAppointmentHandler 
} from '../../../src/appointment/setup';

import { appointmentEventMock, appointmentGetEventMock, appointmentSqsEventMock } from '../../mocks/appointment/Appointment.mocks'

// Mocks para los casos de uso y repositorios subyacentes
jest.mock('../../../src/appointment/application/usecases/appointment/CreateAppointment');
jest.mock('../../../src/appointment/application/usecases/appointment/UpdateAppointmentStatus');
jest.mock('../../../src/appointment/application/usecases/appointment/FindAllAppointment');
jest.mock('../../../src/appointment/infrastructure/database/dynamodb/DynamoAppointmentRepository');
jest.mock('../../../src/appointment/infrastructure/messaging/sns/SNSAppointmentPublisher');
jest.mock('../../../src/appointment/shared/utils/validateAppointment');

// Importar después de los mocks para usar las versiones mockeadas
import { validateAppointment } from '../../../src/appointment/shared/utils/validateAppointment';
import { CreateAppointment } from '../../../src/appointment/application/usecases/appointment/CreateAppointment';
import { UpdateAppointmentStatus } from '../../../src/appointment/application/usecases/appointment/UpdateAppointmentStatus';
import { FindAllAppointmentUseCase } from '../../../src/appointment/application/usecases/appointment/FindAllAppointment';
import { STATUS } from '../../../src/appointment/domain/entities/AppointmentStatus';
import { Appointment } from '../../../src/appointment/domain/entities/Appointment';

describe('Setup handlers', () => {
  // Mocks para los casos de uso
  let mockCreateExecute: jest.Mock;
  let mockUpdateExecute: jest.Mock;
  let mockFindAllExecute: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    mockCreateExecute = jest.fn().mockResolvedValue({});
    (CreateAppointment as jest.MockedClass<typeof CreateAppointment>).mockImplementation(() => ({
      execute: mockCreateExecute
    } as any));
    
    mockUpdateExecute = jest.fn();
    (UpdateAppointmentStatus as jest.MockedClass<typeof UpdateAppointmentStatus>).mockImplementation(() => ({
      execute: mockUpdateExecute
    } as any));
    
    mockFindAllExecute = jest.fn();
    (FindAllAppointmentUseCase as jest.MockedClass<typeof FindAllAppointmentUseCase>).mockImplementation(() => ({
      execute: mockFindAllExecute
    } as any));
    
    (validateAppointment as jest.Mock).mockReturnValue({ valid: true });
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('CreateAppointmentHandler', () => {
    let mockEvent: APIGatewayProxyEvent;
    
    beforeEach(() => {
      mockEvent = appointmentEventMock as APIGatewayProxyEvent;
    });
    
    test('debe crear una cita correctamente', async () => {
      // Arrange
      const appointmentData = JSON.parse(mockEvent.body || '{}');
      const expectedAppointment = {
        ...appointmentData,
        status: STATUS.PENDING,
        createdAt: '2023-05-10T12:30:00.000Z'
      };
      mockCreateExecute.mockResolvedValue(expectedAppointment);

      mockCreateExecute.mockClear();
      
      const result = await CreateAppointmentHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(202);
      expect(JSON.parse(result.body)).toEqual({
        message: 'Agendamiento en proceso'
      });

    });
    
    test('debe devolver error 400 si la validación falla', async () => {
      // Arrange
      (validateAppointment as jest.Mock).mockReturnValue({
        valid: false,
        message: 'Datos de cita inválidos'
      });
      
      // Act
      const result = await CreateAppointmentHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;
      
      // Assert
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Datos de cita inválidos'
      });
      expect(mockCreateExecute).not.toHaveBeenCalled();
    });
  });

  describe('UpdateAppointmentStatusHandler', () => {
    let mockEvent: APIGatewayProxyEvent;
    
    beforeEach(() => {
      // Configurar evento API Gateway
      mockEvent = appointmentEventMock as APIGatewayProxyEvent;
    });
    
    test('debe actualizar el estado de la cita correctamente', async () => {
      // Arrange
      const payload = JSON.parse(mockEvent.body || '{}');
      const { insuredId, status, updatedAt} = payload
      const expectedResult = {
        insuredId,
        status,
        updatedAt
      };
      mockUpdateExecute.mockResolvedValue(expectedResult);
      
      const result = await UpdateAppointmentStatusHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;

      console.log({result});
      
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        message:`Estado actualizado a '${status}' para insuredId ${insuredId}`
      });
    });
    
    test('debe devolver error 400 si falta el insuredId', async () => {
      mockEvent.body = JSON.stringify({})
      
      const result = await UpdateAppointmentStatusHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;
      
      console.log({result});
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: 'insuredId y status son requeridos'
      });
    });
  });

  describe('FindAllAppointmentHandler', () => {
    let mockEvent: APIGatewayProxyEvent;
    
    beforeEach(() => {
      mockEvent = appointmentGetEventMock as APIGatewayProxyEvent;
    });
    
    test('debe devolver todas las citas', async () => {

      const mockAppointments: Appointment[] = [];
      
      mockFindAllExecute.mockClear();
      mockFindAllExecute.mockImplementation(() => Promise.resolve(mockAppointments));
      
      const result = await FindAllAppointmentHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;
      
      console.log({result});
      
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        data: mockAppointments,
        count: mockAppointments.length,
        message: 'Appointments recuperados exitosamente'
      });
    });
    
    test('debe devolver array vacío cuando no hay citas', async () => {

      mockFindAllExecute.mockResolvedValue([]);
      
      const result = await FindAllAppointmentHandler(mockEvent, {} as any, {} as any) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'Appointments recuperados exitosamente'
      });
    });
  });

  describe('SqsToUpdateStatus', () => {
    let sqsEvent: SQSEvent;
    
    beforeEach(() => {
      // Configurar evento SQS
      sqsEvent = appointmentSqsEventMock;
    });
    
    test('debe procesar el mensaje SQS correctamente', async () => {

      const { insuredId, status } = JSON.parse(sqsEvent.Records[0].body).detail;

      mockUpdateExecute.mockResolvedValue(undefined);
      
      await SqsToUpdateStatus(sqsEvent);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.objectContaining({body: expect.anything()}));
      expect(consoleLogSpy).toHaveBeenCalledWith(`Estado actualizado para ${insuredId} a ${status}`);
    });
    
    test('debe ignorar mensajes sin insuredId', async () => {

      sqsEvent.Records[0].body = JSON.stringify({
        detail: {
          status: STATUS.COMPLETED
        }
      });
      
      await SqsToUpdateStatus(sqsEvent);

      expect(mockUpdateExecute).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
    
    test('debe manejar errores de formato JSON', async () => {
      sqsEvent.Records[0].body = 'not-a-json';

      await SqsToUpdateStatus(sqsEvent);
      
      expect(mockUpdateExecute).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});