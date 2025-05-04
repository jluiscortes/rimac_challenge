import { UpdateAppointmentStatus } from '../../../src/appointment/application/usecases/appointment/UpdateAppointmentStatus';
import { IAppointmentRepository } from '../../../src/appointment/domain/repositories/IAppointmentRepository';
import { Appointment } from '../../../src/appointment/domain/entities/Appointment';
import { STATUS } from '../../../src/appointment/domain/entities/AppointmentStatus';

describe('UpdateAppointmentStatus', () => {
  let repository: jest.Mocked<IAppointmentRepository>;
  let updateAppointmentStatus: UpdateAppointmentStatus;
  
  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findByInsuredId: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn()
    };
    
    updateAppointmentStatus = new UpdateAppointmentStatus(repository);
  });
  
  test('debe lanzar error cuando insuredId es undefined', async () => {
    await expect(updateAppointmentStatus.execute(undefined as unknown as string, STATUS.COMPLETED))
      .rejects
      .toThrow('insuredId y status son requeridos');
    
    expect(repository.findByInsuredId).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
  
  test('debe lanzar error cuando status es undefined', async () => {
    await expect(updateAppointmentStatus.execute('123', undefined as unknown as string))
      .rejects
      .toThrow('insuredId y status son requeridos');
    
    expect(repository.findByInsuredId).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
  
  test('debe lanzar error cuando no se encuentra el appointment', async () => {
    const insuredId = '12345678';
    repository.findByInsuredId.mockResolvedValue([]);
    
    await expect(updateAppointmentStatus.execute(insuredId, STATUS.COMPLETED))
      .rejects
      .toThrow(`No se encontró appointment para insuredId: ${insuredId}`);
    
    expect(repository.findByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  test('debe lanzar error cuando el repository.findByInsuredId devuelve null', async () => {
    const insuredId = '12345678';
    repository.findByInsuredId.mockResolvedValue(null as unknown as Appointment[]);
    
    await expect(updateAppointmentStatus.execute(insuredId, STATUS.COMPLETED))
      .rejects
      .toThrow(`No se encontró appointment para insuredId: ${insuredId}`);
    
    expect(repository.findByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
  
  test('debe actualizar el status correctamente', async () => {
    const insuredId = '12345678';
    const newStatus = STATUS.COMPLETED;
    
    const appointments: Appointment[] = [{
      insuredId,
      scheduleId: 1001,
      countryISO: 'PE',
      centerId: 501,
      specialtyId: 301,
      medicId: 201,
      date: '2023-06-15T10:30:00.000Z',
      status: STATUS.PENDING,
      createdAt: '2023-05-10T12:30:00.000Z'
    }];
    
    repository.findByInsuredId.mockResolvedValue(appointments);
    repository.updateStatus.mockResolvedValue();
    
    await updateAppointmentStatus.execute(insuredId, newStatus);
    
    expect(repository.findByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(repository.updateStatus).toHaveBeenCalledWith(insuredId, newStatus);
  });
  
  test('debe propagar errores del repositorio en updateStatus', async () => {
    const insuredId = '12345678';
    const newStatus = STATUS.COMPLETED;
    const errorMessage = 'Error al actualizar en base de datos';
    
    const appointments: Appointment[] = [{
      insuredId,
      scheduleId: 1001,
      countryISO: 'PE',
      centerId: 501,
      specialtyId: 301,
      medicId: 201,
      date: '2023-06-15T10:30:00.000Z',
      status: STATUS.PENDING,
      createdAt: '2023-05-10T12:30:00.000Z'
    }];
    
    repository.findByInsuredId.mockResolvedValue(appointments);
    repository.updateStatus.mockRejectedValue(new Error(errorMessage));
    
    await expect(updateAppointmentStatus.execute(insuredId, newStatus))
      .rejects
      .toThrow(errorMessage);
    
    expect(repository.findByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(repository.updateStatus).toHaveBeenCalledWith(insuredId, newStatus);
  });
});