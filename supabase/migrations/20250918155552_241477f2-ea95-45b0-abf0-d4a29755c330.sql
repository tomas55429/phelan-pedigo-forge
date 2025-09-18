-- Update the handle_new_user function to include Richard@phelanmfgcorp.com as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email IN ('admin@phelanmanufacturing.com', 'Richard@phelanmfgcorp.com') THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  );
  RETURN new;
END;
$function$