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
import ProductVariantsTable from './ProductVariantsTable';
import VariantDetail from './VariantDetail';
type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;
type ProductFeature = Tables<'product_features'>;
type ProductSpecification = Tables<'product_specifications'>;
type Category = Tables<'categories'>;
interface ProductWithDetails {
  product: Product;
  category: Category | null;
  variants: ProductVariant[];
  features: ProductFeature[];
  specifications: ProductSpecification[];
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

  // Helper function to format variant name to show only name and number
  const formatVariantName = (variant: ProductVariant) => {
    // Extract just the name and model number, removing extra descriptive text
    const name = variant.variant_name || '';
    // Look for pattern like "Name Number-Letter" or just return the first part if it follows that pattern
    const match = name.match(/^([^,]+?)(?:\s*[,-]\s*(.+))?$/);
    if (match) {
      const mainPart = match[1].trim();
      // If there's a model number pattern, include it
      const modelMatch = mainPart.match(/^(.+?)\s+([A-Z0-9-]+[A-Z])$/);
      if (modelMatch) {
        return `${modelMatch[1]} ${modelMatch[2]}`;
      }
      return mainPart;
    }
    return name;
  };

  // Fetch products and related data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [productsRes, categoriesRes, variantsRes, featuresRes, specificationsRes] = await Promise.all([supabase.from('products').select('*').order('name'), supabase.from('categories').select('*').order('name'), supabase.from('product_variants').select('*'), supabase.from('product_features').select('*'), supabase.from('product_specifications').select('*')]);
        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (variantsRes.error) throw variantsRes.error;
        if (featuresRes.error) throw featuresRes.error;
        if (specificationsRes.error) throw specificationsRes.error;
        const products = productsRes.data || [];
        const categoriesData = categoriesRes.data || [];
        const variants = variantsRes.data || [];
        const features = featuresRes.data || [];
        const specifications = specificationsRes.data || [];

