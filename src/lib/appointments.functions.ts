import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { bookingSchema } from './clinic-data';
export const requestAppointment = createServerFn({method:'POST'}).inputValidator(input=>bookingSchema.parse(input)).handler(async ({data})=>{
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key) throw new Error('Booking is temporarily unavailable. Please call the clinic.');
 const authorization=getRequestHeader('authorization');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:authorization?{Authorization:authorization}:{},fetch:(input,init)=>{const headers=new Headers(init?.headers);if(headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
 let userId:string|null=null;
 if(authorization){if(!authorization.startsWith('Bearer '))throw new Error('Invalid session. Please refresh.');const {data:auth,error}=await client.auth.getUser(authorization.slice(7));if(error||!auth.user)throw new Error('Your session expired. Please refresh.');userId=auth.user.id;}
 const {error} = await client.from('patient_records').insert({...data,user_id:userId});
 if(error) throw new Error('Your request could not be saved. Please try again.');
 return {status:'requested' as const};
});
