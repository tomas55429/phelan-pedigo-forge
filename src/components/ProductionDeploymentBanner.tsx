import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Globe, RefreshCw, CheckCircle } from 'lucide-react';
import { isProductionSite, isDevelopmentSite } from '@/utils/cacheUtils';

interface ProductionDeploymentBannerProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ProductionDeploymentBanner: React.FC<ProductionDeploymentBannerProps> = ({
  onRefresh,
  isRefreshing = false
}) => {
  // Only show on production site or when specifically needed
  if (!isProductionSite()) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Production Site Data Status
        <Badge variant="outline" className="text-xs">
          Live
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          This is the live production site. If you've made changes in the admin panel 
          but don't see them reflected here, the site may need fresh data.
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
          <p>
            💡 <strong>Tip:</strong> If data issues persist, the latest code changes 
            may need to be deployed to production.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProductionDeploymentBanner;