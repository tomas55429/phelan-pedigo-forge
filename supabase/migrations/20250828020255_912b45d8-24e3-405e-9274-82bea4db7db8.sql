CREATE OR REPLACE FUNCTION public.find_product_features_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, product_id uuid, variant_id uuid, feature text, is_optional boolean, image_url text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT pf.id, pf.product_id, pf.variant_id, pf.feature, pf.is_optional, 
         pf.image_url, pf.created_at
  FROM product_features pf
  JOIN products p ON pf.product_id = p.id
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_product_specifications_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, product_id uuid, variant_id uuid, specification_key text, specification_value text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT ps.id, ps.product_id, ps.variant_id, ps.specification_key, 
         ps.specification_value, ps.sort_order, ps.created_at
  FROM product_specifications ps
  JOIN products p ON ps.product_id = p.id
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_custom_product_images_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, custom_product_id uuid, image_url text, description text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT cpi.id, cpi.custom_product_id, cpi.image_url, cpi.description, 
         cpi.sort_order, cpi.created_at
  FROM custom_product_images cpi
  JOIN custom_products cp ON cpi.custom_product_id = cp.id
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(cp.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;