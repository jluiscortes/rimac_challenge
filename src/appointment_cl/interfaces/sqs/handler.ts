import { SQSEvent } from 'aws-lambda';
import { MySQLAppointmentWriter } from '../../infrastructure/database/mysql/MySQLAppointmentWriter';
import { EventBridgeAppointmentPublisher } from '../../interfaces/events/EventBridgeAppointmentPublisher';
import { SendAppointmentEvent } from '../../application/usecases/SendAppointmentEvent';
import { Appointment } from '../../../appointment/domain/entities/Appointment';

const writer = new MySQLAppointmentWriter();
const publisher = new EventBridgeAppointmentPublisher();
const sendAppointmentEvent = new SendAppointmentEvent(publisher);

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const appointment: Appointment = JSON.parse(record.body);

      await writer.save(appointment);
      await sendAppointmentEvent.execute(appointment);

      console.log(`Cita insertada y evento emitido: ${appointment.insuredId}`);
    } catch (error: any) {
      console.error('Error al procesar evento SQS:', error.message);
    }
  }
};
