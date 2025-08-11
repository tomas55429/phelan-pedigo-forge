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

  // Initialize with empty entries for each variant (don't populate with existing specs)
  useEffect(() => {
    if (variants.length > 0) {
      const initialSpecs = variants.map(variant => ({
        variantId: variant.id,
        width: [''],
        length: [''],
        depth: ['']
      }));
      setSizeSpecs(initialSpecs);
    }
  }, [variants]);

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
    // Find the specification value to be deleted
    const spec = sizeSpecs.find(s => s.variantId === variantId);
    if (!spec) return;
    
    const dimensionKey = dimension as keyof SizeSpecification;
    const values = spec[dimensionKey] as string[];
    const valueToDelete = values[index];
    
    // Only proceed if there's more than one value and the value to delete is not empty
    if (values.length > 1) {
      // If there's a value to delete and it exists in the database, delete it
      if (valueToDelete && valueToDelete.trim() && onSpecificationDelete) {
        const dimensionLabel = dimensions.find(d => d.key === dimension)?.label || dimension;
        try {
          await onSpecificationDelete(productId, variantId, dimensionLabel, valueToDelete);
          toast({
            title: "Success",
            description: "Specification deleted successfully"
          });
        } catch (error) {
          toast({
            title: "Error", 
            description: "Failed to delete specification",
            variant: "destructive"
          });
          return; // Don't update local state if database deletion failed
        }
      }
      
      // Update local state
      setSizeSpecs(prev => prev.map(s => 
        s.variantId === variantId
          ? { ...s, [dimension]: s[dimension].filter((_, i) => i !== index) }
          : s
      ));
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

  const generateSpecificationsForVariant = (variantId: string) => {
    const newSpecifications: any[] = [];
    
    // Find the highest existing sort order to ensure new specs are added after existing ones
    const maxSortOrder = Math.max(...existingSpecifications.map(spec => spec.sort_order || 0), 0);
    let nextSortOrder = maxSortOrder + 1;
    
    const spec = sizeSpecs.find(s => s.variantId === variantId);
    if (!spec) {
      console.log('Debug - No spec found for variant:', variantId);
      return;
    }
    
    console.log('Debug - Current spec for variant:', variantId, spec);
    console.log('Debug - Current dimensions:', dimensions);
    console.log('Debug - Existing specifications for this variant:', existingSpecifications.filter(s => s.variant_id === variantId));
    
    dimensions.forEach((dim, dimIndex) => {
      if (dim.enabled && spec[dim.key as keyof SizeSpecification]) {
        const values = spec[dim.key as keyof SizeSpecification] as string[];
        console.log(`Debug - Processing dimension ${dim.label} (key: ${dim.key}) with values:`, values);
        
        values.forEach((value, valueIndex) => {
          if (value.trim()) {
            // Check if this exact specification already exists in the database
            const existingSpec = existingSpecifications.find(existing => 
              existing.variant_id === variantId &&
              existing.specification_key === dim.label &&
              existing.specification_value === value.trim()
            );
            
            if (!existingSpec) {
              console.log(`Debug - Adding new specification: ${dim.label} = ${value} for variant ${variantId}`);
              newSpecifications.push({
                product_id: productId,
                variant_id: variantId,
                specification_key: dim.label,
                specification_value: value.trim(),
                sort_order: nextSortOrder++
              });
            } else {
              console.log(`Debug - Skipping duplicate specification: ${dim.label} = ${value} for variant ${variantId} (already exists with ID: ${existingSpec.id})`);
            }
          } else {
            console.log(`Debug - Skipping empty value for dimension ${dim.label}`);
          }
        });
      } else {
        console.log(`Debug - Skipping dimension ${dim.label} (enabled: ${dim.enabled}, hasValues: ${!!spec[dim.key as keyof SizeSpecification]})`);
      }
    });

    console.log('Debug - New specifications to be added:', newSpecifications);

    if (newSpecifications.length === 0) {
      toast({
        title: "Info",
        description: "No new specifications to add for this variant (duplicates skipped)"
      });
      return;
    }

    onSpecificationsChange(newSpecifications);
    toast({
      title: "Success",
      description: `${newSpecifications.length} new size specifications added for variant`
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
          <p className="text-sm text-muted-foreground">
            Use the "Apply Specifications" button for each variant individually to avoid duplicate entries.
          </p>
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
                           {/* Show input fields only for the current dimension */}
                           <div className="space-y-2">
                             {((spec?.[dim.key as keyof SizeSpecification] as string[]) || ['']).map((value, index) => (
                               <div key={index} className="flex items-center space-x-2">
                                 <Input
                                   value={value}
                                   onChange={(e) => handleSpecChange(variant.id, dim.key as 'width' | 'length' | 'depth', index, e.target.value)}
                                   placeholder={`e.g., 12″, 15¼″`}
                                   className="text-sm"
                                 />
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   onClick={() => addSizeOption(variant.id, dim.key as 'width' | 'length' | 'depth')}
                                 >
                                   <Plus className="h-4 w-4" />
                                 </Button>
                                 {((spec?.[dim.key as keyof SizeSpecification] as string[]) || []).length > 1 && (
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
                           </div>
                        </div>
                      ))}
                      <div className="col-span-full mt-4 pt-4 border-t space-y-2">
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
                        <Button
                          type="button"
                          onClick={() => generateSpecificationsForVariant(variant.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Apply Specifications for this Variant
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
                                  <div className="space-y-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addCompleteSize(variant.id)}
                                      className="w-full py-1 h-6 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Size
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => generateSpecificationsForVariant(variant.id)}
                                      className="w-full py-1 h-6 text-xs"
                                      size="sm"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Apply Specs
                                    </Button>
                                  </div>
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