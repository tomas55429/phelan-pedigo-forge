import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundRemovalTool from '@/components/BackgroundRemovalTool';

const BackgroundRemovalPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <BackgroundRemovalTool />
      <Footer />
    </div>
  );
};

export default BackgroundRemovalPage;