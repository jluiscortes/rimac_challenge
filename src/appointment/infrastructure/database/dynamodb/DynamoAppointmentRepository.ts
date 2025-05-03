import { DynamoDB } from 'aws-sdk';
import { Appointment } from '../../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';

const TABLE = process.env.DYNAMO_TABLE_NAME!;
const db = new DynamoDB.DocumentClient();

export class DynamoAppointmentRepository implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<void> {
    await db.put({
      TableName: TABLE,
      Item: appointment,
    }).promise();
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const result = await db.query({
      TableName: TABLE,
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
      },
    }).promise();

    return result.Items as Appointment[];
  }
  
  async updateStatus(insuredId: string, status: string): Promise<void> {
    await db.update({
      TableName: TABLE,
      Key: { insuredId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
    }).promise();
  }
  
  
}


