import { IAppointmentWriter } from '../../../domain/repositories/IAppointmentWriter';
import { Appointment } from '../../../domain/entities/Appointment';
import { pool } from '../../../shared/database/mysqlClient';

export class MySQLAppointmentWriter implements IAppointmentWriter {
  async save(appointment: Appointment): Promise<void> {
    const query = `
      INSERT INTO appointments (
        insuredId, scheduleId, countryISO, centerId, specialtyId,
        medicId, date, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      appointment.insuredId,
      appointment.scheduleId,
      appointment.countryISO,
      appointment.centerId,
      appointment.specialtyId,
      appointment.medicId,
      appointment.date,
      appointment.status,
      appointment.createdAt,
    ];

    await pool.execute(query, values);
  }
}
