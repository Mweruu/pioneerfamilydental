import { createFileRoute } from '@tanstack/react-router';
import { ClinicSite, AboutPage } from '@/components/clinic/site';
export const Route=createFileRoute('/about')({head:()=>({meta:[{title:'About Pioneer | Family Dental & Optical Clinic'},{name:'description',content:'Meet Pioneer Family Dental & Optical Clinic, bringing dental and optical care together under one roof.'},{property:'og:title',content:'About Pioneer | Family Dental & Optical Clinic'},{property:'og:description',content:'A welcoming clinic for your whole family.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:About});
function About(){return <ClinicSite><AboutPage/></ClinicSite>;}
