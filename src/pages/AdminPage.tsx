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
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  categories?: { name: string };
}

interface ProductFeature {
  id: string;
  product_id: string;
  feature: string;
}

interface ProductSpecification {
  id: string;
  product_id: string;
  variant_id?: string;
  specification_key: string;
  specification_value: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminPage = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productFeatured, setProductFeatured] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // State for features and specs
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // State for variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantDescription, setVariantDescription] = useState('');
  const [variantImage, setVariantImage] = useState<File | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
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

  const fetchProductDetails = async (productId: string) => {
    try {
      const [featuresRes, specsRes, variantsRes] = await Promise.all([
        supabase
          .from('product_features')
          .select('*')
          .eq('product_id', productId)
          .order('feature'),
        supabase
          .from('product_specifications')
          .select('*')
          .eq('product_id', productId)
          .order('specification_key'),
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
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryName,
            description: categoryDescription || null,
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: categoryName,
            description: categoryDescription || null,
          }]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Category created successfully" });
      }

      setCategoryName('');
      setCategoryDescription('');
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    try {
      let imageUrl = editingProduct?.image_url || null;
      
      if (productImage) {
        const uploadedUrl = await uploadProductImage(productImage);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productData = {
        name: productName,
        category_id: productCategoryId === 'none' ? null : productCategoryId || null,
        description: productDescription || null,
        image_url: imageUrl,
        featured: productFeatured,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

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
    setProductCategoryId('');
    setProductDescription('');
    setProductFeatured(false);
    setProductImage(null);
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

  const handleAddFeature = async () => {
    if (!selectedProduct || !newFeature.trim()) return;

    try {
      const { error } = await supabase
        .from('product_features')
        .insert([{
          product_id: selectedProduct.id,
          feature: newFeature,
        }]);
      
      if (error) throw error;
      setNewFeature('');
      fetchProductDetails(selectedProduct.id);
      toast({ title: "Success", description: "Feature added successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeature = async (id: string) => {
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
      const { error } = await supabase
        .from('product_specifications')
        .insert([{
          product_id: selectedProduct.id,
          specification_key: newSpecKey,
          specification_value: newSpecValue,
        }]);
      
      if (error) throw error;
      setNewSpecKey('');
      setNewSpecValue('');
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

  // Variant management functions
  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !variantName.trim()) return;

    setLoading(true);
    try {
      let imageUrl = editingVariant?.image_url || null;
      
      if (variantImage) {
        const uploadedUrl = await uploadProductImage(variantImage);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const variantData = {
        product_id: selectedProduct.id,
        variant_name: variantName,
        variant_description: variantDescription || null,
        image_url: imageUrl,
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Products</span>
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
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setCategoryDialogOpen(false);
                            setEditingCategory(null);
                            setCategoryName('');
                            setCategoryDescription('');
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryName(category.name);
                                  setCategoryDescription(category.description || '');
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
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
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
                        <Label htmlFor="productCategory">Category</Label>
                        <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Label htmlFor="productImage">Product Image</Label>
                        <Input
                          id="productImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                        />
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
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductName(product.name);
                                  setProductCategoryId(product.category_id || 'none');
                                  setProductDescription(product.description || '');
                                  setProductFeatured(product.featured);
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
                  <Label htmlFor="productSelect">Select Product</Label>
                  <Select 
                    value={selectedProduct?.id || ''} 
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      setSelectedProduct(product || null);
                      if (product) fetchProductDetails(product.id);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <div className="space-y-6">
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
                                  <div className="font-medium">{variant.variant_name}</div>
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add new feature"
                          />
                          <Button onClick={handleAddFeature}>Add</Button>
                        </div>
                        <div className="space-y-2">
                          {features.map((feature) => (
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
                      </CardContent>
                    </Card>

                    {/* Specifications */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Input
                            value={newSpecKey}
                            onChange={(e) => setNewSpecKey(e.target.value)}
                            placeholder="Specification key (e.g., Weight)"
                          />
                          <Input
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            placeholder="Specification value (e.g., 50 lbs)"
                          />
                          <Button onClick={handleAddSpecification}>Add Specification</Button>
                        </div>
                        <div className="space-y-2">
                          {specifications.map((spec) => (
                            <div key={spec.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <div className="font-medium">{spec.specification_key}</div>
                                <div className="text-sm text-muted-foreground">{spec.specification_value}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSpecification(spec.id)}
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
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;