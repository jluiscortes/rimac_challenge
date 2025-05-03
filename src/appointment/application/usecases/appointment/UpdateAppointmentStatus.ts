import { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';

export class UpdateAppointmentStatus {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(insuredId: string, status: string): Promise<void> {
    if (!insuredId || !status) throw new Error('insuredId y status son requeridos');

    const existing = await this.repository.findByInsuredId(insuredId);
    if (!existing || existing.length === 0) {
      throw new Error(`No se encontró appointment para insuredId: ${insuredId}`);
    }

    await this.repository.updateStatus(insuredId, status);
  }
}
