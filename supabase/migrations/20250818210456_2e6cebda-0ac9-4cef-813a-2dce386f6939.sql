-- Check if variant_id is already nullable in product_features table
-- If not, make it nullable so features can be added directly to products
ALTER TABLE public.product_features ALTER COLUMN variant_id DROP NOT NULL;