import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';

const ProductsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <ProductGallery />
      <Footer />
    </div>
  );
};

export default ProductsPage;