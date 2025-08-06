-- Fix the incorrect foreign key constraint
-- Drop the incorrect self-referencing foreign key
ALTER TABLE product_features 
DROP CONSTRAINT IF EXISTS product_features_variant_id_fkey;

-- Add the correct foreign key constraint pointing to product_variants
ALTER TABLE product_features 
ADD CONSTRAINT product_features_variant_id_fkey 
FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

-- Now associate all product-level features with their product's first variant
-- Step 1: Create a temporary table to map products to their first variants
CREATE TEMP TABLE first_variants AS
SELECT DISTINCT ON (product_id) 
  product_id, 
  id as first_variant_id
FROM product_variants 
ORDER BY product_id, created_at ASC;

-- Step 2: Update product features to be associated with the first variant of each product
UPDATE product_features pf
SET variant_id = fv.first_variant_id
FROM first_variants fv
WHERE pf.product_id = fv.product_id 
AND pf.variant_id IS NULL;

-- Step 3: Now make variant_id required for all features
ALTER TABLE product_features 
ALTER COLUMN variant_id SET NOT NULL;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_features_variant_id ON product_features(variant_id);

-- Step 5: Add a comment to clarify the new structure
COMMENT ON TABLE product_features IS 'Features are now exclusively associated with variants. Product-level features are derived by combining variant features.';