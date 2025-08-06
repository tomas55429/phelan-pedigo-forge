-- Add show_on_homepage column to categories table
ALTER TABLE public.categories 
ADD COLUMN show_on_homepage boolean NOT NULL DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.categories.show_on_homepage IS 'Controls whether this category appears in the homepage categories section';