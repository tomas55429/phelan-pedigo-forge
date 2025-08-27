// Shared product type definitions to avoid interface conflicts

export interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
  height?: number;
  width?: number;  
  length?: number;
  weight?: number;
  material?: string;
  finish?: string;
  color?: string;
  capacity?: string;
  load_capacity?: number;
  special_features?: string;
  image_url?: string;
  model_3d_url?: string;
}

export interface ProductFeature {
  id: string;
  feature: string;
  is_optional: boolean;
  variant_id?: string;
  image_url?: string;
}

export interface ProductSpecification {
  id: string;
  specification_key: string;
  specification_value: string;
  variant_id?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  model_3d_url?: string;
  special_notes?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AdditionalImage {
  image_url: string;
  description?: string;
}

export interface ProductWithDetails {
  product: Product;
  categories: Category[];
  variants: ProductVariant[];
  features: ProductFeature[];
  specifications: ProductSpecification[];
  additionalImages?: AdditionalImage[];
}