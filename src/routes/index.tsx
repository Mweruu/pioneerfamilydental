import { createFileRoute } from '@tanstack/react-router';
import { ClinicSite, HomePage } from '@/components/clinic/site';
export const Route=createFileRoute('/')({head:()=>({meta:[{title:'Pioneer Dental & Optical Clinic | Book Your Visit'},{name:'description',content:'Family dental and optical care at Pioneer. Request your appointment, or call +254 705 188 578.'},{property:'og:title',content:'Pioneer Dental & Optical Clinic | Book Your Visit'},{property:'og:description',content:'Brighter smiles. Clearer vision. Request your family’s next visit at Pioneer.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Index});
function Index(){return <ClinicSite><HomePage/></ClinicSite>;}
