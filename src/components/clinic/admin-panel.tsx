import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { CalendarClock, CheckCircle2, Clock, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doctorRecordsOptions, staffOptions, setDoctor } from '@/lib/doctor.functions';
import { DoctorRecords } from './doctor-records';
export function AdminPanel(){
 const {data:staffData}=useSuspenseQuery(staffOptions());const {data:rec}=useSuspenseQuery(doctorRecordsOptions());
 const [tab,setTab]=useState<'overview'|'appointments'|'doctors'>('overview');
 if(!staffData.admin)return <div className="py-16"><h2 className="text-2xl font-bold">Admin access required</h2><p className="mt-3 text-muted-foreground">This account is not a clinic admin.</p></div>;
 const today=new Date(Date.now()+3*3600e3).toISOString().slice(0,10);const records=rec.records;
 const stats=[{label:"Today's appointments",value:records.filter(r=>r.preferred_date===today&&r.status!=='cancelled').length,icon:CalendarClock},{label:'Pending requests',value:records.filter(r=>r.status==='requested').length,icon:Clock},{label:'Confirmed',value:records.filter(r=>r.status==='confirmed').length,icon:CheckCircle2},{label:'Approved doctors',value:staffData.staff.filter(s=>s.is_doctor).length,icon:Stethoscope}];
 return <><div className="py-7 border-b flex flex-wrap justify-between gap-3"><div><p className="text-sm text-mint-foreground">Clinic admin</p><h1 className="text-3xl font-bold mt-1">Admin dashboard</h1></div><div className="flex gap-2 self-center">{(['overview','appointments','doctors'] as const).map(t=><Button key={t} variant={tab===t?'default':'outline'} onClick={()=>setTab(t)} className="capitalize">{t}</Button>)}</div></div>
 {tab==='overview'&&<div className="py-8 space-y-8"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(s=><div key={s.label} className="border rounded-lg p-5"><s.icon className="text-primary size-6"/><div className="text-3xl font-bold mt-3">{s.value}</div><div className="text-sm text-muted-foreground">{s.label}</div></div>)}</div><div><h2 className="text-lg font-semibold mb-3">Upcoming requests</h2><div className="border rounded-lg divide-y">{records.filter(r=>r.preferred_date>=today&&r.status==='requested').slice(0,8).map(r=><div key={r.id} className="p-4 flex flex-wrap justify-between gap-2 text-sm"><span><strong>{r.patient_name}</strong> · {r.service}</span><span className="text-muted-foreground">{r.preferred_date} · {r.preferred_time} EAT</span></div>)}{!records.some(r=>r.preferred_date>=today&&r.status==='requested')&&<p className="p-4 text-sm text-muted-foreground">No pending upcoming requests.</p>}</div></div></div>}
 {tab==='appointments'&&<DoctorRecords/>}
 {tab==='doctors'&&<StaffList staff={staffData.staff}/>}</>;
}
function StaffList({staff}:{staff:{id:string;email:string;display_name:string;is_doctor:boolean;is_admin:boolean}[]}){
 const fn=useServerFn(setDoctor);const qc=useQueryClient();const [busy,setBusy]=useState('');const [error,setError]=useState('');
 async function toggle(id:string,approved:boolean){setBusy(id);setError('');try{await fn({data:{userId:id,approved}});await qc.invalidateQueries({queryKey:['admin-staff']});}catch(e){setError(e instanceof Error?e.message:'Could not update.');}finally{setBusy('');}}
 return <div className="py-8"><p className="text-sm text-muted-foreground mb-4">Doctors register on the doctor portal, then appear here for approval.</p>{error&&<p role="alert" className="text-destructive text-sm mb-3">{error}</p>}<div className="border rounded-lg divide-y">{staff.map(s=><div key={s.id} className="p-4 flex flex-wrap items-center justify-between gap-3"><div><strong>{s.display_name||'Unnamed'}</strong>{s.is_admin&&<span className="ml-2 text-xs bg-mint text-mint-foreground px-2 py-1 rounded">Admin</span>}<div className="text-sm text-muted-foreground">{s.email}</div></div>{s.is_doctor?<Button variant="outline" disabled={busy===s.id} onClick={()=>toggle(s.id,false)}>Remove doctor access</Button>:<Button disabled={busy===s.id} onClick={()=>toggle(s.id,true)}>Approve as doctor</Button>}</div>)}</div></div>;
}
