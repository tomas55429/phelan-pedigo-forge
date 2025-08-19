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
  weight: string[];
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
      { key: 'depth', label: 'Depth', enabled: true },
      { key: 'weight', label: 'Weight', enabled: false }
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

        const existingWeight = existingSpecifications
          .filter(spec => spec.variant_id === variant.id && spec.specification_key === 'Weight')
          .map(spec => spec.specification_value)
          .filter(val => val);

        // Normalize arrays so each size set stays aligned across dimensions
        const maxLen = Math.max(existingWidth.length, existingLength.length, existingDepth.length, existingWeight.length, 1);
        const pad = (arr: string[]) => arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')];
        const widthArr = pad(existingWidth);
        const lengthArr = pad(existingLength);
        const depthArr = pad(existingDepth);
        const weightArr = pad(existingWeight);

        return {
          variantId: variant.id,
          width: widthArr,
          length: lengthArr,
          depth: depthArr,
          weight: weightArr
        };
      });
      setSizeSpecs(initialSpecs);
    }
  }, [variants, existingSpecifications]);

  // Initialize for general product (no variants)
  useEffect(() => {
    if (variants.length === 0) {
      const labelFor = (key: 'width' | 'length' | 'depth' | 'weight') =>
        dimensions.find(d => d.key === key)?.label || (key === 'width' ? 'Width' : key === 'length' ? 'Length' : key === 'depth' ? 'Depth' : 'Weight');

      const getValuesByLabel = (label: string) =>
        existingSpecifications
          .filter((spec: any) => !spec.variant_id && spec.specification_key === label)
          .map((spec: any) => spec.specification_value)
          .filter((val: string) => val);

      const widthRaw = getValuesByLabel(labelFor('width'));
      const lengthRaw = getValuesByLabel(labelFor('length'));
      const depthRaw = getValuesByLabel(labelFor('depth'));
      const weightRaw = getValuesByLabel(labelFor('weight'));

      const maxLen = Math.max(widthRaw.length, lengthRaw.length, depthRaw.length, weightRaw.length, 1);
      const pad = (arr: string[]) => (arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')]);

      setSizeSpecs([
        {
          variantId: '', // empty string denotes general product
          width: pad(widthRaw),
          length: pad(lengthRaw),
          depth: pad(depthRaw),
          weight: pad(weightRaw),
        },
      ]);
    }
  }, [variants, existingSpecifications, dimensions]);

  const handleSpecChange = (variantId: string, dimension: 'width' | 'length' | 'depth' | 'weight', index: number, value: string) => {
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

  const addSizeOption = (variantId: string, dimension: 'width' | 'length' | 'depth' | 'weight') => {
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
            depth: [...spec.depth, ''],
            weight: [...spec.weight, '']
          }
        : spec
    ));
  };

  const removeSizeOption = async (variantId: string, dimension: 'width' | 'length' | 'depth' | 'weight', index: number) => {
    const spec = sizeSpecs.find(s => s.variantId === variantId);
    if (!spec) return;

    // Helper to delete a single spec from DB
    const deleteFromDB = async (dimKey: 'width' | 'length' | 'depth' | 'weight', value: string) => {
      if (!value || !value.trim() || !onSpecificationDelete) return;
      const label = dimensions.find(d => d.key === dimKey)?.label || dimKey;
      await onSpecificationDelete(productId, variantId, label, value);
    };

    try {
      if (isVertical) {
        // In vertical mode we treat each sizeIndex as a complete set across all dimensions
        // Attempt DB deletion for each enabled dimension value at this index
        const enabledDims = dimensions.filter(d => d.enabled).map(d => d.key as 'width' | 'length' | 'depth' | 'weight');
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
          const nextWeight = (s.weight || []).filter((_, i) => i !== index);
          return {
            ...s,
            width: nextWidth.length ? nextWidth : [''],
            length: nextLength.length ? nextLength : [''],
            depth: nextDepth.length ? nextDepth : [''],
            weight: nextWeight.length ? nextWeight : [''],
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
          await deleteFromDB(dimension as 'width' | 'length' | 'depth' | 'weight', valueToDelete);
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
    const name = variantName || '';
    
    // If name starts with hyphen, return the full name
    if (name.startsWith('-')) {
      return name;
    }
    
    // Otherwise, remove hyphen and everything after it (product codes)
    return name.split('-')[0].trim();
  };

  const generateSpecifications = () => {
    const newSpecifications: any[] = [];

    // Determine enabled dimensions and their labels once
    const enabledDimsConfig = dimensions.filter((d) => d.enabled);
    const enabledKeys = enabledDimsConfig.map((d) => d.key as 'width' | 'length' | 'depth' | 'weight');
    const enabledLabels = enabledDimsConfig.map((d) => d.label);

    // Build a lookup of existing size-set signatures per group (variant or general), grouped by sort_order
    const groupedByGroup: Map<string, Map<number, Record<string, string>>> = new Map();
    for (const es of existingSpecifications) {
      if (!enabledLabels.includes(es.specification_key)) continue; // only consider current enabled dims
      const groupId = es.variant_id || '__GENERAL__';
      const byOrder = groupedByGroup.get(groupId) || new Map<number, Record<string, string>>();
      groupedByGroup.set(groupId, byOrder);
      const orderKey = typeof es.sort_order === 'number' ? es.sort_order : -1; // fallback bucket
      const vals = byOrder.get(orderKey) || {};
      vals[es.specification_key] = (es.specification_value || '').trim();
      byOrder.set(orderKey, vals);
    }

    const existingSignaturesByGroup: Map<string, Set<string>> = new Map();
    groupedByGroup.forEach((orders, groupId) => {
      const sigs = new Set<string>();
      orders.forEach((vals) => {
        const sig = enabledDimsConfig.map((d) => vals[d.label] || '').join('||');
        const hasAny = enabledDimsConfig.some((d) => (vals[d.label] || '').trim());
        if (hasAny) sigs.add(sig);
      });
      existingSignaturesByGroup.set(groupId, sigs);
    });

    // Track signatures we plan to add in this run to avoid duplicates within the same Apply
    const pendingSignaturesByGroup: Map<string, Set<string>> = new Map();

    // Start sort order after the highest existing one
    const maxSortOrder = Math.max(...existingSpecifications.map((spec: any) => spec.sort_order || 0), 0);
    let nextSortOrder = maxSortOrder + 1;

    sizeSpecs.forEach((spec) => {
      const groupId = spec.variantId || '__GENERAL__';
      const maxLen = Math.max(0, ...enabledKeys.map((key) => ((spec[key] as string[]) || []).length));

      for (let i = 0; i < maxLen; i++) {
        const valuesByKey: Record<'width' | 'length' | 'depth' | 'weight', string> = {
          width: (spec.width[i] || '').trim(),
          length: (spec.length[i] || '').trim(),
          depth: (spec.depth[i] || '').trim(),
          weight: (spec.weight[i] || '').trim(),
        };

        const hasAll = enabledKeys.every((k) => {
          const v = valuesByKey[k];
          return typeof v === 'string' && v.trim().length > 0;
        });
        if (!hasAll) continue;

        // Signature of the full size set in the current enabled dimension order
        const sig = enabledDimsConfig
          .map((d) => valuesByKey[d.key as 'width' | 'length' | 'depth' | 'weight'] || '')
          .join('||');
        const existingSigs = existingSignaturesByGroup.get(groupId) || new Set<string>();
        const pendingSigs = pendingSignaturesByGroup.get(groupId) || new Set<string>();

        // Skip adding if an identical full set already exists (prevents duplication on repeated Apply)
        if (existingSigs.has(sig) || pendingSigs.has(sig)) {
          continue;
        }

        const setSortOrder = nextSortOrder++;

        enabledKeys.forEach((k) => {
          const val = valuesByKey[k];
          if (!val) return;
          const label = enabledDimsConfig.find((d) => d.key === k)?.label || k;
          const base: any = {
            product_id: productId,
            specification_key: label,
            specification_value: val,
            sort_order: setSortOrder,
          };
          if (spec.variantId) {
            base.variant_id = spec.variantId;
          }
          newSpecifications.push(base);
        });

        // Record this signature as pending to avoid duplicates within the same run
        pendingSigs.add(sig);
        pendingSignaturesByGroup.set(groupId, pendingSigs);
      }
    });

    if (newSpecifications.length === 0) {
      toast({ title: 'Info', description: 'No new size sets to add' });
      return;
    }

    onSpecificationsChange(newSpecifications);
    toast({ title: 'Success', description: `${newSpecifications.length} new size specifications added` });
  };

  const clearAll = () => {
    setSizeSpecs(prev => prev.map(spec => ({
      ...spec,
      width: [''],
      length: [''],
      depth: [''],
      weight: ['']
    })));
  };


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
                    {dim.key === 'width' ? 'Dim 1:' : dim.key === 'length' ? 'Dim 2:' : dim.key === 'depth' ? 'Dim 3:' : 'Dim 4:'}
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
          
          {variants.length > 0 ? (
            isVertical ? (
              // Vertical Layout for variants
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
                                                  onChange={(e) => handleSpecChange(variant.id, d.key as 'width' | 'length' | 'depth' | 'weight', sizeIndex, e.target.value)}
                                                  placeholder={`e.g., 12″, 15¼″`}
                                                  className="text-sm"
                                                />
                                               {values.length > 1 && (
                                                 <Button
                                                   type="button"
                                                   variant="outline"
                                                   size="sm"
                                                   onClick={() => removeSizeOption(variant.id, d.key as 'width' | 'length' | 'depth' | 'weight', sizeIndex)}
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
              // Horizontal Layout for variants - Table format
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
                          const dimensionKey = dimension.key as 'width' | 'length' | 'depth' | 'weight';
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
            )
          ) : (
            // General product (no variants)
            isVertical ? (
              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">General Product</CardTitle>
                  </CardHeader>
                  <CardContent className={`grid gap-4 ${dimensions.filter(d => d.enabled).length === 3 ? 'grid-cols-3' : dimensions.filter(d => d.enabled).length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                     {dimensions.filter(dim => dim.enabled).map((dim) => {
                       const spec = sizeSpecs[0];
                       const allForDim = (spec?.[dim.key as 'width' | 'length' | 'depth' | 'weight'] as string[]) || [];
                       const maxLen = Math.max(
                         ...dimensions.filter(d => d.enabled).map(d => ((sizeSpecs[0]?.[d.key as 'width' | 'length' | 'depth' | 'weight'] as string[]) || []).length),
                         1
                       );
                      return (
                        <div key={dim.key} className="space-y-2">
                          <Label htmlFor={`${dim.key}-general`}>{dim.label}</Label>
                          <div className="space-y-3">
                             {Array.from({ length: maxLen }).map((_, sizeIndex) => {
                               const hasAnyValue = dimensions.filter(d => d.enabled).some(d =>
                                 ((sizeSpecs[0]?.[d.key as 'width' | 'length' | 'depth' | 'weight'] as string[])?.[sizeIndex] || '').trim()
                               );
                              if (!hasAnyValue && sizeIndex > 0) return null;
                              const value = allForDim[sizeIndex] || '';
                              return (
                                <div key={`${dim.key}-${sizeIndex}`} className={`relative ${sizeIndex > 0 ? 'border-l-2 border-primary/30 pl-4 ml-2' : ''}`}>
                                  {sizeIndex > 0 && (
                                    <div className="absolute -left-1 top-0 w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                     <Input
                                       value={value}
                                       onChange={(e) => handleSpecChange('', dim.key as 'width' | 'length' | 'depth' | 'weight', sizeIndex, e.target.value)}
                                       placeholder={`e.g., 12″, 15¼″`}
                                       className="text-sm"
                                     />
                                    {allForDim.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSizeOption('', dim.key as 'width' | 'length' | 'depth' | 'weight', sizeIndex)}
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
                    <div className="col-span-full mt-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCompleteSize('')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Size ({dimensions.filter(d => d.enabled).map(d => d.label).join(', ')})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border border-border bg-muted/50 font-semibold min-w-[120px]">
                        Specification
                      </TableHead>
                      <TableHead 
                        className="border border-border bg-muted/50 text-center font-semibold min-w-[150px]"
                      >
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {dimensions.filter(dim => dim.enabled).map((dimension, index) => {
                       const spec = sizeSpecs[0];
                       const dimensionKey = dimension.key as 'width' | 'length' | 'depth' | 'weight';
                       const values = (spec?.[dimensionKey] as string[]) || [''];
                      return (
                        <TableRow key={dimension.key} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">
                            {dimension.label}
                          </TableCell>
                          <TableCell 
                            className="border border-border text-center px-3 py-3"
                          >
                             <div className="space-y-1">
                               {Array.from({ length: Math.max(values.length, 1) }).map((_, sizeIndex) => {
                                 const value = values[sizeIndex] || '';
                                 return (
                                   <div key={sizeIndex} className={`flex items-center space-x-1 ${sizeIndex > 0 ? 'border-l-2 border-primary/20 pl-2' : ''}`}>
                                     <Input
                                       value={value}
                                       onChange={(e) => handleSpecChange('', dimensionKey, sizeIndex, e.target.value)}
                                       placeholder={`Enter ${dimension.label.toLowerCase()}`}
                                       className="text-center text-xs"
                                     />
                                     {values.length > 1 && (
                                       <Button
                                         type="button"
                                         variant="outline"
                                         size="sm"
                                         onClick={() => removeSizeOption('', dimensionKey, sizeIndex)}
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
                                   onClick={() => addCompleteSize('')}
                                   className="w-full py-1 h-6 text-xs mt-2"
                                 >
                                   <Plus className="h-3 w-3 mr-1" />
                                   Add Size
                                 </Button>
                               )}
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )
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