import { Appointment } from '../entities/Appointment';

export interface IAppointmentWriter {
  save(appointment: Appointment): Promise<void>;
}
