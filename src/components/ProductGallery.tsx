import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Eye, FileText, Star, Grid3X3, List, Phone, Loader2 } from 'lucide-react';
import ProductVariantsTable from './ProductVariantsTable';
import Product3DViewer from './Product3DViewer';

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

const ProductGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [productsWithDetails, setProductsWithDetails] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);

  // Fetch products and related data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [productsRes, categoriesRes, variantsRes, featuresRes, specificationsRes] = await Promise.all([
          supabase.from('products').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
          supabase.from('product_variants').select('*'),
          supabase.from('product_features').select('*'),
          supabase.from('product_specifications').select('*')
        ]);

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

  const filteredProducts = useMemo(() => {
    return productsWithDetails.filter(({ product, category }) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Products' || category?.name === selectedCategory;
      
      const matchesFeatured = !showFeaturedOnly || product.featured;
      
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [searchTerm, selectedCategory, showFeaturedOnly, productsWithDetails]);

  const ProductCard = ({ productWithDetails }: { productWithDetails: ProductWithDetails }) => {
    const { product, category, variants, features } = productWithDetails;
    
    return (
      <Card className="professional-hover bg-card shadow-card overflow-hidden">
        <div className="relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            {variants.length > 1 && (
              <Badge variant="outline" className="text-xs">
                {variants.length} variants
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{category?.name || 'Uncategorized'}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          
          <div className="space-y-3">
            {features.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold mb-2">Key Features:</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {features.slice(0, 3).map((feature) => (
                    <li key={feature.id} className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                      <span>{feature.feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {variants.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold mb-2">Available Variants:</h5>
                <div className="flex flex-wrap gap-1">
                  {variants.slice(0, 3).map((variant) => (
                    <Badge key={variant.id} variant="secondary" className="text-xs">
                      {variant.variant_name}
                    </Badge>
                  ))}
                  {variants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{variants.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Special Notes */}
          {product.special_notes && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
              <p className="text-xs font-medium text-warning-foreground mb-1">Special Notes:</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.special_notes}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => setSelectedProduct(productWithDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ productWithDetails }: { productWithDetails: ProductWithDetails }) => {
    const { product, category, variants, features } = productWithDetails;
    
    return (
      <Card className="professional-hover bg-card shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center rounded">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {product.featured && (
                <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {variants.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {variants.length} variants
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{category?.name || 'Uncategorized'}</p>
              <p className="text-sm text-muted-foreground mb-3">{product.description || 'No description available'}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                {features.length > 0 && (
                  <div>
                    <strong>Features:</strong>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {features.slice(0, 2).map((feature) => (
                        <li key={feature.id}>• {feature.feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {variants.length > 0 && (
                  <div>
                    <strong>Variants:</strong>
                    <div className="mt-1 space-y-1 text-muted-foreground">
                      {variants.slice(0, 2).map((variant) => (
                        <div key={variant.id}>• {variant.variant_name}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm"
                onClick={() => setSelectedProduct(productWithDetails)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                Specs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{selectedProduct.product.name}</h2>
                  <p className="text-muted-foreground text-lg">{selectedProduct.category?.name || 'Uncategorized'}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  ✕
                </Button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8 mb-6">
                {/* Left Column - 3D Viewer and Traditional Image */}
                <div className="space-y-4">
                  {/* 3D Product Viewer */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3">3D Product View</h3>
                    <Product3DViewer 
                      imageUrl={selectedProduct.product.image_url || undefined}
                      productName={selectedProduct.product.name}
                      className="w-full h-80"
                    />
                  </div>
                  
                  {/* Traditional Product Image */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Product Image</h3>
                    {selectedProduct.product.image_url ? (
                      <img
                        src={selectedProduct.product.image_url}
                        alt={selectedProduct.product.name}
                        className="w-full h-64 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg border border-border">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Product Information */}
                <div>
                  <p className="text-muted-foreground mb-4">
                    {selectedProduct.product.description || 'No description available'}
                  </p>
                  
                  {selectedProduct.features.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Features:</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {selectedProduct.features.map((feature) => (
                          <li key={feature.id} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            <span>{feature.feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedProduct.variants.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Available Variants:</h3>
                      <div className="space-y-2">
                        {selectedProduct.variants.map((variant) => (
                          <div key={variant.id} className="p-2 border border-border rounded">
                            <div className="font-medium">{variant.variant_name}</div>
                            {variant.variant_description && (
                              <div className="text-sm text-muted-foreground">{variant.variant_description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedProduct.specifications.length > 0 && (
                <ProductVariantsTable
                  variants={selectedProduct.variants}
                  specifications={selectedProduct.specifications}
                />
              )}
              
              {/* Special Notes Section */}
              {selectedProduct.product.special_notes && (
                <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Special Notes
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedProduct.product.special_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
                  <Input
                    placeholder="Search products, models, or features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="All Products">All Products</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Featured Toggle */}
                <Button
                  variant={showFeaturedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Featured Only
                </Button>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border border-border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
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
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(productWithDetails => (
              <ProductCard key={productWithDetails.product.id} productWithDetails={productWithDetails} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map(productWithDetails => (
              <ProductListItem key={productWithDetails.product.id} productWithDetails={productWithDetails} />
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Products');
                setShowFeaturedOnly(false);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

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
    </div>
  );
};

export default ProductGallery;