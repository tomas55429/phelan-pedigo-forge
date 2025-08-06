-- Create many-to-many relationship between products and categories
-- First, create the junction table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS on the new table
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for the junction table
CREATE POLICY "Product categories are publicly readable" 
ON public.product_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert product categories" 
ON public.product_categories 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product categories" 
ON public.product_categories 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete product categories" 
ON public.product_categories 
FOR DELETE 
USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);

-- Migrate existing data: copy current category relationships to the new table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id 
FROM public.products 
WHERE category_id IS NOT NULL;

-- Add a comment to document the new structure
COMMENT ON TABLE public.product_categories IS 'Junction table for many-to-many relationship between products and categories';

-- Keep the old category_id column for now (we'll remove it later after updating the code)
-- This ensures backward compatibility during the transition