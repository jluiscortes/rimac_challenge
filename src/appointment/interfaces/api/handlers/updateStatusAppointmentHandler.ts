import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoAppointmentRepository } from '../../../infrastructure/database/dynamodb/DynamoAppointmentRepository';
import { UpdateAppointmentStatus } from '../../../application/usecases/appointment/UpdateAppointmentStatus';

const repo = new DynamoAppointmentRepository();
const useCase = new UpdateAppointmentStatus(repo);

export const updateStatusAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { insuredId, status } = body;

    if (!insuredId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'insuredId y status son requeridos' }),
      };
    }

    await useCase.execute(insuredId, status);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Estado actualizado a '${status}' para insuredId ${insuredId}` }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al actualizar estado',
        details: err.message,
      }),
    };
  }
};
