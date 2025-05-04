import { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  updateStatus(insuredId: string, status: string): Promise<void>;
  findAll(): Promise<Appointment[]>;
}
