import { Appointment } from '../../../appointment/domain/entities/Appointment';

export interface AppointmentEventPublisher {
  publish(appointment: Appointment): Promise<void>;
}
