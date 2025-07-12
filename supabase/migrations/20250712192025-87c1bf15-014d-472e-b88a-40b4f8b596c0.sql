-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Add admin policies for product management
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (public.is_admin());

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (public.is_admin());

CREATE POLICY "Admins can insert product features" 
ON public.product_features 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product features" 
ON public.product_features 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete product features" 
ON public.product_features 
FOR DELETE 
USING (public.is_admin());

CREATE POLICY "Admins can insert product specifications" 
ON public.product_specifications 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product specifications" 
ON public.product_specifications 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete product specifications" 
ON public.product_specifications 
FOR DELETE 
USING (public.is_admin());

-- Add admin storage policies
CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND public.is_admin());

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email = 'admin@phelanmanufacturing.com' THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  );
  RETURN new;
END;
$$;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();