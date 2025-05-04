import { Appointment } from '../../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';

export class FindAllAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepository.findAll();
      if (!appointments || appointments.length === 0) {
        return [];
      }
      
      return appointments;
    } catch (error) {
      console.error('Error al listar appointments:', error);
      if (error instanceof Error) {
        throw new Error(`Error al listar appointments: ${error.message}`);
      } else {
        throw new Error('Error al listar appointments');
      }
    }
  }
}