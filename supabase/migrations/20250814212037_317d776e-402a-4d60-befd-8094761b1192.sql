-- Create product_size_sets table for structured size management
CREATE TABLE public.product_size_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  variant_id UUID NULL,
  set_index INTEGER NOT NULL DEFAULT 0,
  width TEXT NULL,
  length TEXT NULL,
  depth TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_size_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for product_size_sets
CREATE POLICY "Product size sets are publicly readable" 
ON public.product_size_sets 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert product size sets" 
ON public.product_size_sets 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product size sets" 
ON public.product_size_sets 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete product size sets" 
ON public.product_size_sets 
FOR DELETE 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_size_sets_updated_at
BEFORE UPDATE ON public.product_size_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_product_size_sets_product_id ON public.product_size_sets(product_id);
CREATE INDEX idx_product_size_sets_variant_id ON public.product_size_sets(variant_id);
CREATE INDEX idx_product_size_sets_set_index ON public.product_size_sets(product_id, variant_id, set_index);

-- Migrate existing size specifications to size sets
WITH size_groups AS (
  SELECT 
    product_id,
    variant_id,
    sort_order,
    MAX(CASE WHEN specification_key = 'Width' THEN specification_value END) as width,
    MAX(CASE WHEN specification_key = 'Length' THEN specification_value END) as length,
    MAX(CASE WHEN specification_key = 'Depth' THEN specification_value END) as depth
  FROM public.product_specifications 
  WHERE specification_key IN ('Width', 'Length', 'Depth')
  GROUP BY product_id, variant_id, sort_order
  HAVING COUNT(*) > 0
)
INSERT INTO public.product_size_sets (product_id, variant_id, set_index, width, length, depth)
SELECT 
  product_id,
  variant_id,
  COALESCE(sort_order, 0) as set_index,
  width,
  length,
  depth
FROM size_groups
ORDER BY product_id, variant_id, set_index;