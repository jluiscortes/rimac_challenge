import { CreateAppointment } from '../../../src/appointment/application/usecases/appointment/CreateAppointment';
import { Appointment } from '../../../src/appointment/domain/entities/Appointment';
import { STATUS } from '../../../src/appointment/domain/entities/AppointmentStatus';
import { IAppointmentRepository } from '../../../src/appointment/domain/repositories/IAppointmentRepository';
import { IAppointmentPublisher } from '../../../src/appointment/domain/events/IAppointmentPublisher';

describe('CreateAppointment', () => {
  let repository: jest.Mocked<IAppointmentRepository>;
  let publisher: jest.Mocked<IAppointmentPublisher>;
  let createAppointment: CreateAppointment;
  let mockDate: string;

  beforeEach(() => {

    repository = {
      save: jest.fn(),
      findByInsuredId: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn()
    };
    
    publisher = {
      publish: jest.fn()
    };
    
    createAppointment = new CreateAppointment(repository, publisher);
    
    mockDate = '2023-05-10T12:30:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('debe crear una cita con estado PENDING y guardarla en el repositorio', async () => {

    const appointmentInput = {
      insuredId: '12345678',
      scheduleId: 1001,
      countryISO: 'PE' as const,
      centerId: 501,
      specialtyId: 301,
      medicId: 201,
      date: '2023-06-15T10:30:00.000Z'
    };

    const expectedAppointment: Appointment = {
      ...appointmentInput,
      status: STATUS.PENDING,
      createdAt: mockDate
    };

    const result = await createAppointment.execute(appointmentInput);

    expect(repository.save).toHaveBeenCalledWith(expectedAppointment);
    expect(publisher.publish).toHaveBeenCalledWith(expectedAppointment);
    expect(result).toEqual(expectedAppointment);
  });

  test('debe crear una cita para Chile correctamente', async () => {
    const appointmentInput = {
      insuredId: '9876543',
      scheduleId: 2002,
      countryISO: 'CL' as const,
      centerId: 502,
      specialtyId: 302,
      medicId: 202,
      date: '2023-07-20T15:45:00.000Z'
    };

    const expectedAppointment: Appointment = {
      ...appointmentInput,
      status: STATUS.PENDING,
      createdAt: mockDate
    };

    const result = await createAppointment.execute(appointmentInput);

    expect(repository.save).toHaveBeenCalledWith(expectedAppointment);
    expect(publisher.publish).toHaveBeenCalledWith(expectedAppointment);
    expect(result).toEqual(expectedAppointment);
  });

  test('debe propagar errores del repositorio', async () => {
    // Arrange
    const appointmentInput = {
      insuredId: '12345678',
      scheduleId: 1001,
      countryISO: 'PE' as const,
      centerId: 501,
      specialtyId: 301,
      medicId: 201,
      date: '2023-06-15T10:30:00.000Z'
    };

    const error = new Error('Error al guardar en la base de datos');
    repository.save.mockRejectedValue(error);

    await expect(createAppointment.execute(appointmentInput)).rejects.toThrow(error);
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  test('debe propagar errores del publicador', async () => {

    const appointmentInput = {
      insuredId: '12345678',
      scheduleId: 1001,
      countryISO: 'PE' as const,
      centerId: 501,
      specialtyId: 301,
      medicId: 201,
      date: '2023-06-15T10:30:00.000Z'
    };

    const error = new Error('Error al publicar el evento');
    publisher.publish.mockRejectedValue(error);

    await expect(createAppointment.execute(appointmentInput)).rejects.toThrow(error);
    expect(repository.save).toHaveBeenCalled();
  });
});