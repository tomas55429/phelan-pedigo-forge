-- Add is_optional column to product_features table
ALTER TABLE public.product_features 
ADD COLUMN is_optional BOOLEAN DEFAULT FALSE;