import { z } from 'zod';
import { services, times } from './clinic-data';
export const adultRows = [[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]];
export const primaryRows = [[55,54,53,52,51,61,62,63,64,65],[85,84,83,82,81,71,72,73,74,75]];
export const validTeeth = [...adultRows.flat(), ...primaryRows.flat()];
export function toggleTooth(teeth:number[], tooth:number) { return teeth.includes(tooth) ? teeth.filter(t=>t!==tooth) : [...teeth,tooth].sort((a,b)=>a-b); }
export const patientEditSchema = z.object({
 id:z.string().uuid(), patient_name:z.string().trim().min(2).max(100),
 phone:z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Use a phone number with a country code'),
 service:z.enum(services), preferred_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), preferred_time:z.enum(times),
 status:z.enum(['requested','confirmed','cancelled']), treatment_notes:z.string().max(5000),
 treated_teeth:z.array(z.number().int().refine(t=>validTeeth.includes(t))).max(52).refine(t=>new Set(t).size===t.length),
}).refine(d=>d.service!=='Optical consultation'||d.treated_teeth.length===0,'Optical records cannot include dental teeth');