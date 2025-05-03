import dotenv from 'dotenv';
dotenv.config();

import { EventBridge } from 'aws-sdk';

const eventBridge = new EventBridge({ region: 'us-east-1' });

async function sendTestEvent() {
  try {
    const response = await eventBridge.putEvents({
      Entries: [
        {
          Source: 'ms.appointment',
          DetailType: 'AppointmentCreated',
          EventBusName: 'default',
          Detail: JSON.stringify({
            insuredId: '999888777PE',
            countryISO: 'PE',
            status: 'completed'
          })
        }
      ]
    }).promise();

    console.log('Evento enviado correctamente:', JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error('Error al enviar el evento:', error.message);
  }
}

sendTestEvent();
