-- Add image_url column to product_features table for accessory images
ALTER TABLE public.product_features 
ADD COLUMN image_url TEXT;