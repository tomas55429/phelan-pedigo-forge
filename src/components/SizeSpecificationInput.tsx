import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
}

interface SizeSpecification {
  variantId: string;
  width: string;
  length: string;
  depth: string;
}

interface SizeSpecificationInputProps {
  productId: string;
  variants: ProductVariant[];
  onSpecificationsChange: (specifications: any[]) => void;
  existingSpecifications?: any[];
}

export const SizeSpecificationInput: React.FC<SizeSpecificationInputProps> = ({
  productId,
  variants,
  onSpecificationsChange,
  existingSpecifications = []
}) => {
  const [isVertical, setIsVertical] = useState(false);
  const [sizeSpecs, setSizeSpecs] = useState<SizeSpecification[]>([]);
  const { toast } = useToast();

  // Initialize with existing specifications or create empty entries for each variant
  useEffect(() => {
    if (variants.length > 0) {
      const initialSpecs = variants.map(variant => {
        // Find existing specs for this variant
        const existingWidth = existingSpecifications.find(spec => 
          spec.variant_id === variant.id && spec.specification_key === 'Width'
        )?.specification_value || '';
        
        const existingLength = existingSpecifications.find(spec => 
          spec.variant_id === variant.id && spec.specification_key === 'Length'
        )?.specification_value || '';
        
        const existingDepth = existingSpecifications.find(spec => 
          spec.variant_id === variant.id && spec.specification_key === 'Depth'
        )?.specification_value || '';

        return {
          variantId: variant.id,
          width: existingWidth,
          length: existingLength,
          depth: existingDepth
        };
      });
      setSizeSpecs(initialSpecs);
    }
  }, [variants, existingSpecifications]);

  const handleSpecChange = (variantId: string, dimension: 'width' | 'length' | 'depth', value: string) => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId 
        ? { ...spec, [dimension]: value }
        : spec
    ));
  };

  const formatVariantName = (variantName: string) => {
    return variantName.split('-')[0].trim();
  };

  const generateSpecifications = () => {
    const specifications: any[] = [];
    
    sizeSpecs.forEach(spec => {
      if (spec.width) {
        specifications.push({
          product_id: productId,
          variant_id: spec.variantId,
          specification_key: 'Width',
          specification_value: spec.width,
          sort_order: 1
        });
      }
      if (spec.length) {
        specifications.push({
          product_id: productId,
          variant_id: spec.variantId,
          specification_key: 'Length',
          specification_value: spec.length,
          sort_order: 2
        });
      }
      if (spec.depth) {
        specifications.push({
          product_id: productId,
          variant_id: spec.variantId,
          specification_key: 'Depth',
          specification_value: spec.depth,
          sort_order: 3
        });
      }
    });

    onSpecificationsChange(specifications);
    toast({
      title: "Success",
      description: "Size specifications generated successfully"
    });
  };

  const clearAll = () => {
    setSizeSpecs(prev => prev.map(spec => ({
      ...spec,
      width: '',
      length: '',
      depth: ''
    })));
  };

  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Size Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please add product variants first to configure size specifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Size Specifications Input</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="orientation-switch" className="text-sm">
                {isVertical ? 'Vertical' : 'Horizontal'} Layout
              </Label>
              <Switch
                id="orientation-switch"
                checked={isVertical}
                onCheckedChange={setIsVertical}
              />
            </div>
            <Button onClick={clearAll} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateSpecifications} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Apply to Specifications</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="secondary" className="mb-4">
            Configure dimensions for each product variant
          </Badge>
          
          {isVertical ? (
            // Vertical Layout
            <div className="space-y-6">
              {variants.map((variant) => {
                const spec = sizeSpecs.find(s => s.variantId === variant.id);
                return (
                  <Card key={variant.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Product No. {formatVariantName(variant.variant_name)}
                      </CardTitle>
                      {variant.variant_description && (
                        <p className="text-sm text-muted-foreground">
                          {variant.variant_description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`width-${variant.id}`}>Width</Label>
                        <Input
                          id={`width-${variant.id}`}
                          value={spec?.width || ''}
                          onChange={(e) => handleSpecChange(variant.id, 'width', e.target.value)}
                          placeholder="e.g., 12″, 15¼″"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`length-${variant.id}`}>Length</Label>
                        <Input
                          id={`length-${variant.id}`}
                          value={spec?.length || ''}
                          onChange={(e) => handleSpecChange(variant.id, 'length', e.target.value)}
                          placeholder="e.g., 18″, 20½″"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`depth-${variant.id}`}>Depth</Label>
                        <Input
                          id={`depth-${variant.id}`}
                          value={spec?.depth || ''}
                          onChange={(e) => handleSpecChange(variant.id, 'depth', e.target.value)}
                          placeholder="e.g., 6″, 8¾″"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Horizontal Layout - Table format
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-border bg-muted/50 font-semibold min-w-[120px]">
                      Specification
                    </TableHead>
                    {variants.map((variant) => (
                      <TableHead 
                        key={variant.id} 
                        className="border border-border bg-muted/50 text-center font-semibold min-w-[150px]"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-sm">Product No.</div>
                          <div className="font-bold text-base">
                            {formatVariantName(variant.variant_name)}
                          </div>
                          {variant.variant_description && (
                            <div className="text-xs text-muted-foreground font-normal">
                              {variant.variant_description}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['Width', 'Length', 'Depth'].map((dimension, index) => (
                    <TableRow key={dimension} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">
                        {dimension}
                      </TableCell>
                      {variants.map((variant) => {
                        const spec = sizeSpecs.find(s => s.variantId === variant.id);
                        const dimensionKey = dimension.toLowerCase() as 'width' | 'length' | 'depth';
                        return (
                          <TableCell 
                            key={variant.id} 
                            className="border border-border text-center px-3 py-3"
                          >
                            <Input
                              value={spec?.[dimensionKey] || ''}
                              onChange={(e) => handleSpecChange(variant.id, dimensionKey, e.target.value)}
                              placeholder={`Enter ${dimension.toLowerCase()}`}
                              className="text-center"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Use fraction symbols (½, ¼, ¾) and the inch symbol (″) for measurements. 
              Example: 12¾″ × 18½″ × 6″
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SizeSpecificationInput;