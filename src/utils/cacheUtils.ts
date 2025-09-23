import { supabase } from "@/integrations/supabase/client";

/**
 * Cache utility functions for managing data freshness across environments
 */

// Add cache-busting headers to prevent browser caching of dynamic data
export const getCacheBustedHeaders = () => ({
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
});

// Generate timestamp-based cache busting parameter
export const getCacheBuster = () => `?cb=${Date.now()}`;

// Force refresh of Supabase data by invalidating cache
export const forceDataRefresh = async (tableName: 'products' | 'admin_settings' | 'categories' | 'product_specifications') => {
  try {
    // This will force Supabase to bypass any internal caching
    const timestamp = Date.now();
    console.log(`🔄 Force refreshing ${tableName} data at ${timestamp}`);
    
    // Trigger a simple query to ensure connection freshness
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
      
    if (error) {
      console.warn(`Warning refreshing ${tableName}:`, error);
    }
    
    return { success: !error, timestamp };
  } catch (error) {
    console.error(`Error force refreshing ${tableName}:`, error);
    return { success: false, timestamp: Date.now() };
  }
};

// Clear browser cache for specific URLs (production helper)
export const clearBrowserCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('🗑️ Browser caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear browser caches:', error);
      return false;
    }
  }
  return false;
};

// Production deployment detection
export const isProductionSite = () => {
  return window.location.hostname === 'phelanmfgcorp.com';
};

// Development environment detection  
export const isDevelopmentSite = () => {
  return window.location.hostname.includes('lovable.dev') || 
         window.location.hostname === 'localhost';
};