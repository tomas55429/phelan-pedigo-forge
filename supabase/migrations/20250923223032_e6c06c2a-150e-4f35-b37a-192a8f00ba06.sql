-- Create public_product_configs table for dimension configurations
CREATE TABLE public.public_product_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_product_configs ENABLE ROW LEVEL SECURITY;

-- Create policies - publicly readable, admin writable
CREATE POLICY "Product configs are publicly readable" 
ON public.public_product_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert product configs" 
ON public.public_product_configs 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product configs" 
ON public.public_product_configs 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete product configs" 
ON public.public_product_configs 
FOR DELETE 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_public_product_configs_updated_at
BEFORE UPDATE ON public.public_product_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing dimension configuration data from admin_settings
INSERT INTO public.public_product_configs (config_key, config_value)
SELECT setting_key, setting_value 
FROM public.admin_settings 
WHERE setting_key LIKE 'product_dimensions_%'
ON CONFLICT (config_key) DO NOTHING;

-- Create index for better performance
CREATE INDEX idx_public_product_configs_key ON public.public_product_configs(config_key);