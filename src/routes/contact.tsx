import { createFileRoute } from '@tanstack/react-router';
import { ClinicSite, ContactPage } from '@/components/clinic/site';
export const Route=createFileRoute('/contact')({head:()=>({meta:[{title:'Contact Pioneer Clinic | Call & WhatsApp'},{name:'description',content:'Call Pioneer Dental & Optical Clinic on +254 705 188 578. Opening hours 8:00 AM–8:00 PM.'},{property:'og:title',content:'Contact Pioneer Clinic | Call & WhatsApp'},{property:'og:description',content:'Get in touch with Pioneer to plan your appointment.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Contact});
function Contact(){return <ClinicSite><ContactPage/></ClinicSite>;}
