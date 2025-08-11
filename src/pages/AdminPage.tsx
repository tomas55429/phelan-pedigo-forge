import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  ArrowLeft,
  Package,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  GripVertical,
  X,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductVariantsTable from '@/components/ProductVariantsTable';
import SizeSpecificationInput from '@/components/SizeSpecificationInput';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  show_on_homepage: boolean;
}

interface Product {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  special_notes: string | null;
  image_url: string | null;
  model_3d_url: string | null;
  featured: boolean;
  categories?: { name: string };
}

interface ProductFeature {
  id: string;
  product_id: string;
  variant_id: string; // Now required since all features must belong to variants
  feature: string;
  is_optional?: boolean;
  image_url?: string;
}

interface ProductSpecification {
  id: string;
  product_id: string;
  variant_id?: string;
  specification_key: string;
  specification_value: string;
  sort_order?: number;
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
  model_3d_url?: string;
  created_at: string;
  updated_at: string;
}

interface CustomProduct {
  id: string;
  name: string;
  description?: string;
  main_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface CustomProductImage {
  id: string;
  custom_product_id: string;
  image_url: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

// Helper function to format variant name - removes hyphens and everything after them
const formatVariantName = (variantName: string) => {
  const name = variantName || '';
  // Remove hyphen and everything after it
  const cleanName = name.split('-')[0].trim();
  return cleanName;
};

const AdminPage = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryShowOnHomepage, setCategoryShowOnHomepage] = useState(true);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productCategoryIds, setProductCategoryIds] = useState<string[]>([]);
  const [productDescription, setProductDescription] = useState('');
  const [productSpecialNotes, setProductSpecialNotes] = useState('');
  const [productFeatured, setProductFeatured] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [product3DModel, setProduct3DModel] = useState<File | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // State for features and specs
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newOptionalFeature, setNewOptionalFeature] = useState('');
  const [accessoryImage, setAccessoryImage] = useState<File | null>(null);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [draggedSpecId, setDraggedSpecId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // State for variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantDescription, setVariantDescription] = useState('');
  const [variantImage, setVariantImage] = useState<File | null>(null);
  const [variant3DModel, setVariant3DModel] = useState<File | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // State for product dimensions configuration
  const [productDimensions, setProductDimensions] = useState<{key: string, label: string, enabled: boolean}[]>([
    { key: 'width', label: 'Width', enabled: true },
    { key: 'length', label: 'Length', enabled: true },
    { key: 'depth', label: 'Depth', enabled: true }
  ]);

  // State for custom products
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [customProductImages, setCustomProductImages] = useState<CustomProductImage[]>([]);
  const [customProductName, setCustomProductName] = useState('');
  const [customProductDescription, setCustomProductDescription] = useState('');
  const [customProductMainImage, setCustomProductMainImage] = useState<File | null>(null);
  const [customProductAdditionalImages, setCustomProductAdditionalImages] = useState<{file: File, description: string}[]>([]);
  const [editingCustomProduct, setEditingCustomProduct] = useState<CustomProduct | null>(null);
  const [customProductDialogOpen, setCustomProductDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCustomProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id(name)
        `)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const fetchCustomProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCustomProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch custom products",
        variant: "destructive",
      });
    }
  };

  const fetchCustomProductImages = async (customProductId: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_product_images')
        .select('*')
        .eq('custom_product_id', customProductId)
        .order('sort_order');
      
      if (error) throw error;
      setCustomProductImages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch custom product images",
        variant: "destructive",
      });
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      const [featuresRes, specsRes, variantsRes] = await Promise.all([
        supabase
          .from('product_features')
          .select('*')
          .eq('product_id', productId)
          .order('is_optional', { ascending: true })
          .order('feature'),
        supabase
          .from('product_specifications')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true })
          .order('specification_key', { ascending: true }),
        supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('variant_name')
      ]);

      if (featuresRes.error) throw featuresRes.error;
      if (specsRes.error) throw specsRes.error;
      if (variantsRes.error) throw variantsRes.error;

      setFeatures(featuresRes.data || []);
      setSpecifications(specsRes.data || []);
      setVariants(variantsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (categoryImage) {
        imageUrl = await uploadCategoryImage(categoryImage);
        if (!imageUrl) return;
      }

      if (editingCategory) {
        const updateData: any = {
          name: categoryName,
          description: categoryDescription || null,
          show_on_homepage: categoryShowOnHomepage,
        };
        
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from('categories')
          .update(updateData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: categoryName,
            description: categoryDescription || null,
            image_url: imageUrl,
            show_on_homepage: categoryShowOnHomepage,
          }]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Category created successfully" });
      }

      setCategoryName('');
      setCategoryDescription('');
      setCategoryShowOnHomepage(true);
      setCategoryImage(null);
      setEditingCategory(null);
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadCategoryImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload category image",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const upload3DModel = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-3d-models')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-3d-models')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload 3D model",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleCustomProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProductName.trim()) return;

    setLoading(true);
    try {
      let mainImageUrl = editingCustomProduct?.main_image_url || null;
      
      if (customProductMainImage) {
        const uploadedUrl = await uploadProductImage(customProductMainImage);
        if (uploadedUrl) mainImageUrl = uploadedUrl;
      }

      const productData = {
        name: customProductName,
        description: customProductDescription || null,
        main_image_url: mainImageUrl,
      };

      let customProductId: string;

      if (editingCustomProduct) {
        const { error } = await supabase
          .from('custom_products')
          .update(productData)
          .eq('id', editingCustomProduct.id);
        
        if (error) throw error;
        customProductId = editingCustomProduct.id;

        // Delete existing additional images
        await supabase
          .from('custom_product_images')
          .delete()
          .eq('custom_product_id', customProductId);
      } else {
        const { data, error } = await supabase
          .from('custom_products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        customProductId = data.id;
      }

      // Upload and insert additional images
      if (customProductAdditionalImages.length > 0) {
        const imagePromises = customProductAdditionalImages.map(async (item, index) => {
          const uploadedUrl = await uploadProductImage(item.file);
          if (uploadedUrl) {
            return {
              custom_product_id: customProductId,
              image_url: uploadedUrl,
              description: item.description || null,
              sort_order: index
            };
          }
          return null;
        });

        const imageData = (await Promise.all(imagePromises)).filter(Boolean);
        
        if (imageData.length > 0) {
          const { error } = await supabase
            .from('custom_product_images')
            .insert(imageData);

          if (error) throw error;
        }
      }

      toast({ 
        title: "Success", 
        description: editingCustomProduct ? "Custom product updated successfully" : "Custom product created successfully" 
      });

      resetCustomProductForm();
      fetchCustomProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCustomProductForm = () => {
    setCustomProductName('');
    setCustomProductDescription('');
    setCustomProductMainImage(null);
    setCustomProductAdditionalImages([]);
    setEditingCustomProduct(null);
    setCustomProductDialogOpen(false);
  };

  const handleEditCustomProduct = (customProduct: CustomProduct) => {
    setCustomProductName(customProduct.name);
    setCustomProductDescription(customProduct.description || '');
    setEditingCustomProduct(customProduct);
    setCustomProductDialogOpen(true);
  };

  const handleDeleteCustomProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom product?')) return;

    try {
      const { error } = await supabase
        .from('custom_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Custom product deleted successfully" });
      fetchCustomProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    try {
      let imageUrl = editingProduct?.image_url || null;
      let model3DUrl = editingProduct?.model_3d_url || null;
      
      if (productImage) {
        const uploadedUrl = await uploadProductImage(productImage);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      if (product3DModel) {
        const uploaded3DUrl = await upload3DModel(product3DModel);
        if (uploaded3DUrl) model3DUrl = uploaded3DUrl;
      }

      const productData = {
        name: productName,
        // Keep the old category_id for backward compatibility for now
        category_id: productCategoryIds.length > 0 ? productCategoryIds[0] : null,
        description: productDescription || null,
        special_notes: productSpecialNotes || null,
        image_url: imageUrl,
        model_3d_url: model3DUrl,
        featured: productFeatured,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        productId = editingProduct.id;

        // Delete existing category relationships
        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', productId);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        productId = data.id;
      }

      // Insert new category relationships
      if (productCategoryIds.length > 0) {
        const categoryRelations = productCategoryIds.map(categoryId => ({
          product_id: productId,
          category_id: categoryId
        }));

        const { error } = await supabase
          .from('product_categories')
          .insert(categoryRelations);

        if (error) throw error;
      }

      toast({ 
        title: "Success", 
        description: editingProduct ? "Product updated successfully" : "Product created successfully" 
      });

      resetProductForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductName('');
    setProductCategoryIds([]);
    setProductDescription('');
    setProductSpecialNotes('');
    setProductFeatured(false);
    setProductImage(null);
    setProduct3DModel(null);
    
    setEditingProduct(null);
    setProductDialogOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddFeature = async (isOptional: boolean = false) => {
    const featureText = isOptional ? newOptionalFeature : newFeature;
    if (!selectedProduct || !featureText.trim()) {
      toast({
        title: "Error",
        description: "Please select a product and enter a feature",
        variant: "destructive",
      });
      return;
    }

    // Now features must be associated with a variant
    if (!selectedVariant) {
      toast({
        title: "Error",
        description: "Please select a variant to add features to",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = null;

      // Upload image for accessories (optional features) if provided
      if (isOptional && accessoryImage) {
        const fileExt = accessoryImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, accessoryImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('product_features')
        .insert([{
          product_id: selectedProduct.id,
          variant_id: selectedVariant.id,
          feature: featureText,
          is_optional: isOptional,
          image_url: imageUrl,
        }]);
      
      if (error) throw error;
      if (isOptional) {
        setNewOptionalFeature('');
        setAccessoryImage(null);
      } else {
        setNewFeature('');
      }
      fetchProductDetails(selectedProduct.id);
      toast({ 
        title: "Success", 
        description: `${isOptional ? 'Accessory' : 'Feature'} added to ${formatVariantName(selectedVariant.variant_name)}` 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddProductAccessory = async () => {
    if (!newOptionalFeature.trim() || !editingProduct) return;

    try {
      let imageUrl = null;
      
      // Upload image for accessories if provided
      if (accessoryImage) {
        const fileExt = accessoryImage.name.split('.').pop();
        const filePath = `accessory-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, accessoryImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        imageUrl = data.publicUrl;
      }

      // Since accessories are now product-level, we need a default variant or create one
      let defaultVariant = variants.find(v => v.variant_name.toLowerCase().includes('default')) || variants[0];
      
      if (!defaultVariant && variants.length === 0) {
        // Create a default variant if none exists
        const { data: newVariantData, error: variantError } = await supabase
          .from('product_variants')
          .insert([{
            product_id: editingProduct.id,
            variant_name: 'Standard',
            variant_description: 'Standard configuration'
          }])
          .select()
          .single();

        if (variantError) throw variantError;
        defaultVariant = newVariantData;
        setVariants([...variants, defaultVariant]);
      }

      const { error } = await supabase
        .from('product_features')
        .insert([{
          product_id: editingProduct.id,
          variant_id: defaultVariant!.id,
          feature: newOptionalFeature,
          is_optional: true,
          image_url: imageUrl
        }]);
      
      if (error) throw error;
      
      setNewOptionalFeature('');
      setAccessoryImage(null);
      fetchProductDetails(editingProduct.id);
      
      toast({ 
        title: "Success", 
        description: "Accessory added to product" 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const { error } = await supabase
        .from('product_features')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      if (selectedProduct) fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Feature deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleAddSpecification = async () => {
    if (!selectedProduct || !newSpecKey.trim() || !newSpecValue.trim()) return;

    try {
      // Get the highest sort_order for this product and add 1
      const { data: existingSpecs } = await supabase
        .from('product_specifications')
        .select('sort_order')
        .eq('product_id', selectedProduct.id)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingSpecs && existingSpecs.length > 0 
        ? (existingSpecs[0].sort_order || 0) + 1 
        : 0;

      const specData = {
        product_id: selectedProduct.id,
        specification_key: newSpecKey,
        specification_value: newSpecValue,
        variant_id: selectedVariant?.id || null,
        sort_order: nextSortOrder,
      };

      const { error } = await supabase
        .from('product_specifications')
        .insert([specData]);
      
      if (error) throw error;
      setNewSpecKey('');
      setNewSpecValue('');
      setSelectedVariant(null);
      fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Specification added successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_specifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      if (selectedProduct) fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Specification deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, specId: string) => {
    setDraggedSpecId(specId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedSpecId || !selectedProduct) return;

    try {
      // Get current specifications ordered by sort_order
      const { data: allSpecs, error: fetchError } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', selectedProduct.id)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      if (!allSpecs) return;

      const draggedIndex = allSpecs.findIndex(spec => spec.id === draggedSpecId);
      if (draggedIndex === -1 || draggedIndex === dropIndex) return;

      // Create new order array
      const reorderedSpecs = [...allSpecs];
      const [draggedItem] = reorderedSpecs.splice(draggedIndex, 1);
      reorderedSpecs.splice(dropIndex, 0, draggedItem);

      // Update sort_order values for all affected items
      const updates = reorderedSpecs.map((spec, index) => ({
        id: spec.id,
        sort_order: index
      }));

      // Execute updates
      for (const update of updates) {
        const { error } = await supabase
          .from('product_specifications')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }

      // Refresh the data
      fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Specification order updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDraggedSpecId(null);
      setDragOverIndex(null);
    }
  };

  // Variant management functions
  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !variantName.trim()) return;

    setLoading(true);
    try {
      let imageUrl = editingVariant?.image_url || null;
      let model3DUrl = editingVariant?.model_3d_url || null;
      
      if (variantImage) {
        const uploadedUrl = await uploadProductImage(variantImage);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      if (variant3DModel) {
        const uploaded3DUrl = await upload3DModel(variant3DModel);
        if (uploaded3DUrl) model3DUrl = uploaded3DUrl;
      }

      const variantData = {
        product_id: selectedProduct.id,
        variant_name: variantName,
        variant_description: variantDescription || null,
        image_url: imageUrl,
        model_3d_url: model3DUrl,
      };

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Variant updated successfully" });
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert([variantData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Variant created successfully" });
      }

      resetVariantForm();
      fetchProductDetails(selectedProduct.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetVariantForm = () => {
    setVariantName('');
    setVariantDescription('');
    setVariantImage(null);
    setVariant3DModel(null);
    setEditingVariant(null);
    setVariantDialogOpen(false);
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      if (selectedProduct) fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Variant deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Site
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </TabsTrigger>
              <TabsTrigger value="custom-products" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Custom Products</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Product Details</span>
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Categories</h2>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Textarea
                          id="categoryDescription"
                          value={categoryDescription}
                          onChange={(e) => setCategoryDescription(e.target.value)}
                          placeholder="Enter category description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryImage">Category Image</Label>
                        <Input
                          id="categoryImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
                        />
                        {categoryImage && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Selected: {categoryImage.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="categoryShowOnHomepage"
                          checked={categoryShowOnHomepage}
                          onCheckedChange={(checked) => setCategoryShowOnHomepage(checked as boolean)}
                        />
                        <Label htmlFor="categoryShowOnHomepage" className="text-sm">
                          Show on homepage categories section
                        </Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setCategoryDialogOpen(false);
                            setEditingCategory(null);
                            setCategoryName('');
                            setCategoryDescription('');
                            setCategoryShowOnHomepage(true);
                            setCategoryImage(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Homepage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell>
                            {category.image_url ? (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              category.show_on_homepage 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.show_on_homepage ? 'Visible' : 'Hidden'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                onClick={() => {
                  setEditingCategory(category);
                  setCategoryName(category.name);
                  setCategoryDescription(category.description || '');
                  setCategoryShowOnHomepage(category.show_on_homepage);
                  setCategoryDialogOpen(true);
                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Products</h2>
                <Dialog open={productDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    resetProductForm(); // Reset form when dialog closes
                  }
                  setProductDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      // Reset form when Add Product is clicked
                      resetProductForm();
                      setProductDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="productCategories">Categories</Label>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`category-${category.id}`}
                                checked={productCategoryIds.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProductCategoryIds([...productCategoryIds, category.id]);
                                  } else {
                                    setProductCategoryIds(productCategoryIds.filter(id => id !== category.id));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`category-${category.id}`} className="text-sm">
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="productDescription">Description</Label>
                        <Textarea
                          id="productDescription"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          placeholder="Enter product description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productSpecialNotes">Special Notes / Disclaimer</Label>
                        <Textarea
                          id="productSpecialNotes"
                          value={productSpecialNotes}
                          onChange={(e) => setProductSpecialNotes(e.target.value)}
                          placeholder="Enter special notes or disclaimers for this product"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="productImage">Product Image</Label>
                        <Input
                          id="productImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product3DModel">3D Model (GLB/GLTF)</Label>
                        <Input
                          id="product3DModel"
                          type="file"
                          accept=".glb,.gltf"
                          onChange={(e) => setProduct3DModel(e.target.files?.[0] || null)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload a 3D model file in GLB or GLTF format for interactive viewing
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="productFeatured"
                          type="checkbox"
                          checked={productFeatured}
                          onChange={(e) => setProductFeatured(e.target.checked)}
                          className="rounded border-border"
                        />
                         <Label htmlFor="productFeatured">Featured Product</Label>
                       </div>
                       
                       {/* Accessories Section - Only show when editing */}
                       {editingProduct && (
                         <div className="space-y-4 border-t pt-4">
                           <div>
                             <Label className="text-base font-semibold">Product Accessories</Label>
                             <p className="text-sm text-muted-foreground">
                               Manage accessories available for this entire product
                             </p>
                           </div>
                           
                           <div className="space-y-3">
                             <div className="flex space-x-2">
                               <Input
                                 value={newOptionalFeature}
                                 onChange={(e) => setNewOptionalFeature(e.target.value)}
                                 placeholder="Add accessory name"
                                 className="flex-1"
                               />
                               <Input
                                 type="file"
                                 accept="image/*"
                                 onChange={(e) => setAccessoryImage(e.target.files?.[0] || null)}
                                 className="flex-1"
                               />
                               <Button 
                                 type="button"
                                 onClick={() => handleAddProductAccessory()}
                                 size="sm"
                               >
                                 Add
                               </Button>
                             </div>
                             
                             <div className="space-y-2 max-h-40 overflow-y-auto">
                               {features.filter(f => f.is_optional).map((accessory) => (
                                 <div key={accessory.id} className="flex items-center justify-between p-3 bg-muted rounded">
                                   <div className="flex items-center space-x-3 flex-1">
                                     {accessory.image_url && (
                                       <img 
                                         src={accessory.image_url} 
                                         alt={accessory.feature}
                                         className="w-8 h-8 object-cover rounded"
                                       />
                                     )}
                                     <span className="flex-1">{accessory.feature}</span>
                                   </div>
                                   <Button
                                     type="button"
                                     size="sm"
                                     variant="destructive"
                                     onClick={() => handleDeleteFeature(accessory.id)}
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetProductForm}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.categories?.name || '-'}</TableCell>
                          <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setEditingProduct(product);
                                  setProductName(product.name);
                                  setProductDescription(product.description || '');
                                  setProductSpecialNotes(product.special_notes || '');
                                  setProductFeatured(product.featured);
                                  
                                  // Reset file inputs (they can't be pre-filled for security reasons)
                                  setProductImage(null);
                                  setProduct3DModel(null);
                                  
                                  // Fetch current categories for this product
                                  const { data: productCategories } = await supabase
                                    .from('product_categories')
                                    .select('category_id')
                                    .eq('product_id', product.id);
                                  
                                  const categoryIds = productCategories?.map(pc => pc.category_id) || [];
                                  setProductCategoryIds(categoryIds);
                                  
                                  // Fetch product details including accessories
                                  await fetchProductDetails(product.id);
                                  
                                  setProductDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Manage Product Features & Specifications</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Select a Product</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card 
                        key={product.id} 
                        className={`cursor-pointer border-2 transition-all hover:border-primary/50 ${
                          selectedProduct?.id === product.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                        onClick={() => {
                          setSelectedProduct(product);
                          fetchProductDetails(product.id);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{product.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {product.categories?.name || 'Uncategorized'}
                              </p>
                              {product.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-1">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {selectedProduct && (
                <div className="space-y-6">
                  {/* Product Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{selectedProduct.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Category: {selectedProduct.categories?.name || 'Uncategorized'}
                          </p>
                          {selectedProduct.description && (
                            <div>
                              <p className="text-sm font-medium mb-1">Description:</p>
                              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                            </div>
                          )}
                        </div>
                        {selectedProduct.special_notes && (
                          <div>
                            <p className="text-sm font-medium mb-1 text-warning-foreground">Special Notes:</p>
                            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedProduct.special_notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Variants */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Product Variants</CardTitle>
                        <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Variant
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                              </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleVariantSubmit} className="space-y-4">
                              <div>
                                <Label htmlFor="variantName">Variant Name</Label>
                                <Input
                                  id="variantName"
                                  value={variantName}
                                  onChange={(e) => setVariantName(e.target.value)}
                                  placeholder="e.g., 5058-11A"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="variantDescription">Description</Label>
                                <Textarea
                                  id="variantDescription"
                                  value={variantDescription}
                                  onChange={(e) => setVariantDescription(e.target.value)}
                                  placeholder="Variant description"
                                />
                              </div>
                              <div>
                                <Label htmlFor="variantImage">Variant Image</Label>
                                <Input
                                  id="variantImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setVariantImage(e.target.files?.[0] || null)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="variant3DModel">3D Model (GLB)</Label>
                                <Input
                                  id="variant3DModel"
                                  type="file"
                                  accept=".glb,.gltf"
                                  onChange={(e) => setVariant3DModel(e.target.files?.[0] || null)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={resetVariantForm}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                  {loading ? 'Saving...' : editingVariant ? 'Update' : 'Create'}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {variants.length > 0 ? (
                        <div className="space-y-2">
                          {variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between p-3 bg-muted rounded">
                              <div className="flex items-center space-x-3">
                                {variant.image_url ? (
                                  <img 
                                    src={variant.image_url} 
                                    alt={variant.variant_name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{formatVariantName(variant.variant_name)}</div>
                                  {variant.variant_description && (
                                    <div className="text-sm text-muted-foreground">{variant.variant_description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingVariant(variant);
                                    setVariantName(variant.variant_name);
                                    setVariantDescription(variant.variant_description || '');
                                    setVariant3DModel(null);
                                    setVariantDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteVariant(variant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No variants created yet. Add a variant to get started.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Specifications Table Display */}
                  <ProductVariantsTable 
                    variants={variants}
                    specifications={specifications}
                  />

                  {/* Size Specifications - Full Width Row */}
                  <SizeSpecificationInput
                    productId={selectedProduct.id}
                    variants={variants}
                    onSpecificationsChange={(specs) => {
                      // Add the specifications to the database
                      specs.forEach(async (spec) => {
                        const { error } = await supabase
                          .from('product_specifications')
                          .insert([spec]);
                        
                        if (error) {
                          toast({
                            title: "Error",
                            description: "Failed to save specification",
                            variant: "destructive",
                          });
                        }
                      });
                      // Refresh specifications
                      fetchProductDetails(selectedProduct.id);
                    }}
                    existingSpecifications={specifications}
                    customDimensions={productDimensions}
                    onDimensionsChange={(newDimensions) => {
                      setProductDimensions(newDimensions);
                      toast({
                        title: "Success",
                        description: "Dimension configuration updated"
                      });
                    }}
                    onSpecificationDelete={async (productId, variantId, specKey, specValue) => {
                      const { error } = await supabase
                        .from('product_specifications')
                        .delete()
                        .eq('product_id', productId)
                        .eq('variant_id', variantId)
                        .eq('specification_key', specKey)
                        .eq('specification_value', specValue);

                      if (error) {
                        throw new Error('Failed to delete specification from database');
                      }
                      
                      // Refresh specifications after successful deletion
                      fetchProductDetails(selectedProduct.id);
                    }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Features are now managed per variant. Select a variant to add/edit features.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Variant Selection for Features */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Variant for Features:</label>
                          <Select 
                            value={selectedVariant?.id || ''} 
                            onValueChange={(value) => {
                              const variant = variants.find(v => v.id === value);
                              setSelectedVariant(variant || null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a variant to manage features" />
                            </SelectTrigger>
                            <SelectContent>
                              {variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {formatVariantName(variant.variant_name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedVariant && (
                          <>
                            <div className="flex space-x-2">
                              <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder={`Add feature to ${formatVariantName(selectedVariant.variant_name)}`}
                              />
                              <Button onClick={() => handleAddFeature(false)}>Add</Button>
                            </div>
                            <div className="space-y-2">
                              {features.filter(f => !f.is_optional && f.variant_id === selectedVariant.id).map((feature) => (
                                <div key={feature.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span>{feature.feature}</span>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteFeature(feature.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {!selectedVariant && (
                          <p className="text-muted-foreground text-center py-4">
                            Please select a variant to manage features
                          </p>
                        )}
                      </CardContent>
                    </Card>


                    {/* Specifications */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Other Specifications</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          For non-dimension specifications (e.g., Weight, Material, etc.)
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Select 
                            value={selectedVariant?.id || 'product'} 
                            onValueChange={(value) => {
                              if (value === 'product') {
                                setSelectedVariant(null);
                              } else {
                                const variant = variants.find(v => v.id === value);
                                setSelectedVariant(variant || null);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">Product (General)</SelectItem>
                              {variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {formatVariantName(variant.variant_name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={newSpecKey}
                            onChange={(e) => setNewSpecKey(e.target.value)}
                            placeholder="Specification key (e.g., Weight, Material)"
                          />
                          <Input
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            placeholder="Specification value (e.g., 15 lbs, Stainless Steel)"
                          />
                          <Button onClick={handleAddSpecification}>Add Specification</Button>
                        </div>
                        <div className="space-y-2">
                          {specifications.filter(spec => !['Width', 'Length', 'Depth'].includes(spec.specification_key)).map((spec, index) => (
                            <div
                              key={spec.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, spec.id)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, index)}
                              className={`flex items-center justify-between p-2 bg-muted rounded cursor-move transition-all duration-200 ${
                                draggedSpecId === spec.id ? 'opacity-50 scale-95' : ''
                              } ${
                                dragOverIndex === index ? 'border-2 border-primary border-dashed' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{spec.specification_key}</div>
                                  <div className="text-sm text-muted-foreground">{spec.specification_value}</div>
                                  {spec.variant_id && (
                                    <div className="text-xs text-muted-foreground">
                                      Variant: {formatVariantName(variants.find(v => v.id === spec.variant_id)?.variant_name || '')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSpecification(spec.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Custom Products Tab */}
            <TabsContent value="custom-products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Custom Products</h2>
                <Dialog open={customProductDialogOpen} onOpenChange={setCustomProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCustomProduct ? 'Edit Custom Product' : 'Add New Custom Product'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCustomProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="customProductName">Product Name</Label>
                        <Input
                          id="customProductName"
                          value={customProductName}
                          onChange={(e) => setCustomProductName(e.target.value)}
                          placeholder="Enter custom product name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="customProductDescription">Description</Label>
                        <Textarea
                          id="customProductDescription"
                          value={customProductDescription}
                          onChange={(e) => setCustomProductDescription(e.target.value)}
                          placeholder="Product description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customProductMainImage">Main Image</Label>
                        <Input
                          id="customProductMainImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCustomProductMainImage(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div>
                        <Label>Additional Images with Descriptions</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add multiple images with descriptions to showcase different views and details of your custom product.
                        </p>
                        <div className="space-y-4">
                          {customProductAdditionalImages.map((item, index) => (
                            <Card key={index} className="p-4 border-2 border-dashed border-muted">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Image {index + 1}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setCustomProductAdditionalImages(prev =>
                                        prev.filter((_, i) => i !== index)
                                      );
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                  {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                                <div>
                                  <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                                    Description *
                                  </Label>
                                  <Textarea
                                    id={`description-${index}`}
                                    placeholder="Describe what this image shows (e.g., 'Side view showing adjustment mechanism', 'Close-up of locking wheels', 'Interior storage compartment')"
                                    value={item.description}
                                    onChange={(e) => {
                                      const updated = [...customProductAdditionalImages];
                                      updated[index].description = e.target.value;
                                      setCustomProductAdditionalImages(updated);
                                    }}
                                    className="mt-1"
                                    rows={2}
                                  />
                                  {!item.description && (
                                    <p className="text-xs text-destructive mt-1">
                                      Please add a description for this image
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <Label htmlFor="additional-images" className="cursor-pointer">
                              <span className="text-sm font-medium text-primary hover:text-primary-dark">
                                Click to add more images
                              </span>
                            </Label>
                            <Input
                              id="additional-images"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                const newImages = files.map(file => ({ file, description: "" }));
                                setCustomProductAdditionalImages(prev => [...prev, ...newImages]);
                                // Reset the input
                                e.target.value = "";
                              }}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG, WEBP up to 10MB each
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetCustomProductForm}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={loading || customProductAdditionalImages.some(img => !img.description.trim())}
                        >
                          {loading ? "Saving..." : editingCustomProduct ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {customProducts.map((customProduct) => (
                  <Card key={customProduct.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {customProduct.main_image_url && (
                            <img
                              src={customProduct.main_image_url}
                              alt={customProduct.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{customProduct.name}</h3>
                            {customProduct.description && (
                              <p className="text-sm text-muted-foreground">{customProduct.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(customProduct.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCustomProduct(customProduct)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCustomProduct(customProduct.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;