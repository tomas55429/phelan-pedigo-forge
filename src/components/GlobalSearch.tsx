import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'category';
  url: string;
}

interface GlobalSearchProps {
  onClose?: () => void;
}

const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const searchContent = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, description')
        .or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`);

      // Search categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, description')
        .or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`);

      const searchResults: SearchResult[] = [
        ...(products || []).map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || 'Product',
          type: 'product' as const,
          url: `/products?search=${encodeURIComponent(product.name)}`
        })),
        ...(categories || []).map(category => ({
          id: category.id,
          title: category.name,
          description: category.description || 'Category',
          type: 'category' as const,
          url: `/products?category=${category.id}`
        }))
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchContent(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose?.();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {result.type} • {result.description}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;