import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { patientEditSchema } from './dental-chart';
export const getDoctorRecords=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:approved,error:roleError}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'doctor'});
 if(roleError)throw new Error('Could not check doctor access. Please try again.');
 if(!approved)return {approved:false as const, name:'',records:[]};
 const {data:profile}=await context.supabase.from('profiles').select('display_name').eq('id',context.userId).single();
 const {data:records,error}=await context.supabase.from('patient_records').select('*').order('preferred_date',{ascending:false});
 if(error)throw new Error('Patient records could not be loaded.');
 return {approved:true as const,name:profile?.display_name||'Doctor',records:records??[]};
});
export const doctorRecordsOptions=()=>queryOptions({queryKey:['doctor-records'],queryFn:()=>getDoctorRecords()});
export const updatePatient=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>patientEditSchema.parse(input)).handler(async({data,context})=>{
 const {data:approved,error:roleError}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'doctor'});
 if(roleError||!approved)throw new Error('Clinic-approved doctor access is required.');
 const {id,...changes}=data;
 const {data:row,error}=await context.supabase.from('patient_records').update({...changes,updated_by:context.userId,updated_at:new Date().toISOString()}).eq('id',id).select('id').single();
 if(error||!row)throw new Error('Changes could not be saved. Please try again.');
 return {id:row.id};
});