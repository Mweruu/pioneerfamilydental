import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bookingSchema } from './clinic-data';
export const requestAppointment = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>bookingSchema.parse(input)).handler(async ({data,context})=>{
 const {data:row,error} = await context.supabase.from('appointments').insert({...data,user_id:context.userId}).select('id,service,preferred_date,preferred_time,status').single();
 if(error) throw new Error('Your request could not be saved. Please try again.');
 return row;
});
