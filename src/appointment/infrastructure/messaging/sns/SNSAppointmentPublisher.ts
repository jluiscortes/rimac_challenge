import { SNS } from 'aws-sdk';
import { Appointment } from '../../../domain/entities/Appointment';
import { IAppointmentPublisher } from '../../../domain/events/IAppointmentPublisher';

const sns = new SNS();
const topicArn = process.env.SNS_TOPIC_ARN!;

export class SNSAppointmentPublisher implements IAppointmentPublisher {
  async publish(appointment: Appointment): Promise<void> {
    await sns.publish({
      TopicArn: topicArn,
      Message: JSON.stringify(appointment),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: appointment.countryISO
        }
      }
    }).promise();
  }
}
