import { SQSEvent } from 'aws-lambda';
import { handler } from '../../../src/appointment_cl/interfaces/sqs/handler';
import { MySQLAppointmentWriter } from '../../../src/appointment_cl/infrastructure/database/mysql/MySQLAppointmentWriter';
import { SendAppointmentEvent } from '../../../src/appointment_cl/application/usecases/SendAppointmentEvent';
import { appointmentSqsEventCLMock, appointmentCLMock, appointmentSqsEventInvalidMock } from '../../mocks/appointment/Appointment.mocks';

// Mocks para las dependencias
jest.mock('../../../src/appointment_cl/infrastructure/database/mysql/MySQLAppointmentWriter');
jest.mock('../../../src/appointment_cl/interfaces/events/EventBridgeAppointmentPublisher');
jest.mock('../../../src/appointment_cl/application/usecases/SendAppointmentEvent');

describe('SQS Handler - appointment_cl', () => {
  // Mocks para métodos específicos
  let mockSave: jest.Mock;
  let mockExecute: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSave = jest.fn();
    mockExecute = jest.fn();
    
    (MySQLAppointmentWriter as jest.MockedClass<typeof MySQLAppointmentWriter>).mockImplementation(() => ({
      save: mockSave
    } as any));
    
    (SendAppointmentEvent as jest.MockedClass<typeof SendAppointmentEvent>).mockImplementation(() => ({
      execute: mockExecute
    } as any));
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  
  test('debe procesar correctamente un evento SQS con una cita', async () => {
    
    const sqsEvent: SQSEvent = appointmentSqsEventCLMock
    
    await handler(sqsEvent);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Cita insertada y evento emitido: ${appointmentCLMock.insuredId}`)
    );
  });

  test('debe manejar error al parsear JSON', async () => {

    const invalidJsonEvent: SQSEvent = appointmentSqsEventInvalidMock;
    
    await handler(invalidJsonEvent);
    
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error al procesar evento SQS:',
      expect.stringContaining('Unexpected token')
    );
  });
});
