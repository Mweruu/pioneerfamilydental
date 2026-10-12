import { describe,it,expect } from 'vitest';
import { bookingSchema } from '@/lib/clinic-data';
const input={patient_name:'Test Patient',phone:'+254712345678',service:'Dental check-up',preferred_date:'2099-01-01',preferred_time:'08:00',whatsapp_consent:false};
describe('Clinic booking validation',()=>{it('rejects an invalid phone number',()=>{expect(bookingSchema.safeParse({...input,phone:'7123'}).success).toBe(false);});it('rejects a past appointment date',()=>{expect(bookingSchema.safeParse({...input,preferred_date:'2000-01-01'}).success).toBe(false);});it('accepts a request without WhatsApp consent',()=>{expect(bookingSchema.parse(input).whatsapp_consent).toBe(false);});});
