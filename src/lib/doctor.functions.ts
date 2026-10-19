import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { patientEditSchema } from './dental-chart';
type Ctx={supabase:any;userId:string};
async function roles(context:Ctx){
 const [d,a]=await Promise.all([context.supabase.rpc('has_role',{_user_id:context.userId,_role:'doctor'}),context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'})]);
 if(d.error||a.error)throw new Error('Could not check access. Please try again.');
 return {doctor:!!d.data,admin:!!a.data};
}
export const getDoctorRecords=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const r=await roles(context);
 if(!r.doctor&&!r.admin)return {approved:false as const,admin:false,name:'',records:[]};
 const {data:profile}=await context.supabase.from('profiles').select('display_name').eq('id',context.userId).single();
 const {data:records,error}=await context.supabase.from('patient_records').select('*').order('preferred_date',{ascending:false});
 if(error)throw new Error('Patient records could not be loaded.');
 return {approved:true as const,admin:r.admin,name:profile?.display_name||'Doctor',records:records??[]};
});
export const doctorRecordsOptions=()=>queryOptions({queryKey:['doctor-records'],queryFn:()=>getDoctorRecords()});
export const updatePatient=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>patientEditSchema.parse(input)).handler(async({data,context})=>{
 const r=await roles(context);
 if(!r.doctor&&!r.admin)throw new Error('Clinic-approved access is required.');
 const {id,...changes}=data;
 const {data:row,error}=await context.supabase.from('patient_records').update({...changes,updated_by:context.userId,updated_at:new Date().toISOString()}).eq('id',id).select('id').single();
 if(error||!row)throw new Error('Changes could not be saved. Please try again.');
 return {id:row.id};
});
export const getStaff=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const r=await roles(context);if(!r.admin)return {admin:false as const,staff:[]};
 const {data,error}=await context.supabase.rpc('admin_list_staff');
 if(error)throw new Error('Staff could not be loaded.');
 return {admin:true as const,staff:(data??[]) as {id:string;email:string;display_name:string;is_doctor:boolean;is_admin:boolean;created_at:string}[]};
});
export const staffOptions=()=>queryOptions({queryKey:['admin-staff'],queryFn:()=>getStaff()});
export const setDoctor=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(i=>z.object({userId:z.string().uuid(),approved:z.boolean()}).parse(i)).handler(async({data,context})=>{
 const {error}=await context.supabase.rpc('admin_set_doctor',{_user_id:data.userId,_approved:data.approved});
 if(error)throw new Error('Admin access is required to change doctors.');
 return {ok:true};
});
