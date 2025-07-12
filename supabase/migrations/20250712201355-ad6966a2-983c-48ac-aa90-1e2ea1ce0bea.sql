-- Add sort_order column to product_specifications table
ALTER TABLE public.product_specifications 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_product_specifications_sort_order 
ON public.product_specifications(product_id, sort_order);