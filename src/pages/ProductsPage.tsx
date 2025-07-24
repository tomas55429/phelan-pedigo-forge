import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Handle URL parameter for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <Header />
      <ProductGallery selectedCategoryId={selectedCategoryId} />
      <Footer />
    </div>
  );
};

export default ProductsPage;