CREATE TABLE public.appointments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 patient_name text NOT NULL CHECK (char_length(patient_name) BETWEEN 2 AND 100),
 phone text NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
 service text NOT NULL CHECK (service IN ('Dental check-up','Scaling & polishing','Teeth whitening','Braces & orthodontics','Dental emergency','Optical consultation')),
 preferred_date date NOT NULL,
 preferred_time text NOT NULL CHECK (preferred_time IN ('08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00')),
 whatsapp_consent boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients read own appointment requests" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Patients create own requests" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'requested');
CREATE INDEX appointments_user_idx ON public.appointments(user_id);
CREATE FUNCTION public.validate_appointment_request() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN IF NEW.preferred_date < (now() AT TIME ZONE 'Africa/Nairobi')::date THEN RAISE EXCEPTION 'Choose today or a future date'; END IF; RETURN NEW; END; $$;
CREATE TRIGGER validate_appointment_before_insert BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_request();