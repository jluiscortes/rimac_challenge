import { IAppointmentWriter } from '../../domain/repositories/IAppointmentWriter';
import { Appointment } from '../../domain/entities/Appointment';

export class PersistAppointment {
  constructor(private readonly writer: IAppointmentWriter) {}

  async execute(appointment: Appointment): Promise<void> {
    await this.writer.save(appointment);
  }
}
