import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import ProductionDeploymentBanner from '@/components/ProductionDeploymentBanner';
import { useDataRefresh } from '@/hooks/useProductData';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshAllData } = useDataRefresh();

  // Handle URL parameters for category filtering and search
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Handle manual data refresh for production
  const handleProductionRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductionDeploymentBanner 
          onRefresh={handleProductionRefresh}
          isRefreshing={isRefreshing}
        />
        <ProductGallery 
          selectedCategoryId={selectedCategoryId} 
          initialSearchTerm={searchTerm}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;