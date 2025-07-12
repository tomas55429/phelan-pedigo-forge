-- Add 3D model URL column to products table
ALTER TABLE public.products 
ADD COLUMN model_3d_url TEXT;

-- Create a storage bucket for 3D model files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-3d-models', 'product-3d-models', true);

-- Create policies for 3D model uploads
CREATE POLICY "3D models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-3d-models');

CREATE POLICY "Authenticated users can upload 3D models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update 3D models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete 3D models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-3d-models' AND auth.role() = 'authenticated');