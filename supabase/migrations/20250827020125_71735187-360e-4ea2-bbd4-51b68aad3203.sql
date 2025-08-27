-- Update all functions to be secure with proper search_path
CREATE OR REPLACE FUNCTION find_product_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image_url text,
  special_notes text,
  model_3d_url text,
  category_id uuid,
  featured boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.image_url, p.special_notes, p.model_3d_url, 
         p.category_id, p.featured, p.created_at, p.updated_at
  FROM products p
  WHERE p.id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_custom_product_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  main_image_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cp.id, cp.name, cp.description, cp.main_image_url, cp.created_at, cp.updated_at
  FROM custom_products cp
  WHERE cp.id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_product_categories_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  category_id uuid,
  created_at timestamp with time zone,
  category_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.product_id, pc.category_id, pc.created_at, c.name as category_name
  FROM product_categories pc
  JOIN categories c ON pc.category_id = c.id
  WHERE pc.product_id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_product_variants_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  variant_name text,
  variant_description text,
  image_url text,
  model_3d_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pv.id, pv.product_id, pv.variant_name, pv.variant_description, 
         pv.image_url, pv.model_3d_url, pv.created_at, pv.updated_at
  FROM product_variants pv
  WHERE pv.product_id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_product_features_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  variant_id uuid,
  feature text,
  is_optional boolean,
  image_url text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pf.id, pf.product_id, pf.variant_id, pf.feature, pf.is_optional, 
         pf.image_url, pf.created_at
  FROM product_features pf
  WHERE pf.product_id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_product_specifications_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  variant_id uuid,
  specification_key text,
  specification_value text,
  sort_order integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ps.id, ps.product_id, ps.variant_id, ps.specification_key, 
         ps.specification_value, ps.sort_order, ps.created_at
  FROM product_specifications ps
  WHERE ps.product_id::text LIKE prefix_text || '%';
END;
$$;

CREATE OR REPLACE FUNCTION find_custom_product_images_by_prefix(prefix_text text)
RETURNS TABLE (
  id uuid,
  custom_product_id uuid,
  image_url text,
  description text,
  sort_order integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cpi.id, cpi.custom_product_id, cpi.image_url, cpi.description, 
         cpi.sort_order, cpi.created_at
  FROM custom_product_images cpi
  WHERE cpi.custom_product_id::text LIKE prefix_text || '%';
END;
$$;