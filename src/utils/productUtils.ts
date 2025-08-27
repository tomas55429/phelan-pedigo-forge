// Product utility functions for URL generation and navigation

export function generateProductSlug(productName: string, productId: string): string {
  // Convert product name to URL-friendly slug
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim();
  
  // Append first 8 characters of ID for uniqueness
  return `${slug}-${productId.substring(0, 8)}`;
}

export function parseProductSlug(slug: string): string | null {
  // Extract product ID from slug (last part after final hyphen)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if this is a custom product slug (contains "custom-")
  if (slug.includes('custom-')) {
    // For custom products, reconstruct the full custom ID
    const customIndex = slug.indexOf('custom-');
    if (customIndex !== -1) {
      const customPart = slug.substring(customIndex);
      return customPart; // Return "custom-abc12345"
    }
  }
  
  // For regular products, return the last 8-character part
  if (lastPart && lastPart.length === 8) {
    return lastPart;
  }
  
  return null;
}

export function generateProductUrl(productName: string, productId: string): string {
  const slug = generateProductSlug(productName, productId);
  return `/products/${slug}`;
}