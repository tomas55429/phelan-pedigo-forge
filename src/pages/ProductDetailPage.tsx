import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/ProductDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import { parseProductSlug } from '@/utils/productUtils';
import { toast } from '@/components/ui/use-toast';
import type { ProductWithDetails, Category } from '@/types/product';

const ProductDetailPage = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const [productWithDetails, setProductWithDetails] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) {
        navigate('/products');
        return;
      }

      console.log('🔍 ProductDetailPage: productSlug =', productSlug);
      const productId = parseProductSlug(productSlug);
      console.log('🔍 ProductDetailPage: parsed productId =', productId);
      
      if (!productId) {
        console.log('🚨 ProductDetailPage: Could not parse productId from slug');
        toast({
          title: "Product not found",
          description: "The product you're looking for could not be found.",
          variant: "destructive"
        });
        navigate('/products');
        return;
      }

      try {
        let productData;
        let isCustomProduct = false;
        
        console.log('🔍 ProductDetailPage: productId =', productId);
        console.log('🔍 ProductDetailPage: productId.startsWith("custom-") =', productId.startsWith('custom-'));
        
        // Check if this is a custom product
        if (productId.startsWith('custom-')) {
          isCustomProduct = true;
          const customProductId = productId.replace('custom-', '');
          console.log('🔍 ProductDetailPage: customProductId =', customProductId);
          
          // Fetch from custom_products table
          const { data: customData, error: customError } = await supabase
            .rpc('find_custom_product_by_prefix', { prefix_text: customProductId })
            .maybeSingle();
            
          console.log('🔍 ProductDetailPage: customData =', customData);
          console.log('🔍 ProductDetailPage: customError =', customError);
            
          if (customData && !customError) {
            // Convert custom product to regular product format
            productData = {
              id: productId, // Keep the "custom-" prefix
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
          }
        } else {
          console.log('🔍 ProductDetailPage: Fetching regular product with ID =', productId);
          // Fetch from regular products table
          const { data: regularData, error: regularError } = await supabase
            .rpc('find_product_by_prefix', { prefix_text: productId })
            .maybeSingle();
            
          console.log('🔍 ProductDetailPage: regularData =', regularData);
          console.log('🔍 ProductDetailPage: regularError =', regularError);
            
          if (!regularError && regularData) {
            productData = regularData;
          }
        }

        console.log('🔍 ProductDetailPage: Final productData =', productData);

        if (!productData) {
          console.log('🚨 ProductDetailPage: No productData found');
          toast({
            title: "Product not found",
            description: "The product you're looking for could not be found.",
            variant: "destructive"
          });
          navigate('/products');
          return;
        }

        // Fetch related data in parallel
        const [categoriesResult, variantsResult, featuresResult, specificationsResult, customImagesResult] = await Promise.all([
          // For custom products, get custom category; for regular products, get from product_categories
          isCustomProduct ? 
            supabase.from('categories').select('*').eq('name', 'Custom') :
            supabase.rpc('find_product_categories_by_prefix', { prefix_text: productId.replace('custom-', '') }),
          
          // Only fetch variants for regular products
          isCustomProduct ? 
            Promise.resolve({ data: [] }) : 
            supabase.rpc('find_product_variants_by_prefix', { prefix_text: productId }),
          
          // Only fetch features for regular products  
          isCustomProduct ?
            Promise.resolve({ data: [] }) : 
            supabase.rpc('find_product_features_by_prefix', { prefix_text: productId }),
          
          // Only fetch specifications for regular products
          isCustomProduct ?
            Promise.resolve({ data: [] }) : 
            supabase.rpc('find_product_specifications_by_prefix', { prefix_text: productId }),
          
          // Fetch custom product images if it's a custom product
          isCustomProduct ?
            supabase
              .rpc('find_custom_product_images_by_prefix', { prefix_text: productId.replace('custom-', '') })
              .then(result => ({ ...result, data: result.data || [] })) :
            Promise.resolve({ data: [] })
        ]);

        // Process categories
        let categories = [];
        if (isCustomProduct) {
          categories = categoriesResult.data || [];
        } else {
          // RPC function returns objects with category_name directly
          categories = categoriesResult.data?.map(pc => ({
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

        const productWithDetails: ProductWithDetails = {
          product: productData,
          categories: categories as Category[],
          variants: variantsResult.data || [],
          features: featuresResult.data || [],
          specifications: specificationsResult.data || [],
          additionalImages
        };

        setProductWithDetails(productWithDetails);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error loading product",
          description: "There was an error loading the product details.",
          variant: "destructive"
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, navigate]);

  // Image zoom and pan handlers
  const handleZoomIn = () => setImageZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setImageZoom(prev => Math.max(prev / 1.2, 0.5));
  const resetZoom = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-64"></div>
            <div className="h-4 bg-muted rounded mb-8 w-32"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!productWithDetails) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for could not be found.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>
            <span className="text-muted-foreground">/</span>
            <button 
              onClick={() => navigate('/products')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{productWithDetails.product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>

        <ProductDetail 
          productWithDetails={productWithDetails}
          onImageEnlarge={setEnlargedImage}
          showShareButton={false}
        />
      </div>

      {/* Enlarged Image Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Enlarged Product Image</DialogTitle>
          </DialogHeader>
          {enlargedImage && (
            <div className="relative w-full h-[90vh] bg-black/90 flex items-center justify-center overflow-hidden">
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setEnlargedImage(null)} 
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleZoomIn} 
                  disabled={imageZoom >= 5} 
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleZoomOut} 
                  disabled={imageZoom <= 0.5} 
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={resetZoom} 
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Level Indicator */}
              <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm">
                {Math.round(imageZoom * 100)}%
              </div>

              {/* Pan Instructions */}
              {imageZoom > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm">
                  Drag to pan • Scroll to zoom
                </div>
              )}

              {/* Zoomable Image */}
              <div 
                className="w-full h-full flex items-center justify-center" 
                onWheel={handleWheel} 
                onMouseDown={handleMouseDown} 
                onMouseMove={handleMouseMove} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp}
                style={{
                  cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
              >
                <img 
                  src={enlargedImage} 
                  alt="Enlarged product view" 
                  className="max-w-none select-none"
                  style={{
                    transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    maxWidth: imageZoom === 1 ? '100%' : 'none',
                    maxHeight: imageZoom === 1 ? '100%' : 'none',
                    width: imageZoom === 1 ? 'auto' : '100%',
                    height: imageZoom === 1 ? 'auto' : '100%',
                    objectFit: imageZoom === 1 ? 'contain' : 'cover'
                  }}
                  draggable={false} 
                  loading="lazy" 
                  decoding="async" 
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;