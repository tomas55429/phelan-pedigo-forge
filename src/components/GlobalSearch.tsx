import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Package, Tag, MapPin, Phone, Mail, Info, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;
type ProductFeature = Tables<'product_features'>;
type ProductSpecification = Tables<'product_specifications'>;

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'category' | 'feature' | 'specification' | 'page' | 'contact';
  url: string;
  relevance: number;
  metadata?: {
    category?: string;
    productName?: string;
    badge?: string;
  };
}

interface StaticContent {
  title: string;
  description: string;
  type: 'page' | 'contact';
  url: string;
  keywords: string[];
}

const staticContent: StaticContent[] = [
  {
    title: "About Phelan Manufacturing",
    description: "Learn about our history, mission, and commitment to manufacturing high-quality medical equipment. Family-owned business with decades of experience.",
    type: "page",
    url: "/about",
    keywords: ["about", "company", "history", "mission", "family", "manufacturing", "experience", "values"]
  },
  {
    title: "Company History",
    description: "Discover our journey from a small startup to a trusted manufacturer of medical equipment. See how we've grown and evolved over the years.",
    type: "page",
    url: "/history",
    keywords: ["history", "timeline", "growth", "evolution", "journey", "founded", "established"]
  },
  {
    title: "Contact Information",
    description: "Get in touch with our specialists. Phone: 1-800-328-2358 | (612) 724-3677, Email: Richard@PhelanMfgCorp.com. We accept Purchase Orders (P.O.).",
    type: "contact",
    url: "/contact",
    keywords: ["contact", "phone", "email", "specialists", "support", "purchase orders", "P.O.", "Richard"]
  },
  {
    title: "Medical Equipment Products",
    description: "Browse our complete catalog of medical equipment including carts, stands, screens, baskets, and custom solutions.",
    type: "page",
    url: "/products",
    keywords: ["products", "medical equipment", "catalog", "browse", "solutions", "custom"]
  },
  {
    title: "Background Removal Tool",
    description: "Use our advanced AI-powered background removal tool to process product images and create clean, professional visuals.",
    type: "page",
    url: "/background-removal",
    keywords: ["background removal", "AI", "image processing", "tool", "photos", "editing"]
  },
  {
    title: "Purchase Orders Accepted",
    description: "We accept Purchase Orders (P.O.) for institutional and healthcare facility orders. Contact us to discuss procurement needs.",
    type: "contact",
    url: "/contact",
    keywords: ["purchase orders", "P.O.", "institutional", "healthcare", "procurement", "payment terms"]
  }
];

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (searchTerm.length < 2) {
        return;
      }

      setIsLoading(true);
      setShowResults(true);

      try {
        // Fetch all data for comprehensive search
        const [productsRes, categoriesRes, featuresRes, specificationsRes] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('product_features').select('*'),
          supabase.from('product_specifications').select('*')
        ]);

        const products = productsRes.data || [];
        const categories = categoriesRes.data || [];
        const features = featuresRes.data || [];
        const specifications = specificationsRes.data || [];

        const results: SearchResult[] = [];
        const searchTermLower = searchTerm.toLowerCase();

        // Search products
        products.forEach((product: Product) => {
          let relevance = 0;
          const category = categories.find(cat => cat.id === product.category_id);
          
          // Calculate relevance based on matches
          if (product.name?.toLowerCase().includes(searchTermLower)) {
            relevance += product.name.toLowerCase().indexOf(searchTermLower) === 0 ? 10 : 5;
          }
          if (product.description?.toLowerCase().includes(searchTermLower)) {
            relevance += 3;
          }
          if (product.special_notes?.toLowerCase().includes(searchTermLower)) {
            relevance += 2;
          }
          
          if (relevance > 0) {
            results.push({
              id: `product-${product.id}`,
              title: product.name || 'Unnamed Product',
              description: product.description || '',
              type: 'product',
              url: `/products?search=${encodeURIComponent(product.name || '')}`,
              relevance,
              metadata: {
                category: category?.name,
                badge: 'Product'
              }
            });
          }
        });

        // Search categories
        categories.forEach((category: Category) => {
          let relevance = 0;
          
          if (category.name?.toLowerCase().includes(searchTermLower)) {
            relevance += category.name.toLowerCase().indexOf(searchTermLower) === 0 ? 8 : 4;
          }
          if (category.description?.toLowerCase().includes(searchTermLower)) {
            relevance += 2;
          }
          
          if (relevance > 0) {
            results.push({
              id: `category-${category.id}`,
              title: category.name || 'Unnamed Category',
              description: category.description || `Browse all ${category.name} products`,
              type: 'category',
              url: `/products?category=${category.id}`,
              relevance,
              metadata: {
                badge: 'Category'
              }
            });
          }
        });

        // Search product features
        features.forEach((feature: ProductFeature) => {
          if (feature.feature?.toLowerCase().includes(searchTermLower)) {
            const product = products.find(p => p.id === feature.product_id);
            const category = categories.find(cat => cat.id === product?.category_id);
            
            results.push({
              id: `feature-${feature.id}`,
              title: product?.name || 'Product Feature',
              description: feature.feature,
              type: 'feature',
              url: `/products?search=${encodeURIComponent(product?.name || '')}`,
              relevance: 3,
              metadata: {
                productName: product?.name,
                category: category?.name,
                badge: 'Feature'
              }
            });
          }
        });

        // Search product specifications
        specifications.forEach((spec: ProductSpecification) => {
          const searchMatch = 
            spec.specification_key?.toLowerCase().includes(searchTermLower) ||
            spec.specification_value?.toLowerCase().includes(searchTermLower);
            
          if (searchMatch) {
            const product = products.find(p => p.id === spec.product_id);
            const category = categories.find(cat => cat.id === product?.category_id);
            
            results.push({
              id: `spec-${spec.id}`,
              title: product?.name || 'Product Specification',
              description: `${spec.specification_key}: ${spec.specification_value}`,
              type: 'specification',
              url: `/products?search=${encodeURIComponent(product?.name || '')}`,
              relevance: 2,
              metadata: {
                productName: product?.name,
                category: category?.name,
                badge: 'Specification'
              }
            });
          }
        });

        // Search static content
        staticContent.forEach((content, index) => {
          let relevance = 0;
          
          if (content.title.toLowerCase().includes(searchTermLower)) {
            relevance += content.title.toLowerCase().indexOf(searchTermLower) === 0 ? 7 : 4;
          }
          if (content.description.toLowerCase().includes(searchTermLower)) {
            relevance += 3;
          }
          
          // Check keywords
          const keywordMatch = content.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTermLower) || 
            searchTermLower.includes(keyword.toLowerCase())
          );
          if (keywordMatch) {
            relevance += 2;
          }
          
          if (relevance > 0) {
            results.push({
              id: `static-${index}`,
              title: content.title,
              description: content.description,
              type: content.type,
              url: content.url,
              relevance,
              metadata: {
                badge: content.type === 'contact' ? 'Contact' : 'Page'
              }
            });
          }
        });

        // Sort by relevance and limit results
        const sortedResults = results
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 10);

        setSearchResults(sortedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && searchResults.length > 0) {
      // Navigate to the most relevant result
      const topResult = searchResults[0];
      navigate(topResult.url);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setShowResults(false);
    setSearchTerm('');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'category': return Tag;
      case 'feature': return Info;
      case 'specification': return FileText;
      case 'contact': return Phone;
      default: return FileText;
    }
  };

  return (
    <div ref={searchRef} className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, features, pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          className="pl-10 h-8 pb-2 mb-2 bg-background/50 border-border/50 focus:bg-background"
        />
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 min-w-full">
          <Card className="shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-2">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="h-4 w-4 animate-pulse mx-auto mb-2" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((result) => {
                    const Icon = getResultIcon(result.type);
                    return (
                      <Button
                        key={result.id}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto text-left hover:bg-muted/50 min-h-fit"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">
                                {result.title}
                              </span>
                              {result.metadata?.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {result.description}
                            </p>
                            {result.metadata?.category && (
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {result.metadata.category}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                        </div>
                      </Button>
                    );
                  })}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="h-4 w-4 mx-auto mb-2" />
                  No results found for "{searchTerm}"
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Type at least 2 characters to search
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;