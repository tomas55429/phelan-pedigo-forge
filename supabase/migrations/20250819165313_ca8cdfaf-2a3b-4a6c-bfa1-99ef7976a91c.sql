-- Add weight column to product_size_sets table
ALTER TABLE public.product_size_sets 
ADD COLUMN weight text;