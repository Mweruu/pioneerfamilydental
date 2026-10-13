CREATE TYPE public.app_role AS ENUM ('doctor');
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 100));
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_doctor_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles(id,display_name) VALUES (NEW.id,left(coalesce(NEW.raw_user_meta_data->>'display_name',''),100)); RETURN NEW; END; $$;
CREATE TRIGGER create_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_doctor_profile();
INSERT INTO public.profiles(id,display_name) SELECT id,left(coalesce(raw_user_meta_data->>'display_name',''),100) FROM auth.users ON CONFLICT DO NOTHING;
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE TABLE public.patient_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_appointment_id uuid UNIQUE, user_id uuid,
 patient_name text NOT NULL CHECK(char_length(patient_name) BETWEEN 2 AND 100),
 phone text NOT NULL CHECK(phone ~ '^\+[1-9][0-9]{7,14}$'),
 service text NOT NULL CHECK(service IN ('Dental check-up','Scaling & polishing','Teeth whitening','Braces & orthodontics','Dental emergency','Optical consultation')),
 preferred_date date NOT NULL, preferred_time text NOT NULL CHECK(preferred_time IN ('08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00')),
 whatsapp_consent boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','confirmed','cancelled')),
 treated_teeth integer[] NOT NULL DEFAULT '{}', treatment_notes text NOT NULL DEFAULT '' CHECK(char_length(treatment_notes) <= 5000),
 updated_by uuid, updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(treated_teeth <@ ARRAY[11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48,51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85]),
 CHECK(service <> 'Optical consultation' OR cardinality(treated_teeth) = 0)
);
GRANT INSERT, SELECT, UPDATE ON public.patient_records TO authenticated;
GRANT INSERT ON public.patient_records TO anon;
GRANT ALL ON public.patient_records TO service_role;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guest appointment requests" ON public.patient_records FOR INSERT TO anon WITH CHECK(user_id IS NULL AND source_appointment_id IS NULL AND status = 'requested' AND cardinality(treated_teeth)=0 AND treatment_notes='' AND updated_by IS NULL);
CREATE POLICY "Patient appointment requests" ON public.patient_records FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND source_appointment_id IS NULL AND status='requested' AND cardinality(treated_teeth)=0 AND treatment_notes='' AND updated_by IS NULL);
CREATE POLICY "Patients read own records" ON public.patient_records FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Approved doctors read records" ON public.patient_records FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Approved doctors edit records" ON public.patient_records FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'doctor')) WITH CHECK(public.has_role(auth.uid(),'doctor') AND updated_by=auth.uid());
INSERT INTO public.patient_records(id,source_appointment_id,user_id,patient_name,phone,service,preferred_date,preferred_time,whatsapp_consent,status,created_at) SELECT id,id,user_id,patient_name,phone,service,preferred_date,preferred_time,whatsapp_consent,status,created_at FROM public.appointments;
CREATE TRIGGER validate_patient_request BEFORE INSERT ON public.patient_records FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_request();
COMMENT ON TABLE public.appointments IS 'DEPRECATED: appointment requests now use public.patient_records; original patient records preserved.';
CREATE INDEX patient_records_visit_idx ON public.patient_records(preferred_date,preferred_time);