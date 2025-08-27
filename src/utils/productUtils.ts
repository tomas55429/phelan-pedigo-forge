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
  console.log('🔍 parseProductSlug: input slug =', slug);
  
  // Check if this is a custom product slug (contains "custom-")
  if (slug.includes('custom-')) {
    console.log('🔍 parseProductSlug: Detected custom product slug');
    // For custom products, find the custom- part and extract the ID after it
    const parts = slug.split('-');
    const customIndex = parts.findIndex(part => part === 'custom');
    
    if (customIndex !== -1 && customIndex < parts.length - 1) {
      // Get the 8-character ID after "custom-"
      const customId = parts[customIndex + 1];
      if (customId && customId.length === 8) {
        const result = `custom-${customId}`;
        console.log('🔍 parseProductSlug: Extracted custom product ID =', result);
        return result;
      }
    }
  }
  
  // For regular products, return the last 8-character part
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && lastPart.length === 8) {
    console.log('🔍 parseProductSlug: Extracted regular product ID =', lastPart);
    return lastPart;
  }
  
  console.log('🚨 parseProductSlug: Could not parse slug');
  return null;
}

export function generateProductUrl(productName: string, productId: string): string {
  const slug = generateProductSlug(productName, productId);
  return `/products/${slug}`;
}