        // Group data by product
        const productsWithDetailsData: ProductWithDetails[] = products.map(product => ({
          product,
          category: categoriesData.find(cat => cat.id === product.category_id) || null,
          variants: variants.filter(variant => variant.product_id === product.id),
          features: features.filter(feature => feature.product_id === product.id),
          specifications: specifications.filter(spec => spec.product_id === product.id)
        }));
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
      category,
      features,
      specifications
    }) => {
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
        matchesCategory = selectedCategory === 'All Products' || category?.name === selectedCategory;
      } else if (selectedCategoryId !== undefined && selectedCategoryId !== null) {
        // If a category is selected from the categories section, filter by category ID
        matchesCategory = product.category_id === selectedCategoryId;
      } else if (selectedCategory !== 'All Products') {
        // If using internal category dropdown, filter by category name
        matchesCategory = category?.name === selectedCategory;
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
      category,
      variants,
      features
    } = productWithDetails;
    return <Card className="professional-hover bg-card shadow-card overflow-hidden">
        <div className="relative">
          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-64 sm:h-56 md:h-64 lg:h-72 object-cover" /> : <div className="w-full h-64 sm:h-56 md:h-64 lg:h-72 bg-muted flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>}
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
          <p className="text-sm text-muted-foreground">{category?.name || 'Uncategorized'}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          
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
            <Button size="sm" className="flex-1" onClick={() => setSelectedProduct(productWithDetails)}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSpecsProduct(productWithDetails)}>
              <FileText className="h-4 w-4" />
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
      category,
      variants,
      features
    } = productWithDetails;
    return <Card className="professional-hover bg-card shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="relative">
              {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-40 sm:h-36 md:h-40 lg:h-44 object-cover rounded" /> : <div className="w-full h-40 sm:h-36 md:h-40 lg:h-44 bg-muted flex items-center justify-center rounded">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>}
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
              <p className="text-sm text-muted-foreground mb-2">{category?.name || 'Uncategorized'}</p>
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
              <div className="p-8 overflow-y-auto max-h-[90vh]">
              
              {/* Product Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{selectedProduct.product.name}</h1>
                <p className="text-xl text-muted-foreground">{selectedProduct.category?.name || 'Uncategorized'}</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - Product Image */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Product Image</h2>
                  <div className="border-2 border-muted rounded-lg p-8 bg-muted/20 min-h-[400px] flex items-center justify-center">
                    {selectedProduct.product.image_url ? <div className="relative group w-full">
                        <img src={selectedProduct.product.image_url} alt={selectedProduct.product.name} className="w-full h-auto object-contain max-h-96 rounded cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setEnlargedImage(selectedProduct.product.image_url!)} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded">
                          <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                            <ZoomIn className="h-4 w-4 mr-2" />
                            Enlarge
                          </Button>
                        </div>
                      </div> : <div className="text-center text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No image available</p>
                        <p className="text-sm mt-2">
                          {selectedProduct.variants.length > 0 ? `${formatVariantName(selectedProduct.variants[0])} will be considered the default, so display its image here` : 'Please add a product image'}
                        </p>
                      </div>}
                  </div>
                </div>
                
                {/* Right Column - Product Information */}
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Product Description</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.product.description || 'No description available'}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Features</h2>
                    
                    {selectedProduct.features.length > 0 ? <ul className="space-y-2">
                        {selectedProduct.features.filter(feature => !feature.is_optional).map(feature => <li key={feature.id} className="flex items-start space-x-2">
                              <span className="text-lg leading-none mt-1">-</span>
                              <span>{feature.feature}</span>
                            </li>)}
                        {selectedProduct.features.filter(feature => feature.is_optional).map(feature => <li key={feature.id} className="flex items-start space-x-2 text-muted-foreground">
                              <span className="text-lg leading-none mt-1">-</span>
                              <span>{feature.feature} (Optional)</span>
                            </li>)}
                      </ul> : <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <span className="text-lg leading-none mt-1">-</span>
                          <span>No features listed</span>
                        </li>
                      </ul>}
                  </div>
                  
                  {/* Variants */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Variants</h2>
                    <div className="space-y-3">
                      {selectedProduct.variants.length > 0 ? selectedProduct.variants.map(variant => <button key={variant.id} className="w-full p-4 text-left border-2 border-muted rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all" onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedVariantProduct(selectedProduct);
                  }}>
                            <div className="font-medium text-lg">
                              {formatVariantName(variant)}
                            </div>
                          </button>) : <div className="p-4 border-2 border-muted rounded-lg text-muted-foreground">
                          No variants available
                        </div>}
                    </div>
                  </div>
                  
                  {/* Accessories */}
                  {selectedProduct.features.some(f => f.is_optional) && <div>
                      <h2 className="text-xl font-semibold mb-4">Accessories</h2>
                      <div className="space-y-3">
                        {selectedProduct.features.filter(feature => feature.is_optional).map(accessory => <div key={accessory.id} className="p-4 border-2 border-muted rounded-lg">
                              <div className="font-medium">{accessory.feature}</div>
                            </div>)}
                      </div>
                    </div>}
                  
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
              
               {/* Specifications Section */}
               <div className="mt-12">
                 
                 <div className="border-2 border-muted rounded-lg p-6 bg-muted/10 min-h-[200px] flex items-center justify-center">
                   {selectedProduct.specifications.length > 0 ? <div className="w-full">
                       <ProductVariantsTable variants={selectedProduct.variants} specifications={selectedProduct.specifications} />
                     </div> : <div className="text-center text-muted-foreground">
                       <div className="text-xl mb-2">Specs Table</div>
                       <p className="text-sm">No specifications available</p>
                     </div>}
                 </div>
               </div>
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
              }} draggable={false} />
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
                    <ProductVariantsTable variants={specsProduct.variants} specifications={specsProduct.specifications} />
                  </div> : <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No specifications available for this product.</p>
                  </div>}
              </div>}
          </DialogContent>
        </Dialog>

        {/* Variant Details Modal with 3D Viewer */}
        {selectedVariant && selectedVariantProduct && <VariantDetail variant={selectedVariant} productName={selectedVariantProduct.product.name} features={selectedVariantProduct.features} specifications={selectedVariantProduct.specifications} onClose={() => {
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
                <Button variant={showFeaturedOnly ? "default" : "outline"} size="sm" onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}>
                  <Star className="h-4 w-4 mr-1" />
                  Featured Only
                </Button>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border border-border rounded-md p-1">
                  <Button variant={viewMode === 'grid' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('grid')}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4" />
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
        {viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(productWithDetails => <ProductCard key={productWithDetails.product.id} productWithDetails={productWithDetails} />)}
          </div> : <div className="space-y-4">
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
        <div className="mt-16">
          <Card className="bg-primary/5 border border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                We specialize in custom medical equipment design and manufacturing. 
                Contact our specialists to discuss your unique requirements.
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
                <Phone className="mr-2 h-5 w-5" />
                Call 1-800-328-2358
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default ProductGallery;