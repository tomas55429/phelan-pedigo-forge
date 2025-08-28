// Product utility functions for URL generation and navigation

export function generateProductSlug(productName: string, productId?: string): string {
  // Convert product name to URL-friendly slug (no UUID needed)
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim();
  
  return slug;
}

export function parseProductSlug(slug: string): string | null {
  console.log('🔍 parseProductSlug: input slug =', slug);
  
  // Return the clean slug for name-based lookup
  return slug;
}

export function generateProductUrl(productName: string, productId?: string): string {
  const slug = generateProductSlug(productName, productId);
  return `/products/${slug}`;
}