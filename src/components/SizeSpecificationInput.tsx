import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  height: string[];
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
  visible: boolean;
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
      { key: 'width', label: 'Width', enabled: true, visible: true },
      { key: 'length', label: 'Length', enabled: true, visible: true },
      { key: 'depth', label: 'Depth', enabled: true, visible: true },
      { key: 'height', label: 'Height', enabled: true, visible: true },
      { key: 'weight', label: 'Weight', enabled: true, visible: true }
    ]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Update dimensions when customDimensions prop changes
  useEffect(() => {
    if (customDimensions) {
      setDimensions(customDimensions);
    }
  }, [customDimensions]);

  // Initialize with existing size sets from database
  useEffect(() => {
    const initializeSizeSpecs = async () => {
      if (variants.length > 0 && productId) {
        console.log('Initializing size specs for variants:', variants.map(v => v.id));
        
        // Fetch size sets for each variant
        const { data: sizeSets } = await supabase
          .from('product_size_sets')
          .select('*')
          .eq('product_id', productId)
          .order('set_index');

        console.log('Fetched size sets from database:', sizeSets);

        const initialSpecs = variants.map(variant => {
          // Find existing size sets for this variant
          const variantSizeSets = sizeSets?.filter(set => set.variant_id === variant.id) || [];
          
          // Group by dimensions
          const widthValues: string[] = [];
          const lengthValues: string[] = [];
          const depthValues: string[] = [];
          const heightValues: string[] = [];
          const weightValues: string[] = [];
          
          variantSizeSets.forEach(set => {
            const sizeSet = set as any; // Type assertion to handle potentially outdated types
            widthValues.push(sizeSet.width || '');
            lengthValues.push(sizeSet.length || '');
            depthValues.push(sizeSet.depth || '');
            heightValues.push(sizeSet.height || '');
            weightValues.push(sizeSet.weight || '');
          });

          // Ensure at least one empty set
          const maxLen = Math.max(widthValues.length, lengthValues.length, depthValues.length, heightValues.length, weightValues.length, 1);
          const pad = (arr: string[]) => arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')];

          const spec = {
            variantId: variant.id,
            width: pad(widthValues),
            length: pad(lengthValues),
            depth: pad(depthValues),
            height: pad(heightValues),
            weight: pad(weightValues)
          };

          console.log(`Spec for variant ${variant.id}:`, spec);
          return spec;
        });
        
        console.log('Setting initial specs:', initialSpecs);
        setSizeSpecs(initialSpecs);
      }
    };

    // Only initialize if we don't have existing specs for these variants
    if (variants.length > 0 && sizeSpecs.length !== variants.length) {
      initializeSizeSpecs();
    }
  }, [variants.length, productId]); // Only re-run when variants count or productId changes

  // Initialize for general product (no variants)
  useEffect(() => {
    const initializeGeneralProduct = async () => {
      if (variants.length === 0 && productId) {
        console.log('Initializing general product size specs');
        
        // Fetch size sets for general product (no variant_id)
        const { data: sizeSets } = await supabase
          .from('product_size_sets')
          .select('*')
          .eq('product_id', productId)
          .is('variant_id', null)
          .order('set_index');

        console.log('Fetched size sets for general product:', sizeSets);

        // Group by dimensions
        const widthValues: string[] = [];
        const lengthValues: string[] = [];
        const depthValues: string[] = [];
        const heightValues: string[] = [];
        const weightValues: string[] = [];
        
        sizeSets?.forEach(set => {
          const sizeSet = set as any; // Type assertion to handle potentially outdated types
          widthValues.push(sizeSet.width || '');
          lengthValues.push(sizeSet.length || '');
          depthValues.push(sizeSet.depth || '');
          heightValues.push(sizeSet.height || '');
          weightValues.push(sizeSet.weight || '');
        });

        // Ensure at least one empty set
        const maxLen = Math.max(widthValues.length, lengthValues.length, depthValues.length, heightValues.length, weightValues.length, 1);
        const pad = (arr: string[]) => (arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')]);

        const generalSpec = {
          variantId: '', // empty string denotes general product
          width: pad(widthValues),
          length: pad(lengthValues),
          depth: pad(depthValues),
          height: pad(heightValues),
          weight: pad(weightValues),
        };

        console.log('Setting general product spec:', generalSpec);
        setSizeSpecs([generalSpec]);
      }
    };

    // Only initialize if no variants and no existing specs
    if (variants.length === 0 && sizeSpecs.length === 0) {
      initializeGeneralProduct();
    }
  }, [variants.length, productId]); // Only re-run when variants count or productId changes

  const handleSpecChange = (variantId: string, dimension: 'width' | 'length' | 'depth' | 'height' | 'weight', index: number, value: string) => {
    console.log(`handleSpecChange called: variantId=${variantId}, dimension=${dimension}, index=${index}, value="${value}"`);
    
    setSizeSpecs(prev => {
      console.log('Current sizeSpecs before update:', prev);
      
      // Check if the variant exists in current specs
      const existingSpec = prev.find(spec => spec.variantId === variantId);
      if (!existingSpec) {
        console.warn(`Variant ${variantId} not found in current specs. Available variants:`, prev.map(s => s.variantId));
        
        // Auto-create missing variant spec if it's a valid variant
        const isValidVariant = variants.some(v => v.id === variantId) || variantId === '';
        if (isValidVariant) {
          console.log(`Creating new spec for missing variant: ${variantId}`);
          const newSpec = {
            variantId,
            width: [''],
            length: [''],
            depth: [''],
            height: [''],
            weight: ['']
          };
          // Set the value in the new spec
          const current = [...(newSpec[dimension] as string[])];
          if (index >= current.length) {
            const toAdd = index - current.length + 1;
            current.push(...Array(toAdd).fill(''));
          }
          current[index] = value;
          newSpec[dimension] = current;
          
          return [...prev, newSpec];
        } else {
          console.error(`Invalid variant ID: ${variantId}`);
          return prev;
        }
      }
      
      const updated = prev.map(spec => {
        if (spec.variantId !== variantId) return spec;
        const current = [...(spec[dimension] as string[])];
        if (index >= current.length) {
          const toAdd = index - current.length + 1;
          current.push(...Array(toAdd).fill(''));
        }
        current[index] = value;
        const updatedSpec = { 
          ...spec, 
          [dimension]: current
        };
        console.log(`Updated spec for variant ${variantId}:`, updatedSpec);
        return updatedSpec;
      });
      
      console.log('Updated sizeSpecs:', updated);
      return updated;
    });
  };

  const addSizeOption = (variantId: string, dimension: 'width' | 'length' | 'depth' | 'height' | 'weight') => {
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
            height: [...spec.height, ''],
            weight: [...spec.weight, '']
          }
        : spec
    ));
  };

  const removeSizeOption = async (variantId: string, dimension: 'width' | 'length' | 'depth' | 'height' | 'weight', index: number) => {
    const spec = sizeSpecs.find(s => s.variantId === variantId);
    if (!spec) return;

    // Helper to delete a single spec from DB
    const deleteFromDB = async (dimKey: 'width' | 'length' | 'depth' | 'height' | 'weight', value: string) => {
      if (!value || !value.trim() || !onSpecificationDelete) return;
      const label = dimensions.find(d => d.key === dimKey)?.label || dimKey;
      await onSpecificationDelete(productId, variantId, label, value);
    };

    try {
      if (isVertical) {
        // In vertical mode we treat each sizeIndex as a complete set across all dimensions
        // Attempt DB deletion for each enabled dimension value at this index
        const enabledDims = dimensions.filter(d => d.enabled).map(d => d.key as 'width' | 'length' | 'depth' | 'height' | 'weight');
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
          const nextHeight = (s.height || []).filter((_, i) => i !== index);
          const nextWeight = (s.weight || []).filter((_, i) => i !== index);
          return {
            ...s,
            width: nextWidth.length ? nextWidth : [''],
            length: nextLength.length ? nextLength : [''],
            depth: nextDepth.length ? nextDepth : [''],
            height: nextHeight.length ? nextHeight : [''],
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

  const toggleDimensionVisibility = (dimensionKey: string) => {
    const newDimensions = dimensions.map(dim => 
      dim.key === dimensionKey ? { ...dim, visible: !dim.visible } : dim
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
    // Return the full variant name including hyphen and everything after it
    return variantName || '';
  };

  const generateSpecifications = () => {
    const newSizeSets: any[] = [];

    // Determine enabled dimensions and their keys once
    const enabledDimsConfig = dimensions.filter((d) => d.enabled);
    const enabledKeys = enabledDimsConfig.map((d) => d.key as 'width' | 'length' | 'depth' | 'height' | 'weight');

    if (enabledKeys.length === 0) {
      toast({ title: 'Warning', description: 'Please enable at least one dimension before applying specifications' });
      return;
    }

    sizeSpecs.forEach((spec) => {
      // Get the maximum length across all enabled dimensions for this spec
      const maxLen = Math.max(1, ...enabledKeys.map((key) => ((spec[key] as string[]) || []).length));

      for (let i = 0; i < maxLen; i++) {
        const valuesByKey: Record<'width' | 'length' | 'depth' | 'height' | 'weight', string> = {
          width: (spec.width[i] || '').trim(),
          length: (spec.length[i] || '').trim(),
          depth: (spec.depth[i] || '').trim(),
          height: (spec.height[i] || '').trim(),
          weight: (spec.weight[i] || '').trim(),
        };

        // Only skip if ALL enabled dimensions are empty
        const hasAnyValue = enabledKeys.some((k) => {
          const v = valuesByKey[k];
          return typeof v === 'string' && v.trim().length > 0;
        });

        // Always create a size set record, even if some values are empty
        // This allows for partial specifications and proper indexing
        const sizeSetRecord: any = {
          product_id: productId,
          set_index: i,
          width: valuesByKey.width || null,
          length: valuesByKey.length || null,
          depth: valuesByKey.depth || null,
          height: valuesByKey.height || null,
          weight: valuesByKey.weight || null,
        };

        if (spec.variantId) {
          sizeSetRecord.variant_id = spec.variantId;
        }

        // Include the record if it has at least one value or if we're creating placeholder records
        if (hasAnyValue) {
          newSizeSets.push(sizeSetRecord);
        }
      }
    });

    if (newSizeSets.length === 0) {
      toast({ title: 'Info', description: 'Please add at least one specification value before applying' });
      return;
    }

    try {
      onSpecificationsChange(newSizeSets);
      toast({ title: 'Success', description: `${newSizeSets.length} size sets applied successfully` });
    } catch (error) {
      console.error('Error applying specifications:', error);
      toast({ title: 'Error', description: 'Failed to apply specifications. Please try again.' });
    }
  };

  const clearAll = () => {
    setSizeSpecs(prev => prev.map(spec => ({
      ...spec,
      width: [''],
      length: [''],
      depth: [''],
      height: [''],
      weight: ['']
    })));
  };

  const saveChanges = async () => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting to save size specifications for product:', productId);
      console.log('Current sizeSpecs:', sizeSpecs);
      
      // First, get existing size sets from database to compare
      const { data: existingSizeSets } = await supabase
        .from('product_size_sets')
        .select('*')
        .eq('product_id', productId);

      console.log('Existing size sets:', existingSizeSets);

      // Prepare new size sets from current state
      const newSizeSets: any[] = [];
      
      sizeSpecs.forEach((spec, specIndex) => {
        console.log(`Processing spec ${specIndex} for variant ${spec.variantId}:`, spec);
        
        // Get the maximum length across all dimensions for this spec
        const maxLen = Math.max(
          spec.width?.length || 0,
          spec.length?.length || 0,
          spec.depth?.length || 0,
          spec.height?.length || 0,
          spec.weight?.length || 0,
          1
        );

        console.log(`Max length for spec ${specIndex}:`, maxLen);

        for (let i = 0; i < maxLen; i++) {
          const sizeSetRecord: any = {
            product_id: productId,
            set_index: i,
            width: (spec.width?.[i] && spec.width[i].trim()) || null,
            length: (spec.length?.[i] && spec.length[i].trim()) || null,
            depth: (spec.depth?.[i] && spec.depth[i].trim()) || null,
            height: (spec.height?.[i] && spec.height[i].trim()) || null,
            weight: (spec.weight?.[i] && spec.weight[i].trim()) || null,
          };

          // Add variant_id if this is for a specific variant
          if (spec.variantId && spec.variantId.trim()) {
            sizeSetRecord.variant_id = spec.variantId;
          }

          // Check if at least one dimension has a non-empty value
          const hasValue = [
            sizeSetRecord.width,
            sizeSetRecord.length,
            sizeSetRecord.depth,
            sizeSetRecord.height,
            sizeSetRecord.weight
          ].some(val => val && val.trim().length > 0);
          
          console.log(`Size set ${i} for spec ${specIndex}:`, sizeSetRecord, 'hasValue:', hasValue);
          
          if (hasValue) {
            newSizeSets.push(sizeSetRecord);
          }
        }
      });

      console.log('Prepared new size sets:', newSizeSets);

      // Only delete size sets for the specific variants being updated, not all
      const variantIdsBeingUpdated = sizeSpecs.map(spec => spec.variantId);
      console.log('Variants being updated:', variantIdsBeingUpdated);

      // Delete only the size sets for variants we're currently editing
      for (const variantId of variantIdsBeingUpdated) {
        let deleteQuery = supabase
          .from('product_size_sets')
          .delete()
          .eq('product_id', productId);
          
        if (variantId === '') {
          deleteQuery = deleteQuery.is('variant_id', null);
        } else {
          deleteQuery = deleteQuery.eq('variant_id', variantId);
        }
        
        const { error: deleteError } = await deleteQuery;
        if (deleteError) {
          console.error(`Error deleting existing size sets for variant ${variantId}:`, deleteError);
          throw deleteError;
        }
      }

      console.log('Successfully deleted size sets for updated variants only');

      // Insert new size sets if any
      if (newSizeSets.length > 0) {
        const { error, data } = await supabase
          .from('product_size_sets')
          .insert(newSizeSets)
          .select();
        
        if (error) {
          console.error('Error inserting new size sets:', error);
          throw error;
        }
        
        console.log('Successfully inserted size sets:', data);
        
        toast({
          title: "Success",
          description: `${newSizeSets.length} size specifications saved successfully`
        });
      } else {
        console.log('No size sets to save');
        toast({
          title: "Info",
          description: "No size specifications to save"
        });
      }

      // Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Refresh the local state with the saved data
      await refreshSizeSpecs();

      // Call onSpecificationsChange to update parent component
      if (onSpecificationsChange) {
        onSpecificationsChange(newSizeSets);
      }

    } catch (error: any) {
      console.error('Error saving size specifications:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save size specifications',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to refresh size specs from database
  const refreshSizeSpecs = async () => {
    if (!productId) return;

    try {
      // Fetch fresh size sets from database
      const { data: sizeSets } = await supabase
        .from('product_size_sets')
        .select('*')
        .eq('product_id', productId)
        .order('set_index');

      console.log('Refreshed size sets from database:', sizeSets);

      if (variants.length > 0) {
        // For products with variants
        const refreshedSpecs = variants.map(variant => {
          const variantSizeSets = sizeSets?.filter(set => set.variant_id === variant.id) || [];
          
          const widthValues: string[] = [];
          const lengthValues: string[] = [];
          const depthValues: string[] = [];
          const heightValues: string[] = [];
          const weightValues: string[] = [];
          
          variantSizeSets.forEach(set => {
            const sizeSet = set as any;
            widthValues.push(sizeSet.width || '');
            lengthValues.push(sizeSet.length || '');
            depthValues.push(sizeSet.depth || '');
            heightValues.push(sizeSet.height || '');
            weightValues.push(sizeSet.weight || '');
          });

          const maxLen = Math.max(widthValues.length, lengthValues.length, depthValues.length, heightValues.length, weightValues.length, 1);
          const pad = (arr: string[]) => arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')];

          return {
            variantId: variant.id,
            width: pad(widthValues),
            length: pad(lengthValues),
            depth: pad(depthValues),
            height: pad(heightValues),
            weight: pad(weightValues)
          };
        });
        
        setSizeSpecs(refreshedSpecs);
      } else {
        // For general product (no variants)
        const generalSizeSets = sizeSets?.filter(set => set.variant_id === null) || [];
        
        const widthValues: string[] = [];
        const lengthValues: string[] = [];
        const depthValues: string[] = [];
        const heightValues: string[] = [];
        const weightValues: string[] = [];
        
        generalSizeSets.forEach(set => {
          const sizeSet = set as any;
          widthValues.push(sizeSet.width || '');
          lengthValues.push(sizeSet.length || '');
          depthValues.push(sizeSet.depth || '');
          heightValues.push(sizeSet.height || '');
          weightValues.push(sizeSet.weight || '');
        });

        const maxLen = Math.max(widthValues.length, lengthValues.length, depthValues.length, heightValues.length, weightValues.length, 1);
        const pad = (arr: string[]) => (arr.length >= maxLen ? arr : [...arr, ...Array(maxLen - arr.length).fill('')]);

        const generalSpec = {
          variantId: '',
          width: pad(widthValues),
          length: pad(lengthValues),
          depth: pad(depthValues),
          height: pad(heightValues),
          weight: pad(weightValues),
        };

        setSizeSpecs([generalSpec]);
      }
    } catch (error) {
      console.error('Error refreshing size specs:', error);
    }
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
            <Button onClick={saveChanges} variant="default" size="sm" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`dim-${dim.key}`}
                      checked={dim.enabled}
                      onCheckedChange={() => toggleDimension(dim.key)}
                    />
                    <Label htmlFor={`dim-${dim.key}`} className="text-sm font-medium min-w-[60px]">
                      {dim.key === 'width' ? 'Dim 1:' : 
                       dim.key === 'length' ? 'Dim 2:' : 
                       dim.key === 'depth' ? 'Dim 3:' :
                       dim.key === 'height' ? 'Dim 4:' : 'Dim 5:'}
                    </Label>
                  </div>
                  <Input
                    value={dim.label}
                    onChange={(e) => updateDimensionLabel(dim.key, e.target.value)}
                    placeholder="e.g., Width, Height, Length"
                    className="flex-1 max-w-[200px]"
                  />
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`visible-${dim.key}`} className="text-sm whitespace-nowrap">
                      Show in table
                    </Label>
                    <Checkbox
                      id={`visible-${dim.key}`}
                      checked={dim.visible}
                      onCheckedChange={() => toggleDimensionVisibility(dim.key)}
                    />
                  </div>
                  <Badge variant={dim.enabled ? "default" : "secondary"}>
                    {dim.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Enable checkboxes to include dimensions in specifications. Use "Show in table" to control visibility in the display table.
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
                                                  onChange={(e) => handleSpecChange(variant.id, d.key as 'width' | 'length' | 'depth' | 'height' | 'weight', sizeIndex, e.target.value)}
                                                  placeholder={`e.g., 12″, 15¼″`}
                                                  className="text-sm"
                                                />
                                                {values.length > 1 && (
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeSizeOption(variant.id, d.key as 'width' | 'length' | 'depth' | 'height' | 'weight', sizeIndex)}
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
                          const dimensionKey = dimension.key as 'width' | 'length' | 'depth' | 'height' | 'weight';
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
                      const allForDim = (spec?.[dim.key as 'width' | 'length' | 'depth' | 'height' | 'weight'] as string[]) || [];
                      const maxLen = Math.max(
                        ...dimensions.filter(d => d.enabled).map(d => ((sizeSpecs[0]?.[d.key as 'width' | 'length' | 'depth' | 'height' | 'weight'] as string[]) || []).length),
                        1
                      );
                      return (
                        <div key={dim.key} className="space-y-2">
                          <Label htmlFor={`${dim.key}-general`}>{dim.label}</Label>
                          <div className="space-y-3">
                             {Array.from({ length: maxLen }).map((_, sizeIndex) => {
                               const hasAnyValue = dimensions.filter(d => d.enabled).some(d =>
                                 ((sizeSpecs[0]?.[d.key as 'width' | 'length' | 'depth' | 'height' | 'weight'] as string[])?.[sizeIndex] || '').trim()
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
                                       onChange={(e) => handleSpecChange('', dim.key as 'width' | 'length' | 'depth' | 'height' | 'weight', sizeIndex, e.target.value)}
                                       placeholder={`e.g., 12″, 15¼″`}
                                       className="text-sm"
                                     />
                                     {allForDim.length > 1 && (
                                       <Button
                                         type="button"
                                         variant="outline"
                                         size="sm"
                                         onClick={() => removeSizeOption('', dim.key as 'width' | 'length' | 'depth' | 'height' | 'weight', sizeIndex)}
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
                       const dimensionKey = dimension.key as 'width' | 'length' | 'depth' | 'height' | 'weight';
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