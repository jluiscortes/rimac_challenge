import { createAppointmentHandler } from './interfaces/api/handlers/createAppointmentHandler';
import { updateStatusAppointmentHandler } from './interfaces/api/handlers/updateStatusAppointmentHandler';
import { sqsToUpdateStatus } from './interfaces/sqs/updateFromEventHandler';
import { findAllAppointmentHandler } from './interfaces/api/handlers/findAllAppointmentHandler';

export const CreateAppointmentHandler = createAppointmentHandler;
export const UpdateAppointmentStatusHandler = updateStatusAppointmentHandler;
export const SqsToUpdateStatus = sqsToUpdateStatus;
export const FindAllAppointmentHandler = findAllAppointmentHandler;
