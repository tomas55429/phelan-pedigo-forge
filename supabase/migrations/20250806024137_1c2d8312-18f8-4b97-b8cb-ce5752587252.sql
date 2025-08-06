-- Migration to support independent variant features
-- First, let's ensure all features are associated with variants

-- Create a temporary function to associate orphaned features with the first variant of each product
DO $$
DECLARE
    feature_record RECORD;
    first_variant_id UUID;
BEGIN
    -- For each feature that doesn't have a variant_id but has a product_id
    FOR feature_record IN 
        SELECT pf.id, pf.product_id 
        FROM product_features pf 
        WHERE pf.variant_id IS NULL AND pf.product_id IS NOT NULL
    LOOP
        -- Find the first variant for this product
        SELECT pv.id INTO first_variant_id
        FROM product_variants pv 
        WHERE pv.product_id = feature_record.product_id 
        ORDER BY pv.created_at ASC 
        LIMIT 1;
        
        -- If we found a variant, associate the feature with it
        IF first_variant_id IS NOT NULL THEN
            UPDATE product_features 
            SET variant_id = first_variant_id 
            WHERE id = feature_record.id;
        END IF;
    END LOOP;
END $$;

-- Now make variant_id required for all features (no more product-level features)
ALTER TABLE product_features 
ALTER COLUMN variant_id SET NOT NULL;

-- Add a comment to clarify the new structure
COMMENT ON TABLE product_features IS 'Features are now exclusively associated with variants. Product-level features are derived by combining variant features.';

-- Create an index for better performance when querying features by variant
CREATE INDEX IF NOT EXISTS idx_product_features_variant_id ON product_features(variant_id);

-- Create an index for better performance when querying features by product through variants
CREATE INDEX IF NOT EXISTS idx_product_features_product_variant ON product_features(variant_id, product_id);