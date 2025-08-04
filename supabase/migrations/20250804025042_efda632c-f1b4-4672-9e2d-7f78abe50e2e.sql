-- Add 3D model URL field to product_variants table
ALTER TABLE public.product_variants 
ADD COLUMN model_3d_url TEXT;