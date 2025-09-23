import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Query keys for React Query
export const QUERY_KEYS = {
  PRODUCTS: ['products'],
  CATEGORIES: ['categories'],
  PRODUCT_DETAIL: (slug: string) => ['product', slug],
  CUSTOM_PRODUCTS: ['custom-products'],
  CUSTOM_PRODUCT_IMAGES: ['custom-product-images'],
  PRODUCT_VARIANTS: (productId: string) => ['product-variants', productId],
  PRODUCT_FEATURES: (productId: string) => ['product-features', productId],
  PRODUCT_SPECIFICATIONS: (productId: string) => ['product-specifications', productId],
  PRODUCT_SIZE_SETS: (productId: string) => ['product-size-sets', productId],
} as const;

// Hook for fetching all products with real-time updates
export const useProducts = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const query = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: async () => {
      console.log('🔄 Fetching products...');
      
      // Fetch all data in parallel
      const [
        productsRes,
        categoriesRes,
        variantsRes,
        featuresRes,
        specificationsRes,
        productCategoriesRes,
        customProductsRes,
        customProductImagesRes,
        sizeSetsRes
      ] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('product_variants').select('*'),
        supabase.from('product_features').select('*'),
        supabase.from('product_specifications').select('*'),
        supabase.from('product_categories').select('*'),
        supabase.from('custom_products').select('*').order('name'),
        supabase.from('custom_product_images').select('*').order('sort_order'),
        supabase.from('product_size_sets').select('*').order('set_index')
      ]);

      // Check for errors
      const errors = [
        productsRes.error,
        categoriesRes.error,
        variantsRes.error,
        featuresRes.error,
        specificationsRes.error,
        productCategoriesRes.error,
        customProductsRes.error,
        customProductImagesRes.error,
        sizeSetsRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Failed to fetch data: ${errors[0]?.message}`);
      }

      const products = productsRes.data || [];
      const categoriesData = categoriesRes.data || [];
      const variants = variantsRes.data || [];
      const features = featuresRes.data || [];
      const specifications = specificationsRes.data || [];
      const productCategories = productCategoriesRes.data || [];
      const customProducts = customProductsRes.data || [];
      const customProductImages = customProductImagesRes.data || [];

      console.log('✅ Fetched data:', {
        products: products.length,
        customProducts: customProducts.length,
        customProductImages: customProductImages.length
      });

      // Find "Custom Products" category
      const customCategory = categoriesData.find(cat => cat.name === 'Custom Products');

      // Convert custom products to regular products format
      const customProductsAsProducts = customProducts.map(customProduct => ({
        id: `custom-${customProduct.id}`,
        name: customProduct.name,
        description: customProduct.description,
        image_url: customProduct.main_image_url,
        category_id: customCategory?.id || null,
        featured: false,
        created_at: customProduct.created_at,
        updated_at: customProduct.updated_at,
        special_notes: null,
        model_3d_url: null
      }));

      const allProducts = [...products, ...customProductsAsProducts];

      // Group data by product
      const productsWithDetails = allProducts.map(product => {
        const isPrefixedCustom = product.id.toString().startsWith('custom-');
        const customProductIdFromPrefix = isPrefixedCustom ? product.id.toString().replace('custom-', '') : null;
        const customProductIdFromDescription = product.description ? product.description.match(/\[Custom Product ID:\s*([^\]]+)\]/i)?.[1] || null : null;
        const customProductId = customProductIdFromPrefix || customProductIdFromDescription;

        // Collect additional images if this is (or references) a custom product
        let additionalImages: any[] = [];
        if (customProductId) {
          additionalImages = customProductImages
            .filter(img => String(img.custom_product_id).trim() === String(customProductId).trim())
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(img => ({
              id: img.id,
              image_url: img.image_url,
              description: img.description || 'Additional Image',
              sort_order: img.sort_order
            }));
        }

        // Fallback: Try matching by product name if no images found and this looks like a custom product
        if (additionalImages.length === 0 && (isPrefixedCustom || product.name.toLowerCase().includes('custom'))) {
          const matchingCustomProduct = customProducts.find(cp => 
            cp.name.toLowerCase().replace(/[^a-z0-9]/g, '') === product.name.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (matchingCustomProduct) {
            additionalImages = customProductImages
              .filter(img => String(img.custom_product_id).trim() === String(matchingCustomProduct.id).trim())
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map(img => ({
                id: img.id,
                image_url: img.image_url,
                description: img.description || 'Additional Image',
                sort_order: img.sort_order
              }));
          }
        }

        if (isPrefixedCustom || customProductIdFromDescription) {
          const customCategoryArray = customCategory ? [customCategory] : [];
          return {
            product,
            categories: isPrefixedCustom ? customCategoryArray : categoriesData.filter(cat => cat.id === product.category_id),
            variants: [],
            features: [],
            specifications: [],
            additionalImages
          };
        }

        // Regular products
        const productCategoryIds = productCategories
          .filter(pc => pc.product_id === product.id)
          .map(pc => pc.category_id);
        const productCategoriesData = categoriesData.filter(cat => productCategoryIds.includes(cat.id));

        return {
          product,
          categories: productCategoriesData,
          variants: variants.filter(variant => variant.product_id === product.id),
          features: features.filter(feature => feature.product_id === product.id),
          specifications: specifications.filter(spec => spec.product_id === product.id),
          additionalImages
        };
      });

      return {
        productsWithDetails,
        categories: categoriesData
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions...');
    
    // Create a single channel for multiple table changes
    const channel = supabase
      .channel('product-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('🔄 Products table changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_variants'
      }, (payload) => {
        console.log('🔄 Product variants changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_specifications'
      }, (payload) => {
        console.log('🔄 Product specifications changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_features'
      }, (payload) => {
        console.log('🔄 Product features changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_size_sets'
      }, (payload) => {
        console.log('🔄 Product size sets changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_products'
      }, (payload) => {
        console.log('🔄 Custom products changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_product_images'
      }, (payload) => {
        console.log('🔄 Custom product images changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
      }, (payload) => {
        console.log('🔄 Categories changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_settings'
      }, (payload) => {
        console.log('🔄 Admin settings changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      })
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Live Updates Active",
            description: "Product data will update automatically when changes are made.",
          });
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);

  return query;
};

// Hook for fetching single product detail with real-time updates
export const useProductDetail = (productSlug: string | undefined) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const query = useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug || ''),
    queryFn: async () => {
      if (!productSlug) throw new Error('Product slug is required');

      console.log('🔍 ProductDetailPage: productSlug =', productSlug);
      
      let productData;
      let isCustomProduct = false;
      
      // Try fetching from custom_products table using name slug
      const { data: customData, error: customError } = await supabase
        .rpc('find_custom_product_by_name_slug', { slug_text: productSlug })
        .maybeSingle();
          
      if (customData && !customError) {
        isCustomProduct = true;
        // Convert custom product to regular product format
        productData = {
          id: customData.id,
          name: customData.name,
          description: customData.description,
          image_url: customData.main_image_url,
          category_id: null,
          featured: false,
          created_at: customData.created_at,
          updated_at: customData.updated_at,
          special_notes: null,
          model_3d_url: null
        };
      } else {
        // Fetch from regular products table using name slug
        const { data: regularData, error: regularError } = await supabase
          .rpc('find_product_by_name_slug', { slug_text: productSlug })
          .maybeSingle();
            
        if (!regularError && regularData) {
          productData = regularData;
        }
      }

      if (!productData) {
        throw new Error('Product not found');
      }

      // Fetch related data in parallel using name-based lookups
      const [categoriesResult, variantsResult, featuresResult, specificationsResult, customImagesResult] = await Promise.all([
        // For custom products, get custom category; for regular products, get from product_categories
        isCustomProduct ? 
          supabase.from('categories').select('*').eq('name', 'Custom Products') :
          supabase.rpc('find_product_categories_by_name_slug', { slug_text: productSlug }),
        
        // Only fetch variants for regular products
        isCustomProduct ? 
          Promise.resolve({ data: [] }) : 
          supabase.rpc('find_product_variants_by_name_slug', { slug_text: productSlug }),
        
        // Only fetch features for regular products  
        isCustomProduct ?
          Promise.resolve({ data: [] }) : 
          supabase.rpc('find_product_features_by_name_slug', { slug_text: productSlug }),
        
        // Only fetch specifications for regular products
        isCustomProduct ?
          Promise.resolve({ data: [] }) : 
          supabase.rpc('find_product_specifications_by_name_slug', { slug_text: productSlug }),
        
        // Fetch custom product images if it's a custom product
        isCustomProduct ?
          supabase
            .rpc('find_custom_product_images_by_name_slug', { slug_text: productSlug })
            .then(result => ({ ...result, data: result.data || [] })) :
          Promise.resolve({ data: [] })
      ]);

      // Process categories
      let categories = [];
      if (isCustomProduct) {
        categories = categoriesResult.data || [];
      } else {
        // RPC function returns objects with category_name directly
        categories = categoriesResult.data?.map((pc: any) => ({
          id: pc.category_id,
          name: pc.category_name
        })).filter(Boolean) || [];
      }

      // Process custom images for custom products
      let additionalImages = [];
      if (isCustomProduct && customImagesResult.data) {
        additionalImages = customImagesResult.data.map((img: any) => ({
          image_url: img.image_url,
          description: img.description || 'Additional Image',
          sort_order: img.sort_order
        }));
      }

      return {
        product: productData,
        categories,
        variants: variantsResult.data || [],
        features: featuresResult.data || [],
        specifications: specificationsResult.data || [],
        additionalImages
      };
    },
    enabled: !!productSlug,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Set up real-time subscriptions for product detail
  useEffect(() => {
    if (!productSlug) return;

    const channel = supabase
      .channel(`product-detail-${productSlug}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('🔄 Product detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_variants'
      }, (payload) => {
        console.log('🔄 Product variants detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_specifications'
      }, (payload) => {
        console.log('🔄 Product specifications detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_features'
      }, (payload) => {
        console.log('🔄 Product features detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_products'
      }, (payload) => {
        console.log('🔄 Custom product detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
      }, (payload) => {
        console.log('🔄 Categories changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_settings'
      }, (payload) => {
        console.log('🔄 Admin settings detail changed:', payload);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(productSlug) });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [productSlug, queryClient]);

  return query;
};

// Hook to manually refresh data
export const useDataRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAllData = () => {
    console.log('🔄 Manually refreshing all data...');
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    toast({
      title: "Data Refreshed",
      description: "All product data has been updated.",
    });
  };

  const refreshProductDetail = (slug: string) => {
    console.log(`🔄 Manually refreshing product detail for ${slug}...`);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_DETAIL(slug) });
    toast({
      title: "Product Updated",
      description: "Product details have been refreshed.",
    });
  };

  return {
    refreshAllData,
    refreshProductDetail
  };
};