-- Update the handle_new_user function to use lowercase email for consistency
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
      WHEN new.email IN ('admin@phelanmanufacturing.com', 'richard@phelanmfgcorp.com') THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  );
  RETURN new;
END;
$function$