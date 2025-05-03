export const STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export type AppointmentStatus = typeof STATUS[keyof typeof STATUS];
