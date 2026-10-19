CREATE POLICY "Admins read records" ON public.patient_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins edit records" ON public.patient_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND updated_by = auth.uid());

CREATE OR REPLACE FUNCTION public.admin_list_staff()
RETURNS TABLE(id uuid, email text, display_name text, is_doctor boolean, is_admin boolean, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  RETURN QUERY SELECT u.id, u.email::text, coalesce(p.display_name,''),
    EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u.id AND r.role='doctor'),
    EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u.id AND r.role='admin'),
    u.created_at
  FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id ORDER BY u.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_doctor(_user_id uuid, _approved boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF _approved THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id,'doctor') ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id=_user_id AND role='doctor';
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.admin_list_staff() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_doctor(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_doctor(uuid, boolean) TO authenticated;