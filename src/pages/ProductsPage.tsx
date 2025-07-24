import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoriesSection from '@/components/CategoriesSection';

const ProductsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <CategoriesSection 
        onCategorySelect={() => {}} // No action needed since we're just displaying categories
        selectedCategoryId={null}
      />
      <Footer />
    </div>
  );
};

export default ProductsPage;