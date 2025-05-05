import { SQSEvent } from 'aws-lambda';
import { handler } from '../../../src/appointment_cl/interfaces/sqs/handler';
import { MySQLAppointmentWriter } from '../../../src/appointment_pe/infrastructure/database/mysql/MySQLAppointmentWriter';
import { SendAppointmentEvent } from '../../../src/appointment_pe/application/usecases/SendAppointmentEvent';
import { appointmentPEMock, appointmentSqsEventPEMock, appointmentSqsEventInvalidMock } from '../../mocks/appointment/Appointment.mocks';

// Mocks para las dependencias
jest.mock('../../../src/appointment_pe/infrastructure/database/mysql/MySQLAppointmentWriter');
jest.mock('../../../src/appointment_pe/interfaces/events/EventBridgeAppointmentPublisher');
jest.mock('../../../src/appointment_pe/application/usecases/SendAppointmentEvent');

describe('SQS Handler - appointment_cl', () => {
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
    
    (MySQLAppointmentWriter as jest.Mock).mockImplementation(() => ({
      save: mockSave
    }));
    
    (SendAppointmentEvent as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  
  test('debe procesar correctamente un evento SQS con una cita', async () => {
    
    const sqsEvent: SQSEvent = appointmentSqsEventPEMock
    
    await handler(sqsEvent);
    
    expect(consoleLogSpy).toHaveBeenCalledWith({
      appointment: expect.objectContaining({
        insuredId: appointmentPEMock.insuredId
      })
    });
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
