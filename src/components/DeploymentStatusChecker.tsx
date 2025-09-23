import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, ExternalLink, Zap } from 'lucide-react';
import { isProductionSite, isDevelopmentSite } from '@/utils/cacheUtils';

interface DeploymentStatusCheckerProps {
  className?: string;
}

const DeploymentStatusChecker: React.FC<DeploymentStatusCheckerProps> = ({ className = '' }) => {
  const [deploymentInfo, setDeploymentInfo] = useState({
    site: window.location.hostname,
    isProduction: isProductionSite(),
    isDevelopment: isDevelopmentSite(),
    buildTime: new Date().toISOString(),
    codeVersion: 'v2.1-cache-management' // Update this when making major changes
  });

  // Only show on production site to help diagnose deployment issues
  if (!isProductionSite()) {
    return null;
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 ${className}`}>
      <CheckCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Deployment Status Check
        <Badge variant="outline" className="text-xs">
          {deploymentInfo.site}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Site:</strong> {deploymentInfo.site}
          </div>
          <div>
            <strong>Environment:</strong> {deploymentInfo.isProduction ? 'Production' : 'Development'}
          </div>
          <div>
            <strong>Code Version:</strong> {deploymentInfo.codeVersion}
          </div>
          <div>
            <strong>Build Time:</strong> {new Date(deploymentInfo.buildTime).toLocaleTimeString()}
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
          <p>
            <strong>🚀 If refresh buttons aren't working:</strong> The latest code with enhanced 
            cache management needs to be deployed to this production site.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://lovable.dev', '_blank')}
              className="gap-2 text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              Deploy Updates
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DeploymentStatusChecker;