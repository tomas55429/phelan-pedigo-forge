CREATE OR REPLACE FUNCTION public.find_product_variants_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, product_id uuid, variant_name text, variant_description text, image_url text, model_3d_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT pv.id, pv.product_id, pv.variant_name, pv.variant_description, 
         pv.image_url, pv.model_3d_url, pv.created_at, pv.updated_at
  FROM product_variants pv
  JOIN products p ON pv.product_id = p.id
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;