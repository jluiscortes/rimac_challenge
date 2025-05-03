import { AppointmentStatus } from './AppointmentStatus';

export interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: 'PE' | 'CL';
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string;
  status: AppointmentStatus;
  createdAt: string;
}