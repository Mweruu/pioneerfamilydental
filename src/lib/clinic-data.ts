import { z } from 'zod';
export const services = ['Dental check-up','Scaling & polishing','Teeth whitening','Braces & orthodontics','Dental emergency','Optical consultation'] as const;
export const times = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'] as const;
export function nairobiDate() { return new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
export const bookingSchema = z.object({patient_name:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Use a country code, e.g. +254712345678'),service:z.enum(services),preferred_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d=> d >= nairobiDate(),'Choose today or a future date'),preferred_time:z.enum(times),whatsapp_consent:z.boolean()});
