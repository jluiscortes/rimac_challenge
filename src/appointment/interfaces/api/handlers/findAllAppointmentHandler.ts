import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoAppointmentRepository } from '../../../infrastructure/database/dynamodb/DynamoAppointmentRepository';
import { FindAllAppointmentUseCase } from '../../../application/usecases/appointment/FindAllAppointment';

// Inicializa el repositorio y el caso de uso
const repo = new DynamoAppointmentRepository();
const useCase = new FindAllAppointmentUseCase(repo);

export const findAllAppointmentHandler: APIGatewayProxyHandler = async () => {
  try {

    const appointments = await useCase.execute();
    
    return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: appointments,
        count: appointments.length,
        message: 'Appointments recuperados exitosamente',
      }),
    };
  } catch (err: any) {
    console.error('Error al listar appointments:', err);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Error al recuperar los appointments',
        error: err.message,
      }),
    };
  }
};