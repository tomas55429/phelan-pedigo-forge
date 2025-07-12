import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Phone,
  FileText,
  Star,
  Eye
} from 'lucide-react';

// Import product images
import ivStand1 from '@/assets/products/iv-stand-1.jpg';
import medicalCart1 from '@/assets/products/medical-cart-1.jpg';
import sterilizationBasket1 from '@/assets/products/sterilization-basket-1.jpg';
import stepStand1 from '@/assets/products/step-stand-1.jpg';
import privacyScreen1 from '@/assets/products/privacy-screen-1.jpg';
import backTable1 from '@/assets/products/back-table-1.jpg';

interface Product {
  id: string;
  name: string;
  category: string;
  model: string;
  description: string;
  features: string[];
  image: string;
  featured: boolean;
  specifications: {
    height?: string;
    width?: string;
    depth?: string;
    weight?: string;
    material: string;
    capacity?: string;
  };
}

const products: Product[] = [
  {
    id: 'pmc-iv-001',
    name: 'Adjustable IV Stand',
    category: 'IV Stands and Carts',
    model: 'PMC-IV-001',
    description: 'Professional adjustable IV stand with smooth-rolling casters and durable stainless steel construction.',
    features: ['Adjustable height 48"-84"', 'Four smooth-rolling casters', 'Stainless steel construction', 'Easy-grip adjustment mechanism'],
    image: ivStand1,
    featured: true,
    specifications: {
      height: '48" - 84" adjustable',
      width: '18"',
      material: 'Stainless Steel',
      weight: '12 lbs'
    }
  },
  {
    id: 'pmc-cart-001',
    name: 'Multi-Purpose Medical Cart',
    category: 'IV Stands and Carts',
    model: 'PMC-CART-001',
    description: 'Versatile medical cart with multiple shelves for equipment organization and transport.',
    features: ['Three adjustable shelves', 'Push-handle design', 'Corrosion-resistant finish', 'Hospital-grade casters'],
    image: medicalCart1,
    featured: true,
    specifications: {
      height: '36"',
      width: '24"',
      depth: '18"',
      material: 'Stainless Steel',
      capacity: '150 lbs per shelf'
    }
  },
  {
    id: 'pmc-basket-001',
    name: 'Sterilization Instrument Basket',
    category: 'Sterilization Baskets and Trays',
    model: 'PMC-BASKET-001',
    description: 'Perforated stainless steel basket designed for autoclave sterilization of medical instruments.',
    features: ['Autoclave compatible', 'Perforated for drainage', 'Stackable design', 'Easy-grip handles'],
    image: sterilizationBasket1,
    featured: false,
    specifications: {
      height: '4"',
      width: '12"',
      depth: '8"',
      material: 'Stainless Steel 316L',
      weight: '2.5 lbs'
    }
  },
  {
    id: 'pmc-step-001',
    name: 'Medical Step Stand',
    category: 'Step Stands and Working Platforms',
    model: 'PMC-STEP-001',
    description: 'Stable step stand with non-slip surface for safe access to elevated work areas.',
    features: ['Non-slip rubber surface', 'Welded construction', 'Rounded corners', 'Lightweight design'],
    image: stepStand1,
    featured: false,
    specifications: {
      height: '8"',
      width: '14"',
      depth: '10"',
      material: 'Stainless Steel',
      capacity: '300 lbs'
    }
  },
  {
    id: 'pmc-screen-001',
    name: 'Privacy Screen',
    category: 'Screens, Guards, Face Butlers',
    model: 'PMC-SCREEN-001',
    description: 'Adjustable privacy screen with rolling base for patient privacy and room division.',
    features: ['Three-panel design', 'Easy folding mechanism', 'Washable fabric panels', 'Smooth-rolling base'],
    image: privacyScreen1,
    featured: true,
    specifications: {
      height: '72"',
      width: '54" (extended)',
      material: 'Aluminum frame with vinyl panels',
      weight: '25 lbs'
    }
  },
  {
    id: 'pmc-table-001',
    name: 'Surgical Back Table',
    category: 'Neurosurgical, Thoracic Instrument and Back Tables',
    model: 'PMC-TABLE-001',
    description: 'Height-adjustable surgical table with smooth stainless steel surface for instrument organization.',
    features: ['Height adjustable', 'Smooth stainless surface', 'Easy to sanitize', 'Stable base design'],
    image: backTable1,
    featured: true,
    specifications: {
      height: '30" - 42" adjustable',
      width: '24"',
      depth: '18"',
      material: 'Stainless Steel',
      capacity: '100 lbs'
    }
  }
];

const categories = [
  'All Products',
  'IV Stands and Carts',
  'Screens, Guards, Face Butlers',
  'Step Stands and Working Platforms',
  'Sterilization Baskets and Trays',
  'Neurosurgical, Thoracic Instrument and Back Tables'
];

const ProductGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
      
      const matchesFeatured = !showFeaturedOnly || product.featured;
      
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [searchTerm, selectedCategory, showFeaturedOnly]);

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="professional-hover bg-card shadow-card overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
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
          <Badge variant="outline" className="text-xs">
            {product.model}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-semibold mb-2">Key Features:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-semibold mb-2">Specifications:</h5>
            <div className="text-xs text-muted-foreground space-y-1">
              {product.specifications.height && (
                <div><strong>Height:</strong> {product.specifications.height}</div>
              )}
              <div><strong>Material:</strong> {product.specifications.material}</div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" className="flex-1">
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

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="professional-hover bg-card shadow-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded"
            />
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
              <Badge variant="outline" className="text-xs">
                {product.model}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong>Features:</strong>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Material:</strong> {product.specifications.material}
                {product.specifications.height && (
                  <div><strong>Height:</strong> {product.specifications.height}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button size="sm">
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

  return (
    <div className="py-20 bg-background">
      <div className="container mx-auto px-4">
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
            Showing {filteredProducts.length} of {products.length} products
            {selectedCategory !== 'All Products' && ` in "${selectedCategory}"`}
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <ProductListItem key={product.id} product={product} />
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