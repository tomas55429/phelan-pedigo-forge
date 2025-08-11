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
  customDimensions?: DimensionConfig[];
  onDimensionsChange?: (dimensions: DimensionConfig[]) => void;
  onSpecificationDelete?: (productId: string, variantId: string, specKey: string, specValue: string) => Promise<void>;
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
  existingSpecifications = [],
  customDimensions,
  onDimensionsChange,
  onSpecificationDelete
}) => {
  const [isVertical, setIsVertical] = useState(false);
  const [sizeSpecs, setSizeSpecs] = useState<SizeSpecification[]>([]);
  const [tableDescription, setTableDescription] = useState("Standard Sizes (inside dimensions)");
  const [dimensions, setDimensions] = useState<DimensionConfig[]>(
    customDimensions || [
      { key: 'width', label: 'Width', enabled: true },
      { key: 'length', label: 'Length', enabled: true },
      { key: 'depth', label: 'Depth', enabled: true }
    ]
  );
  const { toast } = useToast();

  // Update dimensions when customDimensions prop changes
  useEffect(() => {
    if (customDimensions) {
      setDimensions(customDimensions);
    }
  }, [customDimensions]);

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

        // Normalize arrays so each size set stays aligned across dimensions
        const maxLen = Math.max(existingWidth.length, existingLength.length, existingDepth.length, 1);
        const pad = (arr: string[]) => arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')];
        const widthArr = pad(existingWidth);
        const lengthArr = pad(existingLength);
        const depthArr = pad(existingDepth);

        return {
          variantId: variant.id,
          width: widthArr,
          length: lengthArr,
          depth: depthArr
        };
      });
      setSizeSpecs(initialSpecs);
    }
  }, [variants, existingSpecifications]);

  const handleSpecChange = (variantId: string, dimension: 'width' | 'length' | 'depth', index: number, value: string) => {
    setSizeSpecs(prev => prev.map(spec => {
      if (spec.variantId !== variantId) return spec;
      const current = [...(spec[dimension] as string[])];
      if (index >= current.length) {
        const toAdd = index - current.length + 1;
        current.push(...Array(toAdd).fill(''));
      }
      current[index] = value;
      return { 
        ...spec, 
        [dimension]: current
      };
    }));
  };

  const addSizeOption = (variantId: string, dimension: 'width' | 'length' | 'depth') => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId 
        ? { ...spec, [dimension]: [...spec[dimension], ''] }
        : spec
    ));
  };

  const addCompleteSize = (variantId: string) => {
    setSizeSpecs(prev => prev.map(spec => 
      spec.variantId === variantId 
        ? { 
            ...spec, 
            width: [...spec.width, ''],
            length: [...spec.length, ''],
            depth: [...spec.depth, '']
          }
        : spec
    ));
  };

  const removeSizeOption = async (variantId: string, dimension: 'width' | 'length' | 'depth', index: number) => {
    const spec = sizeSpecs.find(s => s.variantId === variantId);
    if (!spec) return;

    // Helper to delete a single spec from DB
    const deleteFromDB = async (dimKey: 'width' | 'length' | 'depth', value: string) => {
      if (!value || !value.trim() || !onSpecificationDelete) return;
      const label = dimensions.find(d => d.key === dimKey)?.label || dimKey;
      await onSpecificationDelete(productId, variantId, label, value);
    };

    try {
      if (isVertical) {
        // In vertical mode we treat each sizeIndex as a complete set across all dimensions
        // Attempt DB deletion for each enabled dimension value at this index
        const enabledDims = dimensions.filter(d => d.enabled).map(d => d.key as 'width' | 'length' | 'depth');
        for (const dimKey of enabledDims) {
          const arr = (spec[dimKey] as string[]) || [];
          const val = arr[index];
          if (val) {
            await deleteFromDB(dimKey, val);
          }
        }
        // Update local state by removing the index from ALL dimensions, ensuring arrays don't become empty
        setSizeSpecs(prev => prev.map(s => {
          if (s.variantId !== variantId) return s;
          const nextWidth = (s.width || []).filter((_, i) => i !== index);
          const nextLength = (s.length || []).filter((_, i) => i !== index);
          const nextDepth = (s.depth || []).filter((_, i) => i !== index);
          return {
            ...s,
            width: nextWidth.length ? nextWidth : [''],
            length: nextLength.length ? nextLength : [''],
            depth: nextDepth.length ? nextDepth : [''],
          };
        }));
        toast({ title: 'Success', description: 'Size set removed' });
        return;
      }

      // Horizontal mode: remove only from the specific dimension (original behavior)
      const values = spec[dimension] as string[];
      const valueToDelete = values[index];
      if (values.length > 1) {
        if (valueToDelete && valueToDelete.trim()) {
          await deleteFromDB(dimension, valueToDelete);
        }
        setSizeSpecs(prev => prev.map(s => 
          s.variantId === variantId
            ? { ...s, [dimension]: (s[dimension] as string[]).filter((_, i) => i !== index) }
            : s
        ));
        toast({ title: 'Success', description: 'Specification deleted successfully' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete specification', variant: 'destructive' });
    }
  };

  const toggleDimension = (dimensionKey: string) => {
    const newDimensions = dimensions.map(dim => 
      dim.key === dimensionKey ? { ...dim, enabled: !dim.enabled } : dim
    );
    setDimensions(newDimensions);
    if (onDimensionsChange) {
      onDimensionsChange(newDimensions);
    }
  };

  const updateDimensionLabel = (dimensionKey: string, newLabel: string) => {
    const newDimensions = dimensions.map(dim => 
      dim.key === dimensionKey ? { ...dim, label: newLabel } : dim
    );
    setDimensions(newDimensions);
    if (onDimensionsChange) {
      onDimensionsChange(newDimensions);
    }
  };

  const formatVariantName = (variantName: string) => {
    return variantName.split('-')[0].trim();
  };

  const generateSpecifications = () => {
    const newSpecifications: any[] = [];
    
    // Start sort order after the highest existing one
    const maxSortOrder = Math.max(...existingSpecifications.map(spec => spec.sort_order || 0), 0);
    let nextSortOrder = maxSortOrder + 1;

    sizeSpecs.forEach((spec) => {
      // Use only enabled dimensions in their current order
      const enabledDims = dimensions.filter((d) => d.enabled).map((d) => d.key as 'width' | 'length' | 'depth');
      const maxLen = Math.max(
        0,
        ...enabledDims.map((key) => ((spec[key] as string[]) || []).length)
      );

      // Iterate by size set index so values stay aligned across dimensions
      for (let i = 0; i < maxLen; i++) {
        const valuesByKey: Record<'width' | 'length' | 'depth', string> = {
          width: (spec.width[i] || '').trim(),
          length: (spec.length[i] || '').trim(),
          depth: (spec.depth[i] || '').trim(),
        };

        // Only create a set if at least one value exists
        const hasAny = enabledDims.some((k) => valuesByKey[k] && valuesByKey[k].length > 0);
        if (!hasAny) continue;

        // Keep all dimensions from the same set grouped by the same sort_order
        const setSortOrder = nextSortOrder++;

        enabledDims.forEach((k) => {
          const val = valuesByKey[k];
          if (!val) return; // skip empty cells
          const label = dimensions.find((d) => d.key === k)?.label || k;

          // IMPORTANT: Allow duplicates intentionally so similar sizes are preserved
          newSpecifications.push({
            product_id: productId,
            variant_id: spec.variantId,
            specification_key: label,
            specification_value: val,
            sort_order: setSortOrder,
          });
        });
      }
    });

    if (newSpecifications.length === 0) {
      toast({ title: 'Info', description: 'Please enter at least one size value' });
      return;
    }

    onSpecificationsChange(newSpecifications);
    toast({
      title: 'Success',
      description: `${newSpecifications.length} new size specifications added`,
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
            <Label>Dimension Configuration</Label>
            <div className="space-y-3">
              {dimensions.map((dim) => (
                <div key={dim.key} className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/20">
                  <Checkbox
                    id={`dim-${dim.key}`}
                    checked={dim.enabled}
                    onCheckedChange={() => toggleDimension(dim.key)}
                  />
                  <Label htmlFor={`dim-${dim.key}`} className="text-sm font-medium min-w-[60px]">
                    {dim.key === 'width' ? 'Dim 1:' : dim.key === 'length' ? 'Dim 2:' : 'Dim 3:'}
                  </Label>
                  <Input
                    value={dim.label}
                    onChange={(e) => updateDimensionLabel(dim.key, e.target.value)}
                    placeholder="e.g., Width, Height, Length"
                    className="flex-1 max-w-[200px]"
                  />
                  <Badge variant={dim.enabled ? "default" : "secondary"}>
                    {dim.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Customize dimension names (e.g., change "Depth" to "Height" for vertical products)
              </p>
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
                           {/* Group related size dimensions with visual dividers */}
                           <div className="space-y-3">
                             {/* Determine the maximum number of size sets */}
                             {Array.from({ length: Math.max(...dimensions.filter(d => d.enabled).map(d => 
                               (spec?.[d.key as keyof SizeSpecification] as string[])?.length || 0
                             )) }).map((_, sizeIndex) => {
                               const hasAnyValue = dimensions.filter(d => d.enabled).some(d => 
                                 (spec?.[d.key as keyof SizeSpecification] as string[])?.[sizeIndex]?.trim()
                               );
                               
                               if (!hasAnyValue && sizeIndex > 0) return null;
                               
                               return (
                                 <div key={sizeIndex} className={`relative ${sizeIndex > 0 ? 'border-l-2 border-primary/30 pl-4 ml-2' : ''}`}>
                                   {sizeIndex > 0 && (
                                     <div className="absolute -left-1 top-0 w-2 h-2 bg-primary rounded-full"></div>
                                   )}
                                   <div className="grid gap-3">
                                     {dimensions.filter(d => d.enabled).map((d) => {
                                       const values = spec?.[d.key as keyof SizeSpecification] as string[] || [];
                                       const value = values[sizeIndex] || '';
                                       
                                       return (
                                         <div key={`${d.key}-${sizeIndex}`} className="space-y-1">
                                           <Label className="text-xs text-muted-foreground">{d.label}</Label>
                                           <div className="flex items-center space-x-2">
                                             <Input
                                               value={value}
                                               onChange={(e) => handleSpecChange(variant.id, d.key as 'width' | 'length' | 'depth', sizeIndex, e.target.value)}
                                               placeholder={`e.g., 12″, 15¼″`}
                                               className="text-sm"
                                             />
                                             {values.length > 1 && (
                                               <Button
                                                 type="button"
                                                 variant="outline"
                                                 size="sm"
                                                 onClick={() => removeSizeOption(variant.id, d.key as 'width' | 'length' | 'depth', sizeIndex)}
                                               >
                                                 <Trash2 className="h-4 w-4" />
                                               </Button>
                                             )}
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                        </div>
                      ))}
                      <div className="col-span-full mt-4 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCompleteSize(variant.id)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Size ({dimensions.filter(d => d.enabled).map(d => d.label).join(', ')})
                        </Button>
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
                             <div className="space-y-1">
                               {/* Show size sets with visual grouping */}
                               {Array.from({ length: Math.max(spec?.[dimensionKey]?.length || 1, 1) }).map((_, sizeIndex) => {
                                 const value = spec?.[dimensionKey]?.[sizeIndex] || '';
                                 const isFirstDimension = index === 0;
                                 const isLastDimension = index === dimensions.filter(dim => dim.enabled).length - 1;
                                 
                                 return (
                                   <div key={sizeIndex} className={`flex items-center space-x-1 ${sizeIndex > 0 && isFirstDimension ? 'border-l-2 border-primary/20 pl-2' : ''}`}>
                                     {sizeIndex > 0 && isFirstDimension && (
                                       <div className="absolute left-0 w-1 h-1 bg-primary rounded-full"></div>
                                     )}
                                     <Input
                                       value={value}
                                       onChange={(e) => handleSpecChange(variant.id, dimensionKey, sizeIndex, e.target.value)}
                                       placeholder={`Enter ${dimension.label.toLowerCase()}`}
                                       className="text-center text-xs"
                                     />
                                     {spec?.[dimensionKey]?.length > 1 && (
                                       <Button
                                         type="button"
                                         variant="outline"
                                         size="sm"
                                         onClick={() => removeSizeOption(variant.id, dimensionKey, sizeIndex)}
                                         className="p-1 h-6 w-6"
                                       >
                                         <Trash2 className="h-3 w-3" />
                                       </Button>
                                     )}
                                   </div>
                                 );
                               })}
                               {index === dimensions.filter(dim => dim.enabled).length - 1 && (
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   onClick={() => addCompleteSize(variant.id)}
                                   className="w-full py-1 h-6 text-xs mt-2"
                                 >
                                   <Plus className="h-3 w-3 mr-1" />
                                   Add Size
                                 </Button>
                               )}
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