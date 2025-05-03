import { Appointment } from '../../../appointment/domain/entities/Appointment';
import { AppointmentEventPublisher } from '../../domain/services/AppointmentEventPublisher';

export class SendAppointmentEvent {
  constructor(private readonly publisher: AppointmentEventPublisher) {}

  async execute(appointment: Appointment): Promise<void> {
    await this.publisher.publish(appointment);
  }
}
