import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Handle URL parameters for category filtering and search
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
    } else {
      setSelectedCategoryId(null);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <Header />
      <ProductGallery 
        selectedCategoryId={selectedCategoryId} 
        searchQuery={searchParams.get('search')} 
      />
      <Footer />
    </div>
  );
};

export default ProductsPage;