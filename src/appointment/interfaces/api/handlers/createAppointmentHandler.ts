import { APIGatewayProxyHandler } from 'aws-lambda';
import { validateAppointment } from '../../../shared/utils/validateAppointment';
import { DynamoAppointmentRepository } from '../../../infrastructure/database/dynamodb/DynamoAppointmentRepository';
import { SNSAppointmentPublisher } from '../../../infrastructure/messaging/sns/SNSAppointmentPublisher';
import { CreateAppointment } from '../../../application/usecases/appointment/CreateAppointment';

const repo = new DynamoAppointmentRepository();
const publisher = new SNSAppointmentPublisher();
const useCase = new CreateAppointment(repo, publisher);

export const createAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const validation = validateAppointment(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validation.message }),
      };
    }

    const result = await useCase.execute(body);
    return {
      statusCode: 202,
      body: JSON.stringify({ message: 'Agendamiento en proceso', data: result }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno', details: err.message }),
    };
  }
};
