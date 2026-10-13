import { describe, it, expect } from 'vitest';
import { patientEditSchema, toggleTooth, validTeeth } from '@/lib/dental-chart';
import { bookingSchema } from '@/lib/clinic-data';
const guest={patient_name:'Guest Patient',phone:'+254712345678',service:'Dental check-up',preferred_date:'2099-01-01',preferred_time:'08:00',whatsapp_consent:false};
const edit={...guest,id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',status:'requested',treated_teeth:[11,26],treatment_notes:'Filling'};
describe('Doctor patient records',()=>{
 it('accepts patient booking without login credentials',()=>{expect(bookingSchema.parse(guest).patient_name).toBe('Guest Patient');});
 it('stores multiple treated teeth',()=>{expect(patientEditSchema.parse(edit).treated_teeth).toEqual([11,26]);});
 it('rejects invalid tooth numbers',()=>{expect(patientEditSchema.safeParse({...edit,treated_teeth:[19]}).success).toBe(false);});
 it('supports primary teeth',()=>{expect(validTeeth).toContain(55);expect(patientEditSchema.parse({...edit,treated_teeth:[55,81]}).treated_teeth).toEqual([55,81]);});
 it('deselects a treated tooth independently',()=>{expect(toggleTooth([11,26],11)).toEqual([26]);});
 it('rejects teeth on optical records',()=>{expect(patientEditSchema.safeParse({...edit,service:'Optical consultation'}).success).toBe(false);});
});