CREATE OR REPLACE FUNCTION public.find_product_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, name text, description text, image_url text, special_notes text, model_3d_url text, category_id uuid, featured boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.image_url, p.special_notes, p.model_3d_url, 
         p.category_id, p.featured, p.created_at, p.updated_at
  FROM products p
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;