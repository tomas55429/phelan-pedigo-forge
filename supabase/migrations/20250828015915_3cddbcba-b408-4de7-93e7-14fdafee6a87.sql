CREATE OR REPLACE FUNCTION public.find_product_categories_by_name_slug(slug_text text)
 RETURNS TABLE(id uuid, product_id uuid, category_id uuid, created_at timestamp with time zone, category_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.product_id, pc.category_id, pc.created_at, c.name as category_name
  FROM product_categories pc
  JOIN categories c ON pc.category_id = c.id
  JOIN products p ON pc.product_id = p.id
  WHERE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) = LOWER(slug_text);
END;
$function$;