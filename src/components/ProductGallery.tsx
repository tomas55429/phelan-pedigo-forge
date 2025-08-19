import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Eye, FileText, Star, Grid3X3, List, Phone, Loader2, ChevronDown, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductVariantsTableNew } from './ProductVariantsTableNew';
import VariantDetail from './VariantDetail';
import Product3DViewer from './Product3DViewer';
type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;
type ProductFeature = Tables<'product_features'> & { image_url?: string };
type ProductSpecification = Tables<'product_specifications'>;
type Category = Tables<'categories'>;
interface ProductWithDetails {
  product: Product;
  categories: Category[]; // Changed from single category to multiple categories
  variants: ProductVariant[];
  features: ProductFeature[];
  specifications: ProductSpecification[];
  additionalImages?: { id: string; image_url: string; description?: string; sort_order?: number; }[];
}
interface ProductGalleryProps {
  selectedCategoryId?: string | null;
  initialSearchTerm?: string;
}
const ProductGallery: React.FC<ProductGalleryProps> = ({
  selectedCategoryId,
  initialSearchTerm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [productsWithDetails, setProductsWithDetails] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const [specsProduct, setSpecsProduct] = useState<ProductWithDetails | null>(null);
  const [userSelectedCategory, setUserSelectedCategory] = useState(false); // Track if user manually changed category
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<ProductWithDetails | null>(null);

  // Helper function to format variant name - only removes trailing product codes after hyphens
  const formatVariantName = (variant: ProductVariant) => {
    const name = variant.variant_name || '';
    
    // If name starts with hyphen, return the full name
    if (name.startsWith('-')) {
      return name;
    }
    
    // Otherwise, remove hyphen and everything after it (product codes)
    const cleanName = name.split('-')[0].trim();
    return cleanName;
  };

  // TEST: Direct debugging - check if custom product images are being fetched
  useEffect(() => {
    const testFetch = async () => {
      console.log('🧪 TEST: Fetching custom product images directly...');
      const result = await supabase.from('custom_product_images').select('*');
      console.log('🧪 TEST: Custom product images result:', result);
    };
    testFetch();
  }, []);

  // Fetch products and related data from Supabase
  useEffect(() => {
    console.log('ProductGallery: Starting data fetch...');
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel including custom products
        const [productsRes, categoriesRes, variantsRes, featuresRes, specificationsRes, productCategoriesRes, customProductsRes, customProductImagesRes, sizeSetsRes] = await Promise.all([
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
        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (variantsRes.error) throw variantsRes.error;
        if (featuresRes.error) throw featuresRes.error;
        if (specificationsRes.error) throw specificationsRes.error;
        if (productCategoriesRes.error) throw productCategoriesRes.error;
        if (customProductsRes.error) throw customProductsRes.error;
        if (customProductImagesRes.error) throw customProductImagesRes.error;
        if (sizeSetsRes.error) throw sizeSetsRes.error;

        const products = productsRes.data || [];
        const categoriesData = categoriesRes.data || [];
        const variants = variantsRes.data || [];
        const features = featuresRes.data || [];
        const specifications = specificationsRes.data || [];
        const productCategories = productCategoriesRes.data || [];
        const customProducts = customProductsRes.data || [];
        const customProductImages = customProductImagesRes.data || [];
        const sizeSets = sizeSetsRes.data || [];

        console.log('ProductGallery: Fetched data:', {
          products: products.length,
          customProducts: customProducts.length,
          customProductImages: customProductImages.length,
          customProductImagesData: customProductImages
        });

        // Find or create "Custom" category
        let customCategory = categoriesData.find(cat => cat.name === 'Custom');
        
        // Convert custom products to regular products format and add to products array
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
        
        console.log('🚀 BEFORE MERGE - Custom products:', customProducts.length);
        console.log('🚀 BEFORE MERGE - Regular products:', products.length);
        console.log('🚀 BEFORE MERGE - Custom product images:', customProductImages.length);
        console.log('🚀 CUSTOM PRODUCT IMAGES DATA:', customProductImages);

        const allProducts = [...products, ...customProductsAsProducts];
        console.log('🚀 AFTER MERGE - All products:', allProducts.length);
        console.log('🚀 AFTER MERGE - Products with custom- prefix:', allProducts.filter(p => p.id.toString().startsWith('custom-')).length);

        // Group data by product
        const productsWithDetailsData: ProductWithDetails[] = allProducts.map(product => {
          // Determine if this is a custom product and extract the custom product ID
          const isPrefixedCustom = product.id.toString().startsWith('custom-');
          const customProductIdFromPrefix = isPrefixedCustom
            ? product.id.toString().replace('custom-', '')
            : null;
          const customProductIdFromDescription = product.description
            ? (product.description.match(/\[Custom Product ID:\s*([^\]]+)\]/i)?.[1] || null)
            : null;
          const customProductId = customProductIdFromPrefix || customProductIdFromDescription;

          // Collect additional images if this is (or references) a custom product
          console.log('🔍 FILTERING DEBUG:', {
            productName: product.name,
            productId: product.id,
            customProductIdFromPrefix,
            customProductIdFromDescription,
            finalCustomProductId: customProductId,
            customProductImagesCount: customProductImages.length,
            customProductImagesData: customProductImages.map(img => ({ id: img.custom_product_id, url: img.image_url }))
          });

          const additionalImages = customProductId
            ? customProductImages
                .filter(img => {
                  const match = img.custom_product_id?.toString() === customProductId.toString();
                  console.log('🔍 FILTER CHECK:', {
                    imgCustomProductId: img.custom_product_id,
                    lookingFor: customProductId,
                    match
                  });
                  return match;
                })
                .map(img => ({
                  id: img.id,
                  image_url: img.image_url,
                  description: img.description,
                  sort_order: img.sort_order,
                }))
            : [];

          // Build all images list (main + additional)
          const allImageData = [
            { url: product.image_url || '', description: 'Main Image' },
            ...additionalImages.map(img => ({ url: img.image_url, description: img.description || 'Additional Image' })),
          ].filter(img => img.url);

          console.log('CUSTOM IMAGE MAP DEBUG:', {
            productId: product.id,
            productName: product.name,
            isPrefixedCustom,
            customProductIdFromPrefix,
            customProductIdFromDescription,
            resolvedCustomProductId: customProductId,
            additionalImagesCount: additionalImages.length,
          });

          if (isPrefixedCustom || customProductIdFromDescription) {
            // Ensure custom category for custom items
            const customCategoryArray = customCategory ? [customCategory] : [];
            return {
              product,
              categories: isPrefixedCustom ? customCategoryArray : categoriesData.filter(cat => cat.id === product.category_id),
              variants: [],
              features: [],
              specifications: [],
              additionalImages,
              allImages: allImageData.length,
              allImagesData: allImageData,
            };
          }

          // Regular products (no custom images)
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
            additionalImages: [],
          };
        });
        setProductsWithDetails(productsWithDetailsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set initial search term from props
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Reset zoom and pan when image changes
  useEffect(() => {
    if (enlargedImage) {
      setImageZoom(1);
      setImagePan({
        x: 0,
        y: 0
      });
    }
  }, [enlargedImage]);
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev * 1.5, 5));
  };
  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev / 1.5, 0.5));
  };
  const resetZoom = () => {
    setImageZoom(1);
    setImagePan({
      x: 0,
      y: 0
    });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePan.x,
        y: e.clientY - imagePan.y
      });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };
  const filteredProducts = useMemo(() => {
    return productsWithDetails.filter(({
      product,
      categories,
      features,
      specifications
    }) => {
      // Filter out uncategorized products
      if (categories.length === 0) {
        return false;
      }

      // Enhanced search that includes product name, description, features, and specifications
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const specialNotesMatch = product.special_notes?.toLowerCase().includes(searchLower);

      // Search through features
      const featuresMatch = features.some(feature => feature.feature?.toLowerCase().includes(searchLower));

      // Search through specifications
      const specificationsMatch = specifications.some(spec => spec.specification_key?.toLowerCase().includes(searchLower) || spec.specification_value?.toLowerCase().includes(searchLower));
      const matchesSearch = !searchTerm || nameMatch || descriptionMatch || specialNotesMatch || featuresMatch || specificationsMatch;

      // Determine which category filter to use
      let matchesCategory = true;
      if (userSelectedCategory) {
        // If user manually selected a category via dropdown, use that
        matchesCategory = selectedCategory === 'All Products' || categories.some(cat => cat.name === selectedCategory);
      } else if (selectedCategoryId !== undefined && selectedCategoryId !== null) {
        // If a category is selected from the categories section, filter by category ID
        matchesCategory = categories.some(cat => cat.id === selectedCategoryId);
      } else if (selectedCategory !== 'All Products') {
        // If using internal category dropdown, filter by category name
        matchesCategory = categories.some(cat => cat.name === selectedCategory);
      }
      // If selectedCategoryId is null or selectedCategory is 'All Products', show all products

      const matchesFeatured = !showFeaturedOnly || product.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [searchTerm, selectedCategory, selectedCategoryId, showFeaturedOnly, productsWithDetails, userSelectedCategory]);
  const ProductCard = ({
    productWithDetails
  }: {
    productWithDetails: ProductWithDetails;
  }) => {
    const {
      product,
      categories,
      variants,
      features,
      additionalImages
    } = productWithDetails;
    
    const allImages = [
      ...(product.image_url ? [{ url: product.image_url, description: 'Main Image' }] : [])
    ];

    console.log('ProductCard images for', product.name, ':', {
      productImageUrl: product.image_url,
      additionalImages: additionalImages,
      allImages: allImages.length,
      allImagesData: allImages
    });
    
    const displayDescription = (product.description || '')
      .replace(/\[Custom Product ID:\s*([^\]]+)\]/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return <Card className="professional-hover bg-card shadow-card overflow-hidden">
        <div className="relative">
          {allImages.length > 0 ? (
            allImages.length === 1 ? (
              <img 
                src={allImages[0].url} 
                alt={product.name} 
                className="w-full h-64 sm:h-56 md:h-64 lg:h-72 object-cover" 
                loading="lazy" 
                decoding="async" 
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
              />
            ) : (
              <div className="relative">
                <div className="grid grid-cols-2 gap-1">
                  {allImages.slice(0, 4).map((image, index) => (
                    <div key={index} className={`relative ${index === 0 ? 'col-span-2' : ''}`}>
                      <img 
                        src={image.url} 
                        alt={`${product.name} - ${image.description}`}
                        className={`w-full object-cover ${index === 0 ? 'h-40 sm:h-36 md:h-40' : 'h-20 sm:h-18 md:h-20'}`}
                        loading="lazy" 
                        decoding="async"
                      />
                      {index === 3 && allImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold">+{allImages.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-64 sm:h-56 md:h-64 lg:h-72 bg-muted flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {product.featured && <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>}
        </div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            {variants.length > 1 && <Badge variant="outline" className="text-xs">
                {variants.length} variants
              </Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{categories.length > 0 ? categories.map(cat => cat.name).join(', ') : 'Uncategorized'}</p>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Only show description for regular products, not custom products */}
          {!product.id.toString().startsWith('custom-') && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {displayDescription || 'No description available'}
            </p>
          )}
          
          {/* Product Details Accordion */}
          {(features.length > 0 || variants.length > 0 || product.special_notes) && <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="product-details" className="border-none">
                <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-0">
                  <div className="space-y-3">
                    {features.length > 0 && <div>
                        <h5 className="text-sm font-semibold mb-2">Key Features:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {features.slice(0, 3).map(feature => <li key={feature.id} className="flex items-center space-x-1">
                              <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                              <span>{feature.feature}</span>
                            </li>)}
                        </ul>
                      </div>}
                    
                    {variants.length > 0 && <div>
                        <h5 className="text-sm font-semibold mb-2">Available Variants:</h5>
                        <div className="flex flex-wrap gap-1">
                          {variants.slice(0, 3).map(variant => <Badge key={variant.id} variant="secondary" className="text-xs">
                              {formatVariantName(variant)}
                            </Badge>)}
                          {variants.length > 3 && <Badge variant="outline" className="text-xs">
                              +{variants.length - 3} more
                            </Badge>}
                        </div>
                      </div>}
                    
                     {/* Accessories Section */}
                     {(() => {
                       const allAccessories = features.filter(feature => feature.is_optional);
                       const deduplicatedAccessories = allAccessories.reduce((acc, accessory) => {
                         if (!acc.some(a => a.feature === accessory.feature)) {
                           acc.push(accessory);
                         }
                         return acc;
                       }, [] as typeof allAccessories);
                       
                       return deduplicatedAccessories.length > 0 && (
                         <div>
                           <h5 className="text-sm font-semibold mb-2">Available Accessories:</h5>
                           <div className="space-y-2">
                             {deduplicatedAccessories.slice(0, 3).map(accessory => (
                               <div key={accessory.id} className="flex items-center space-x-2">
                                  {accessory.image_url && (
                                    <img 
                                      src={accessory.image_url} 
                                      alt={accessory.feature}
                                      className="w-6 h-6 object-cover rounded border"
                                      loading="lazy"
                                      decoding="async"
                                      sizes="24px"
                                    />
                                  )}
                                 <span className="text-xs text-muted-foreground">{accessory.feature}</span>
                               </div>
                             ))}
                             {deduplicatedAccessories.length > 3 && (
                               <p className="text-xs text-muted-foreground">
                                 +{deduplicatedAccessories.length - 3} more accessories
                               </p>
                             )}
                           </div>
                         </div>
                       );
                     })()}
                     
                     {/* Special Notes */}
                     {product.special_notes && <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                         <p className="text-xs font-medium text-warning-foreground mb-1">Special Notes:</p>
                         <p className="text-xs text-muted-foreground line-clamp-2">
                           {product.special_notes}
                         </p>
                       </div>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>}
          
          <div className="flex space-x-2 mt-4">
            <Button size="sm" className="flex-1 text-xs sm:text-sm py-2 sm:py-1.5" onClick={() => setSelectedProduct(productWithDetails)}>
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSpecsProduct(productWithDetails)} className="px-2 sm:px-3">
              <FileText className="h-4 w-4" />
              <span className="sr-only">Specifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>;
  };
  const ProductListItem = ({
    productWithDetails
  }: {
    productWithDetails: ProductWithDetails;
  }) => {
    const {
      product,
      categories,
      variants,
      features,
      additionalImages
    } = productWithDetails;
    
    const allImages = [
      ...(product.image_url ? [{ url: product.image_url, description: 'Main Image' }] : []),
      ...(additionalImages || []).map(img => ({ url: img.image_url, description: img.description || 'Additional Image' }))
    ];

    return <Card className="professional-hover bg-card shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="relative">
              {allImages.length > 0 ? (
                allImages.length === 1 ? (
                  <img 
                    src={allImages[0].url} 
                    alt={product.name} 
                    className="w-full h-40 sm:h-36 md:h-40 lg:h-44 object-cover rounded" 
                    loading="lazy" 
                    decoding="async" 
                    sizes="(max-width: 768px) 100vw, 25vw" 
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-1 rounded overflow-hidden">
                    {allImages.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.url} 
                          alt={`${product.name} - ${image.description}`}
                          className="w-full h-20 object-cover"
                          loading="lazy" 
                          decoding="async"
                        />
                        {index === 3 && allImages.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">+{allImages.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="w-full h-40 sm:h-36 md:h-40 lg:h-44 bg-muted flex items-center justify-center rounded">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {product.featured && <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>}
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {variants.length > 1 && <Badge variant="outline" className="text-xs">
                    {variants.length} variants
                  </Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{categories.length > 0 ? categories.map(cat => cat.name).join(', ') : 'Uncategorized'}</p>
              <p className="text-sm text-muted-foreground mb-3">{product.description || 'No description available'}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                {features.length > 0 && <div>
                    <strong>Features:</strong>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {features.slice(0, 2).map(feature => <li key={feature.id}>• {feature.feature}</li>)}
                    </ul>
                  </div>}
                {variants.length > 0 && <div>
                    <strong>Variants:</strong>
                    <div className="mt-1 space-y-1 text-muted-foreground">
                      {variants.slice(0, 2).map(variant => <div key={variant.id}>• {formatVariantName(variant)}</div>)}
                    </div>
                  </div>}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button size="sm" onClick={() => setSelectedProduct(productWithDetails)}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSpecsProduct(productWithDetails)}>
                <FileText className="h-4 w-4 mr-1" />
                Specs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>;
  };
  if (loading) {
    return <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        </div>
      </div>;
  }
  return <div className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Product Details Modal */}
        {selectedProduct && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-7xl w-full max-h-[90vh] relative">
              {/* Fixed Close Button - Always Visible */}
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg border-2">
                <X className="h-4 w-4" />
              </Button>
              
              {/* Scrollable Content */}
              <div className="p-4 md:p-8 overflow-y-auto max-h-[90vh]">
              
              {/* Product Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{selectedProduct.product.name}</h1>
                <p className="text-xl text-muted-foreground">{selectedProduct.categories.length > 0 ? selectedProduct.categories.map(cat => cat.name).join(', ') : 'Uncategorized'}</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - Product Images */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedProduct.additionalImages && selectedProduct.additionalImages.length > 0 ? 'Product Images' : 'Product Image'}
                  </h2>
                  <div className="space-y-4">
                    {(() => {
                      const allImages = [
                        ...(selectedProduct.product.image_url ? [{ url: selectedProduct.product.image_url, description: 'Main Image' }] : []),
                        ...(selectedProduct.additionalImages || []).map(img => ({ url: img.image_url, description: img.description || 'Additional Image' }))
                      ];

                      console.log('Detail view images for', selectedProduct.product.name, ':', {
                        productImageUrl: selectedProduct.product.image_url,
                        additionalImages: selectedProduct.additionalImages,
                        allImages: allImages.length,
                        allImagesData: allImages
                      });

                      if (allImages.length === 0) {
                        return (
                          <div className="border-2 border-muted rounded-lg p-8 bg-muted/20 min-h-[400px] flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p>No image available</p>
                              <p className="text-sm mt-2">
                                {selectedProduct.variants.length > 0 ? `${formatVariantName(selectedProduct.variants[0])} will be considered the default, so display its image here` : 'Please add a product image'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return allImages.map((image, index) => (
                        <div key={index} className="border-2 border-muted rounded-lg p-8 bg-muted/20 min-h-[300px] flex items-center justify-center">
                          <div className="relative group w-full">
                            <img 
                              src={image.url} 
                              alt={`${selectedProduct.product.name} - ${image.description}`}
                              className="w-full h-auto object-contain max-h-96 rounded cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => setEnlargedImage(image.url)} 
                              loading="lazy" 
                              decoding="async" 
                              sizes="(max-width: 768px) 100vw, 50vw" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded pointer-events-none">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-background/90 backdrop-blur-sm pointer-events-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnlargedImage(image.url);
                                }}
                              >
                                <ZoomIn className="h-4 w-4 mr-2" />
                                Enlarge
                              </Button>
                            </div>
                            {image.description && image.description !== 'Main Image' && (
                              <div className="mt-2 text-center">
                                <p className="text-sm text-muted-foreground bg-background/80 rounded px-2 py-1">
                                  {image.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                {/* Right Column - Product Information */}
                <div className="space-y-8">
                  {/* Description - Only show for regular products with actual descriptions */}
                  {!selectedProduct.product.id.toString().startsWith('custom-') && selectedProduct.product.description && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Product Description</h2>
                       <p className="text-muted-foreground leading-relaxed">
                         {(() => {
                           const description = selectedProduct.product.description;
                           // Remove custom product ID from description if present
                           const cleanDescription = description.replace(/\n\n\[Custom Product ID: [^\]]+\]/g, '');
                           return cleanDescription;
                         })()}
                       </p>
                    </div>
                  )}
                   
                    {/* Combined Features from All Variants - deduplicated */}
                    {(() => {
                      // Get all features from all variants, deduplicated by feature text
                      const allFeatures = selectedProduct.features.filter(feature => !feature.is_optional);
                      const deduplicatedFeatures = allFeatures.reduce((acc, feature) => {
                        if (!acc.some(f => f.feature === feature.feature)) {
                          acc.push(feature);
                        }
                        return acc;
                      }, [] as typeof allFeatures);
                      
                      return deduplicatedFeatures.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Features</h2>
                          <p className="text-sm text-muted-foreground mb-3">Combined features from all variants</p>
                          <ul className="space-y-2">
                            {deduplicatedFeatures.map(feature => (
                              <li key={feature.id} className="flex items-start space-x-2">
                                <span className="text-lg leading-none mt-1">-</span>
                                <span>{feature.feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                    
                    {/* Available Accessories - deduplicated across variants */}
                    {(() => {
                      const accessories = selectedProduct.features.filter(f => f.is_optional);
                      const deduped = accessories.reduce((acc, item) => {
                        if (!acc.some(a => a.feature === item.feature)) acc.push(item);
                        return acc;
                      }, [] as typeof accessories);
                      return deduped.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Available Accessories</h2>
                          <ul className="space-y-3">
                            {deduped.map(acc => (
                              <li key={acc.id} className="flex items-center gap-3">
                                {acc.image_url && (
                                  <img
                                    src={acc.image_url}
                                    alt={acc.feature}
                                    className="w-10 h-10 rounded border object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    sizes="40px"
                                  />
                                )}
                                <span className="text-sm text-muted-foreground">{acc.feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                   
                    {/* Variants - Only show if there are variants */}
                   {selectedProduct.variants.length > 0 && (
                     <div>
                       <h2 className="text-xl font-semibold mb-4">Variants</h2>
                       <div className="space-y-3">
                         {selectedProduct.variants.map(variant => (
                           <button 
                             key={variant.id} 
                             className="w-full p-4 text-left border-2 border-muted rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all" 
                             onClick={() => {
                               setSelectedVariant(variant);
                               setSelectedVariantProduct(selectedProduct);
                             }}
                           >
                             <div className="font-medium text-lg">
                               {formatVariantName(variant)}
                             </div>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                  
                  
                  {/* Special Notes */}
                  {selectedProduct.product.special_notes && <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-medium text-warning-foreground mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Special Notes
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedProduct.product.special_notes}
                      </p>
                    </div>}
                </div>
               </div>
                
                {/* 3D Model Section - Only show if model exists */}
                {selectedProduct.product.model_3d_url && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4">3D Model</h2>
                    <div className="border-2 border-muted rounded-lg overflow-hidden">
                      <Product3DViewer 
                        modelUrl={selectedProduct.product.model_3d_url}
                        productName={selectedProduct.product.name}
                        className="w-full h-[600px]"
                      />
                    </div>
                  </div>
                )}

                {/* Specifications Section - Only show if there are specifications */}
                {selectedProduct.specifications.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                    <div className="w-full">
                      <div className="w-full">
                        <ProductVariantsTableNew productId={selectedProduct.product.id} variants={selectedProduct.variants} specifications={selectedProduct.specifications} />
                      </div>
                    </div>
                  </div>
                )}
                 </div>
             </div>
           </div>}

        {/* Enlarged Image Dialog with Zoom */}
        <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Enlarged Product Image</DialogTitle>
            </DialogHeader>
            {enlargedImage && <div className="relative w-full h-[90vh] bg-black/90 flex items-center justify-center overflow-hidden">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => setEnlargedImage(null)} className="bg-background/80 backdrop-blur-sm hover:bg-background/90">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleZoomIn} disabled={imageZoom >= 5} className="bg-background/80 backdrop-blur-sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleZoomOut} disabled={imageZoom <= 0.5} className="bg-background/80 backdrop-blur-sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={resetZoom} className="bg-background/80 backdrop-blur-sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom Level Indicator */}
                <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm">
                  {Math.round(imageZoom * 100)}%
                </div>

                {/* Pan Instructions */}
                {imageZoom > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm">
                    Drag to pan • Scroll to zoom
                  </div>}

                {/* Zoomable Image */}
                <div className="w-full h-full flex items-center justify-center" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{
              cursor: imageZoom > 1 ? isDragging ? 'grabbing' : 'grab' : 'default'
            }}>
                  <img src={enlargedImage} alt="Enlarged product view" className="max-w-none select-none" style={{
                transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                maxWidth: imageZoom === 1 ? '100%' : 'none',
                maxHeight: imageZoom === 1 ? '100%' : 'none',
                width: imageZoom === 1 ? 'auto' : '100%',
                height: imageZoom === 1 ? 'auto' : '100%',
                objectFit: imageZoom === 1 ? 'contain' : 'cover'
              }} draggable={false} loading="lazy" decoding="async" />
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Product Specifications Modal */}
        <Dialog open={!!specsProduct} onOpenChange={() => setSpecsProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2" />
                {specsProduct?.product.name} - Specifications
              </DialogTitle>
            </DialogHeader>
            
            {specsProduct && <div className="space-y-6">
                {/* Specifications Table */}
                {specsProduct.specifications.length > 0 ? <div>
                    <h3 className="font-semibold mb-3">Technical Specifications</h3>
                    <ProductVariantsTableNew productId={specsProduct.product.id} variants={specsProduct.variants} specifications={specsProduct.specifications} />
                  </div> : <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No specifications available for this product.</p>
                  </div>}
              </div>}
          </DialogContent>
        </Dialog>

        {/* Variant Details Modal with 3D Viewer */}
        {selectedVariant && selectedVariantProduct && <VariantDetail variant={selectedVariant} productName={selectedVariantProduct.product.name} productId={selectedVariantProduct.product.id} features={selectedVariantProduct.features} specifications={selectedVariantProduct.specifications} onClose={() => {
        setSelectedVariant(null);
        setSelectedVariantProduct(null);
      }} onImageEnlarge={setEnlargedImage} />}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Medical Equipment Catalog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive range of medical equipment and hospital hardware, 
            manufactured with precision and built to hospital standards.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <Card className="bg-card shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products, models, or features..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select value={selectedCategory} onChange={e => {
                  setSelectedCategory(e.target.value);
                  setUserSelectedCategory(true); // Mark that user manually changed category
                }} className="px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option value="All Products">All Products</option>
                    {categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
                  </select>
                </div>

                {/* Featured Toggle */}
                <Button variant={showFeaturedOnly ? "default" : "outline"} size="sm" onClick={() => setShowFeaturedOnly(!showFeaturedOnly)} className="text-xs sm:text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Featured Only</span>
                  <span className="sm:hidden">Featured</span>
                </Button>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border border-border rounded-md p-1">
                  <Button variant={viewMode === 'grid' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('grid')} className="px-2 sm:px-3">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Grid</span>
                  </Button>
                  <Button variant={viewMode === 'list' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('list')} className="px-2 sm:px-3">
                    <List className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">List</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {productsWithDetails.length} products
            {selectedCategory !== 'All Products' && ` in "${selectedCategory}"`}
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(productWithDetails => <ProductCard key={productWithDetails.product.id} productWithDetails={productWithDetails} />)}
          </div> : <div className="space-y-4 sm:space-y-6">
            {filteredProducts.map(productWithDetails => <ProductListItem key={productWithDetails.product.id} productWithDetails={productWithDetails} />)}
          </div>}

        {/* No Results */}
        {filteredProducts.length === 0 && <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
            <Button variant="outline" onClick={() => {
          setSearchTerm('');
          setSelectedCategory('All Products');
          setShowFeaturedOnly(false);
        }}>
              Clear Filters
            </Button>
          </div>}

        {/* Call to Action */}
        <div className="mt-12 sm:mt-16 px-4 sm:px-0">
          <Card className="bg-primary/5 border border-primary/20">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                We specialize in custom medical equipment design and manufacturing. 
                Contact our specialists to discuss your unique requirements.
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark text-sm sm:text-base">
                <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Call 1-800-328-2358</span>
                <span className="sm:hidden">Call Us</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default ProductGallery;