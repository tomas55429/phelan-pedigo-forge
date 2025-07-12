-- Add special_notes column to products table
ALTER TABLE public.products 
ADD COLUMN special_notes TEXT;