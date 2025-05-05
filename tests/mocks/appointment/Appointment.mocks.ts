import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { Appointment } from '../../../src/appointment/domain/entities/Appointment'
import { STATUS } from '../../../src/appointment/domain/entities/AppointmentStatus';

export const appointmentEventMock: APIGatewayProxyEvent = {
  body: JSON.stringify({
    insuredId: '12345678',
    scheduleId: 1001,
    countryISO: 'PE',
    centerId: 501,
    specialtyId: 301,
    medicId: 201,
    date: '2023-06-15T10:30:00.000Z',
    status: STATUS.COMPLETED,
  }),
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/appointments',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: ''
};

export const appointmentGetEventMock: APIGatewayProxyEvent = {
  body: JSON.stringify({
    insuredId: '12345678',
    scheduleId: 1001,
    countryISO: 'PE',
    centerId: 501,
    specialtyId: 301,
    medicId: 201,
    date: '2023-06-15T10:30:00.000Z',
    status: STATUS.COMPLETED,
  }),
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/appointments',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: ''
};

export const appointmentsResultFromDynamoMock: Appointment[] = [
  {
    insuredId: '12345678',
    scheduleId: 1001,
    countryISO: 'PE',
    centerId: 501,
    specialtyId: 301,
    medicId: 201,
    date: '2023-06-15T10:30:00.000Z',
    status: STATUS.COMPLETED,
    createdAt: '2023-06-15T10:00:00.000Z'
  },
  {
    insuredId: '87654321',
    scheduleId: 1002,
    countryISO: 'PE',
    centerId: 502,
    specialtyId: 302,
    medicId: 202,
    date: '2023-06-16T11:30:00.000Z',
    status: STATUS.PENDING,
    createdAt: '2023-06-15T10:00:00.000Z'
  }];

export const appointmentSqsEventMock: SQSEvent  = {
  Records: [
    {
      messageId: 'message-1',
      receiptHandle: 'receipt-1',
      body: JSON.stringify({
        detail: {
          insuredId: '12345678',
          status: STATUS.COMPLETED
        }
      }),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1545082649183',
        SenderId: 'AIDAIENQZJOLO23YVJ4VO',
        ApproximateFirstReceiveTimestamp: '1545082649185'
      },
      messageAttributes: {},
      md5OfBody: 'md5',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:my-queue',
      awsRegion: 'us-east-1'
    }
  ]
};

export const appointmentCLMock: Appointment = {
  insuredId: '12345678',
  scheduleId: 1001,
  countryISO: 'CL',
  centerId: 501,
  specialtyId: 301,
  medicId: 201,
  date: '2023-06-15T10:30:00.000Z',
  status: STATUS.PENDING,
  createdAt: '2023-05-10T12:30:00.000Z'
};

export const appointmentPEMock: Appointment = {
  insuredId: '12345678',
  scheduleId: 1001,
  countryISO: 'PE',
  centerId: 501,
  specialtyId: 301,
  medicId: 201,
  date: '2023-06-15T10:30:00.000Z',
  status: STATUS.PENDING,
  createdAt: '2023-05-10T12:30:00.000Z'
};

export const appointmentSqsEventCLMock : SQSEvent = {
  Records: [
    {
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
      receiptHandle: 'MessageReceiptHandle',
      body: JSON.stringify(appointmentCLMock),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      messageAttributes: {},
      md5OfBody: '7b270e59b47ff90a553787216d55d91d',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
      awsRegion: 'us-east-1'
    }
  ]
};

export const appointmentSqsEventPEMock : SQSEvent = {
  Records: [
    {
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
      receiptHandle: 'MessageReceiptHandle',
      body: JSON.stringify(appointmentPEMock),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      messageAttributes: {},
      md5OfBody: '7b270e59b47ff90a553787216d55d91d',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
      awsRegion: 'us-east-1'
    }
  ]
}

export const appointmentSqsEventInvalidMock : SQSEvent = {
  Records: [
    {
      messageId: '1',
      receiptHandle: 'handle1',
      body: '{invalid-json',
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      messageAttributes: {},
      md5OfBody: 'md5',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn',
      awsRegion: 'us-east-1'
    }
  ]
};



