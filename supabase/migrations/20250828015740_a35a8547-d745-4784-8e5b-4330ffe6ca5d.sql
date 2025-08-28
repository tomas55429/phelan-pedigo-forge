CREATE OR REPLACE FUNCTION public.find_custom_product_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, name text, description text, main_image_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT cp.id, cp.name, cp.description, cp.main_image_url, cp.created_at, cp.updated_at
  FROM custom_products cp
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(cp.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;