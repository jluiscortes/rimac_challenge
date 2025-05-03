import { SQSEvent } from 'aws-lambda';
import { MySQLAppointmentWriter } from '../../infrastructure/database/mysql/MySQLAppointmentWriter';
import { PersistAppointment } from '../../application/usecases/PersistAppointment';
import { Appointment } from '../../domain/entities/Appointment';

const writer = new MySQLAppointmentWriter();
const useCase = new PersistAppointment(writer);

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message: Appointment = JSON.parse(record.body);

    console.log({message});

    try {
      await useCase.execute(message);
      console.log(`Inserted appointment: ${message.insuredId}`);
    } catch (error: any) {
      console.error(`Error inserting appointment: ${error.message}`);
    }
  }
};
