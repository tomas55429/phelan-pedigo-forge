import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/ProductDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, X, RefreshCw } from 'lucide-react';
import { parseProductSlug } from '@/utils/productUtils';
import { toast } from '@/components/ui/use-toast';
import type { ProductWithDetails, Category } from '@/types/product';
import { useProductDetail, useDataRefresh } from '@/hooks/useProductData';

const ProductDetailPage = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { data: productWithDetails, isLoading, error, refetch } = useProductDetail(productSlug);
  const { refreshProductDetail } = useDataRefresh();
  
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Redirect if no productSlug
  useEffect(() => {
    if (!productSlug) {
      navigate('/products');
    }
  }, [productSlug, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('ProductDetailPage error:', error);
      toast({
        title: "Error loading product",
        description: "There was an error loading the product details.",
        variant: "destructive"
      });
      navigate('/products');
    }
  }, [error, navigate]);

  // Manual refresh function
  const handleRefresh = () => {
    if (productSlug) {
      refreshProductDetail(productSlug);
      refetch();
    }
  };

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

  if (isLoading) {
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
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <ProductDetail 
          productWithDetails={productWithDetails}
          onImageEnlarge={setEnlargedImage}
          showShareButton={false}
          productSlug={productSlug}
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