import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import History from '@/components/History';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Products />
      <History />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
