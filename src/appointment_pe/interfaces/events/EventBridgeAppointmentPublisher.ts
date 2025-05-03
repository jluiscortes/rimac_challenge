import { EventBridge } from 'aws-sdk';
import { Appointment } from '../../../appointment/domain/entities/Appointment';
import { AppointmentEventPublisher } from '../../domain/services/AppointmentEventPublisher';

export class EventBridgeAppointmentPublisher implements AppointmentEventPublisher {
  private readonly client = new EventBridge();

  async publish(appointment: Appointment): Promise<void> {

    console.log('Publishing event to EventBridge...');
    console.log({appointment})
    await this.client.putEvents({
      Entries: [
        {
          Source: 'ms.appointment',
          DetailType: 'AppointmentCreated',
          Detail: JSON.stringify({
            insuredId: appointment.insuredId,
            countryISO: appointment.countryISO,
            status: 'completed'
          }),
          EventBusName: 'default'
        }
      ]
    }).promise();
  }
}
