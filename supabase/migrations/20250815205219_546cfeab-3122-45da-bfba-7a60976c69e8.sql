-- Add a 4th optional size specification column to product_size_sets table
ALTER TABLE public.product_size_sets 
ADD COLUMN height text;