import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import CategoriesSection from '@/components/CategoriesSection';

const ProductsPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Header />
      <CategoriesSection 
        onCategorySelect={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
      />
      <ProductGallery selectedCategoryId={selectedCategoryId} />
      <Footer />
    </div>
  );
};

export default ProductsPage;