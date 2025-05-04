import { FindAllAppointmentUseCase } from '../../../src/appointment/application/usecases/appointment/FindAllAppointment';
import { Appointment } from '../../../src/appointment/domain/entities/Appointment';
import { IAppointmentRepository } from '../../../src/appointment/domain/repositories/IAppointmentRepository';
import { STATUS } from '../../../src/appointment/domain/entities/AppointmentStatus';

describe('FindAllAppointmentUseCase', () => {
  let repository: jest.Mocked<IAppointmentRepository>;
  let findAllAppointmentUseCase: FindAllAppointmentUseCase;
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    repository = {
      save: jest.fn(),
      findByInsuredId: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn()
    };
    
    findAllAppointmentUseCase = new FindAllAppointmentUseCase(repository);
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  
  test('debe devolver un array vacío cuando no hay citas', async () => {
    repository.findAll.mockResolvedValue([]);
    
    const result = await findAllAppointmentUseCase.execute();
    
    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
  
  test('debe devolver un array vacío cuando findAll devuelve null', async () => {
    repository.findAll.mockResolvedValue(null as unknown as Appointment[]);

    const result = await findAllAppointmentUseCase.execute();
    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
  
  test('debe devolver todas las citas encontradas', async () => {
    const mockAppointments: Appointment[] = [
      {
        insuredId: '12345678',
        scheduleId: 1001,
        countryISO: 'PE',
        centerId: 501,
        specialtyId: 301,
        medicId: 201,
        date: '2023-06-15T10:30:00.000Z',
        status: STATUS.PENDING,
        createdAt: '2023-05-10T12:30:00.000Z'
      },
      {
        insuredId: '87654321',
        scheduleId: 1002,
        countryISO: 'CL',
        centerId: 502,
        specialtyId: 302,
        medicId: 202,
        date: '2023-06-16T11:00:00.000Z',
        status: STATUS.COMPLETED,
        createdAt: '2023-05-11T09:15:00.000Z'
      }
    ];
    
    repository.findAll.mockResolvedValue(mockAppointments);

    const result = await findAllAppointmentUseCase.execute();
    
    expect(result).toEqual(mockAppointments);
    expect(result.length).toBe(2);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
  
  test('debe lanzar un error cuando el repositorio falla', async () => {
    const errorMessage = 'Error de conexión a la base de datos';
    repository.findAll.mockRejectedValue(new Error(errorMessage));
    
    await expect(findAllAppointmentUseCase.execute()).rejects.toThrow(`Error al listar appointments: ${errorMessage}`);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
  
  test('debe manejar errores no instancias de Error', async () => {
    repository.findAll.mockRejectedValue('Error string no es instancia de Error');
    
    await expect(findAllAppointmentUseCase.execute()).rejects.toThrow('Error al listar appointments');
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});