import dotenv from 'dotenv';
dotenv.config();

import { handler } from './interfaces/sqs/handler';

const testEvent = {
  Records: [
    {
      body: JSON.stringify({
        insuredId: '999888777CL',
        scheduleId: 10,
        countryISO: 'CL',
        centerId: 1,
        specialtyId: 3,
        medicId: 5,
        date: '2025-05-06T10:30:00Z',
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    }
  ]
};

(async () => {
  try {
    await handler(testEvent as any);
    console.log('Test completado con éxito');
  } catch (err) {
    console.error('Error en el test', err);
  }
})();
