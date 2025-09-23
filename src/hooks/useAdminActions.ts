import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { QUERY_KEYS } from './useProductData';
import { supabase } from '@/integrations/supabase/client';

// Hook for admin actions that need to invalidate caches
export const useAdminActions = () => {
  const queryClient = useQueryClient();

  const invalidateAllProductData = () => {
    console.log('🔄 Invalidating all product data caches...');
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'product' || 
               query.queryKey.includes('product-variants') ||
               query.queryKey.includes('product-features') ||
               query.queryKey.includes('product-specifications') ||
               query.queryKey.includes('product-size-sets');
      }
    });
    
    toast({
      title: "Cache Updated",
      description: "Product data has been refreshed across all pages.",
    });
  };

  const invalidateProductDetail = (productSlug: string) => {
    console.log(`🔄 Invalidating product detail cache for ${productSlug}...`);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
  };

  // Wrapper functions for common admin operations
  const createProduct = async (productData: any) => {
    const result = await supabase.from('products').insert([productData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateProduct = async (id: string, productData: any) => {
    const result = await supabase.from('products').update(productData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteProduct = async (id: string) => {
    const result = await supabase.from('products').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const createProductVariant = async (variantData: any) => {
    const result = await supabase.from('product_variants').insert([variantData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateProductVariant = async (id: string, variantData: any) => {
    const result = await supabase.from('product_variants').update(variantData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteProductVariant = async (id: string) => {
    const result = await supabase.from('product_variants').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const createProductFeature = async (featureData: any) => {
    const result = await supabase.from('product_features').insert([featureData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateProductFeature = async (id: string, featureData: any) => {
    const result = await supabase.from('product_features').update(featureData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteProductFeature = async (id: string) => {
    const result = await supabase.from('product_features').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const createProductSpecification = async (specData: any) => {
    const result = await supabase.from('product_specifications').insert([specData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateProductSpecification = async (id: string, specData: any) => {
    const result = await supabase.from('product_specifications').update(specData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteProductSpecification = async (id: string) => {
    const result = await supabase.from('product_specifications').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateProductSizeSet = async (productId: string, sizeSets: any[]) => {
    // Delete existing size sets
    await supabase.from('product_size_sets').delete().eq('product_id', productId);
    
    // Insert new size sets
    const result = await supabase.from('product_size_sets').insert(
      sizeSets.map(set => ({ ...set, product_id: productId }))
    );
    
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const createCustomProduct = async (customProductData: any) => {
    const result = await supabase.from('custom_products').insert([customProductData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateCustomProduct = async (id: string, customProductData: any) => {
    const result = await supabase.from('custom_products').update(customProductData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteCustomProduct = async (id: string) => {
    const result = await supabase.from('custom_products').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const createCustomProductImage = async (imageData: any) => {
    const result = await supabase.from('custom_product_images').insert([imageData]);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateCustomProductImage = async (id: string, imageData: any) => {
    const result = await supabase.from('custom_product_images').update(imageData).eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const deleteCustomProductImage = async (id: string) => {
    const result = await supabase.from('custom_product_images').delete().eq('id', id);
    if (!result.error) {
      invalidateAllProductData();
    }
    return result;
  };

  const updateAdminSettings = async (settingKey: string, settingValue: any) => {
    // Check if this is a dimension config setting
    if (settingKey.startsWith('product_dimensions_')) {
      // Use the new public_product_configs table for dimension settings
      const result = await supabase
        .from('public_product_configs')
        .upsert({ 
          config_key: settingKey, 
          config_value: settingValue, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'config_key' });
      if (!result.error) {
        invalidateAllProductData();
      }
      return result;
    } else {
      // Use admin_settings for other settings
      const result = await supabase
        .from('admin_settings')
        .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
        .eq('setting_key', settingKey);
      if (!result.error) {
        invalidateAllProductData();
      }
      return result;
    }
  };

  return {
    invalidateAllProductData,
    invalidateProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
    createProductFeature,
    updateProductFeature,
    deleteProductFeature,
    createProductSpecification,
    updateProductSpecification,
    deleteProductSpecification,
    updateProductSizeSet,
    createCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    createCustomProductImage,
    updateCustomProductImage,
    deleteCustomProductImage,
    updateAdminSettings,
  };
};