-- Create product variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- e.g., "5058-11A", "5058-11B"
  variant_description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for product_variants
CREATE POLICY "Product variants are publicly readable" 
ON public.product_variants 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert product variants" 
ON public.product_variants 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variants" 
ON public.product_variants 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete product variants" 
ON public.product_variants 
FOR DELETE 
USING (is_admin());

-- Add variant_id to product_specifications table
ALTER TABLE public.product_specifications 
ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Add variant_id to product_features table  
ALTER TABLE public.product_features 
ADD COLUMN variant_id UUID REFERENCES public.product_features(id) ON DELETE CASCADE;

-- Add trigger for automatic timestamp updates on product_variants
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_specifications_variant_id ON public.product_specifications(variant_id);
CREATE INDEX idx_product_features_variant_id ON public.product_features(variant_id);