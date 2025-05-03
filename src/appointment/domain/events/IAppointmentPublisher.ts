import { Appointment } from '../entities/Appointment';

export interface IAppointmentPublisher {
  publish(appointment: Appointment): Promise<void>;
}
