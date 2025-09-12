import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { generateProductSlug } from '@/utils/productUtils';

const ProductRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProductAndRedirect = async () => {
      if (!slug) {
        setRedirectUrl('/products');
        setLoading(false);
        return;
      }

      try {
        // First, try to find a regular product by slug
        const { data: product } = await supabase.rpc('find_product_by_name_slug', {
          slug_text: slug
        });

        if (product && product.length > 0) {
          const productSlug = generateProductSlug(product[0].name);
          setRedirectUrl(`/products/${productSlug}`);
          setLoading(false);
          return;
        }

        // If no regular product found, try custom products
        const { data: customProduct } = await supabase.rpc('find_custom_product_by_name_slug', {
          slug_text: slug
        });

        if (customProduct && customProduct.length > 0) {
          const productSlug = generateProductSlug(customProduct[0].name);
          setRedirectUrl(`/products/${productSlug}`);
          setLoading(false);
          return;
        }

        // If no product found with exact slug match, try to find by manual mapping
        // This handles cases where the old URL structure might have slight differences
        const { data: allProducts } = await supabase
          .from('products')
          .select('name');

        const { data: allCustomProducts } = await supabase
          .from('custom_products')
          .select('name');

        // Check if any product slug matches when generated
        const allProductNames = [
          ...(allProducts || []).map(p => p.name),
          ...(allCustomProducts || []).map(p => p.name)
        ];

        for (const productName of allProductNames) {
          const generatedSlug = generateProductSlug(productName);
          if (generatedSlug === slug) {
            setRedirectUrl(`/products/${generatedSlug}`);
            setLoading(false);
            return;
          }
        }

        // If still no match found, redirect to products page
        setRedirectUrl('/products');
      } catch (error) {
        console.error('Error finding product for redirect:', error);
        setRedirectUrl('/products');
      }

      setLoading(false);
    };

    findProductAndRedirect();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-primary">Redirecting...</div>
    </div>;
  }

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace={true} />;
  }

  return <Navigate to="/products" replace={true} />;
};

export default ProductRedirect;