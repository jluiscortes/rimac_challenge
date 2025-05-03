import { createAppointmentHandler } from './interfaces/api/handlers/createAppointmentHandler';
import { updateStatusAppointmentHandler } from './interfaces/api/handlers/updateStatusAppointmentHandler';
import { sqsToUpdateStatus } from './interfaces/sqs/updateFromEventHandler';

export const CreateAppointmentHandler = createAppointmentHandler;
export const UpdateAppointmentStatusHandler = updateStatusAppointmentHandler;
export const SqsToUpdateStatus = sqsToUpdateStatus;
