import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
}

interface SizeSpecification {
  variantId: string;
  width: string[];
  length: string[];
  depth: string[];
}

interface SizeSpecificationInputProps {
  productId: string;
  variants: ProductVariant[];
  onSpecificationsChange: (specifications: any[]) => void;
  existingSpecifications?: any[];
}

interface DimensionConfig {
  key: string;
  label: string;
  enabled: boolean;
}

export const SizeSpecificationInput: React.FC<SizeSpecificationInputProps> = ({
  productId,
  variants,
  onSpecificationsChange,
  existingSpecifications = []
}) => {
  const [isVertical, setIsVertical] = useState(false);
  const [sizeSpecs, setSizeSpecs] = useState<SizeSpecification[]>([]);
  const [tableDescription, setTableDescription] = useState("Standard Sizes (inside dimensions)");
  const [dimensions, setDimensions] = useState<DimensionConfig[]>([
    { key: 'width', label: 'Width', enabled: true },
    { key: 'length', label: 'Length', enabled: true },
    { key: 'depth', label: 'Depth', enabled: true }
  ]);
  const { toast } = useToast();

  // Initialize with existing specifications or create empty entries for each variant
  useEffect(() => {
    if (variants.length > 0) {
      const initialSpecs = variants.map(variant => {
        // Find existing specs for this variant and group by dimension
        const existingWidth = existingSpecifications
          .filter(spec => spec.variant_id === variant.id && spec.specification_key === 'Width')
          .map(spec => spec.specification_value)
          .filter(val => val);
        
        const existingLength = existingSpecifications
          .filter(spec => spec.variant_id === variant.id && spec.specification_key === 'Length')
          .map(spec => spec.specification_value)
          .filter(val => val);
        
        const existingDepth = existingSpecifications
          .filter(spec => spec.variant_id === variant.id && spec.specification_key === 'Depth')
          .map(spec => spec.specification_value)
          .filter(val => val);

        return {
          variantId: variant.id,
          width: existingWidth.length > 0 ? existingWidth : [''],
          length: existingLength.length > 0 ? existingLength : [''],
          depth: existingDepth.length > 0 ? existingDepth : ['']
        };
      });
      setSizeSpecs(initialSpecs);
    }
  }, [variants, existingSpecifications]);

  const handleSpecChange = (variantId: string, dimension: 'width' | 'length' | 'depth', index: number, value: string) => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId 
        ? { 
            ...spec, 
            [dimension]: spec[dimension].map((val, i) => i === index ? value : val)
          }
        : spec
    ));
  };

  const addSizeOption = (variantId: string, dimension: 'width' | 'length' | 'depth') => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId 
        ? { ...spec, [dimension]: [...spec[dimension], ''] }
        : spec
    ));
  };

  const removeSizeOption = (variantId: string, dimension: 'width' | 'length' | 'depth', index: number) => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId && spec[dimension].length > 1
        ? { ...spec, [dimension]: spec[dimension].filter((_, i) => i !== index) }
        : spec
    ));
  };

  const toggleDimension = (dimensionKey: string) => {
    setDimensions(prev => prev.map(dim => 
      dim.key === dimensionKey ? { ...dim, enabled: !dim.enabled } : dim
    ));
  };

  const formatVariantName = (variantName: string) => {
    return variantName.split('-')[0].trim();
  };

  const generateSpecifications = () => {
    const specifications: any[] = [];
    
    sizeSpecs.forEach(spec => {
      dimensions.forEach((dim, dimIndex) => {
        if (dim.enabled && spec[dim.key as keyof SizeSpecification]) {
          const values = spec[dim.key as keyof SizeSpecification] as string[];
          values.forEach((value, valueIndex) => {
            if (value.trim()) {
              specifications.push({
                product_id: productId,
                variant_id: spec.variantId,
                specification_key: dim.label,
                specification_value: value,
                sort_order: (dimIndex + 1) * 100 + valueIndex
              });
            }
          });
        }
      });
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
      width: [''],
      length: [''],
      depth: ['']
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
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-description">Table Description</Label>
            <Input
              id="table-description"
              value={tableDescription}
              onChange={(e) => setTableDescription(e.target.value)}
              placeholder="e.g., Standard Sizes (inside dimensions)"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Active Dimensions</Label>
            <div className="flex space-x-4">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dim-${dim.key}`}
                    checked={dim.enabled}
                    onCheckedChange={() => toggleDimension(dim.key)}
                  />
                  <Label htmlFor={`dim-${dim.key}`} className="text-sm">
                    {dim.label}
                  </Label>
                </div>
              ))}
            </div>
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
                    <CardContent className={`grid gap-4 ${dimensions.filter(d => d.enabled).length === 3 ? 'grid-cols-3' : dimensions.filter(d => d.enabled).length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {dimensions.filter(dim => dim.enabled).map((dim) => (
                        <div key={dim.key} className="space-y-2">
                          <Label htmlFor={`${dim.key}-${variant.id}`}>{dim.label}</Label>
                          {(spec?.[dim.key as keyof SizeSpecification] as string[])?.map((value: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={value}
                                onChange={(e) => handleSpecChange(variant.id, dim.key as 'width' | 'length' | 'depth', index, e.target.value)}
                                placeholder={`e.g., 12″, 15¼″`}
                              />
                              {(spec?.[dim.key as keyof SizeSpecification] as string[])?.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSizeOption(variant.id, dim.key as 'width' | 'length' | 'depth', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSizeOption(variant.id, dim.key as 'width' | 'length' | 'depth')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add {dim.label}
                          </Button>
                        </div>
                      ))}
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
                  {dimensions.filter(dim => dim.enabled).map((dimension, index) => (
                    <TableRow key={dimension.key} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">
                        {dimension.label}
                      </TableCell>
                      {variants.map((variant) => {
                        const spec = sizeSpecs.find(s => s.variantId === variant.id);
                        const dimensionKey = dimension.key as 'width' | 'length' | 'depth';
                        return (
                          <TableCell 
                            key={variant.id} 
                            className="border border-border text-center px-3 py-3"
                          >
                            <div className="space-y-2">
                              {spec?.[dimensionKey]?.map((value: string, valueIndex: number) => (
                                <div key={valueIndex} className="flex items-center space-x-1">
                                  <Input
                                    value={value}
                                    onChange={(e) => handleSpecChange(variant.id, dimensionKey, valueIndex, e.target.value)}
                                    placeholder={`Enter ${dimension.label.toLowerCase()}`}
                                    className="text-center text-xs"
                                  />
                                  {spec?.[dimensionKey]?.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeSizeOption(variant.id, dimensionKey, valueIndex)}
                                      className="p-1 h-6 w-6"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSizeOption(variant.id, dimensionKey)}
                                className="w-full py-1 h-6 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
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