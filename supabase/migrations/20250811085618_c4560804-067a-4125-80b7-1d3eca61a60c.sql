-- Create custom_products table
CREATE TABLE public.custom_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  main_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_product_images table
CREATE TABLE public.custom_product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_product_id UUID NOT NULL REFERENCES public.custom_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_product_images ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_products
CREATE POLICY "Custom products are publicly readable" 
ON public.custom_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert custom products" 
ON public.custom_products 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update custom products" 
ON public.custom_products 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete custom products" 
ON public.custom_products 
FOR DELETE 
USING (is_admin());

-- Create policies for custom_product_images
CREATE POLICY "Custom product images are publicly readable" 
ON public.custom_product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert custom product images" 
ON public.custom_product_images 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update custom product images" 
ON public.custom_product_images 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete custom product images" 
ON public.custom_product_images 
FOR DELETE 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_products_updated_at
BEFORE UPDATE ON public.custom_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_custom_product_images_product_id ON public.custom_product_images(custom_product_id);
CREATE INDEX idx_custom_product_images_sort_order ON public.custom_product_images(sort_order);