import { SQSEvent } from 'aws-lambda';
import { DynamoAppointmentRepository } from '../../infrastructure/database/dynamodb/DynamoAppointmentRepository';
import { UpdateAppointmentStatus } from '../../application/usecases/appointment/UpdateAppointmentStatus';

const repo = new DynamoAppointmentRepository();
const useCase = new UpdateAppointmentStatus(repo);

export const sqsToUpdateStatus = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);

      console.log({body})

      const { insuredId, status } = body?.detail || {};

      if (!insuredId || !status) {
        console.warn('Evento inválido. Falta insuredId o status:', body);
        continue;
      }

      await useCase.execute(insuredId, status);
      console.log(`Estado actualizado para ${insuredId} a ${status}`);
    } catch (err: any) {
      console.error('Error al procesar el evento:', err.message);
    }
  }
};
