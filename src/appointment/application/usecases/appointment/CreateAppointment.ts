import { Appointment } from '../../../domain/entities/Appointment';
import { STATUS } from '../../../domain/entities/AppointmentStatus';
import { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import { IAppointmentPublisher } from '../../../domain/events/IAppointmentPublisher';

export class CreateAppointment {
  constructor(
    private readonly repository: IAppointmentRepository,
    private readonly publisher: IAppointmentPublisher
  ) {}

  async execute(input: Omit<Appointment, 'status' | 'createdAt'>): Promise<Appointment> {
    const appointment: Appointment = {
      ...input,
      status: STATUS.PENDING,
      createdAt: new Date().toISOString()
    };

    await this.repository.save(appointment);
    await this.publisher.publish(appointment);

    return appointment;
  }
}
