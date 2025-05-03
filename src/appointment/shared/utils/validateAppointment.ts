export function validateAppointment(data: any): { valid: boolean; message?: string } {
  const requiredFields = ['insuredId', 'scheduleId', 'countryISO', 'centerId', 'specialtyId', 'medicId', 'date'];

  for (const field of requiredFields) {
    if (!data[field]) {
      return { valid: false, message: `Campo requerido: ${field}` };
    }
  }

  if (!['PE', 'CL'].includes(data.countryISO)) {
    return { valid: false, message: 'País no válido' };
  }

  return { valid: true };
}
