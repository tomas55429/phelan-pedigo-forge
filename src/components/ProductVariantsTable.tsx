import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
  model_3d_url?: string;
}

interface ProductSpecification {
  id: string;
  variant_id?: string;
  specification_key: string;
  specification_value: string;
  sort_order?: number;
}

interface ProductVariantsTableProps {
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  onSpecificationOrderChange?: (newOrder: string[]) => void;
}

interface SortableRowProps {
  specKey: string;
  processedSpecs: Record<string, { 
    values: Record<string, {value: string, sort_order: number}[]>, 
    sort_order: number, 
    generalValue: string | null 
  }>;
  variants: ProductVariant[];
  hasVariants: boolean;
  formatSizeValue: (value: string) => JSX.Element | string;
  maxSizeCount: number;
}

const SortableRow = ({ specKey, processedSpecs, variants, hasVariants, formatSizeValue, maxSizeCount }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: specKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSizeSpecification = (key: string) => {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes('width') || lowerKey.includes('length') || 
           lowerKey.includes('depth') || lowerKey.includes('height');
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="border-t border-r border-b border-border font-medium bg-muted/30 min-w-[120px]">
        <div className="flex items-center space-x-2">
          <button {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span>{specKey}</span>
        </div>
      </TableCell>
      {isSizeSpecification(specKey) ? (
        // Size specifications with multiple columns and separators
        hasVariants ? (
          variants.flatMap((variant) => {
            const values = processedSpecs[specKey]?.values?.[variant.id] || [];
            return Array.from({ length: maxSizeCount }).map((_, sizeIndex) => {
              const valueData = values[sizeIndex];
              const isFirstOfVariant = sizeIndex === 0;
              const hasValue = valueData && valueData.value.trim();
              
              return (
                <TableCell 
                  key={`${variant.id}-${sizeIndex}`} 
                  className={`text-center border border-border text-sm ${
                    isFirstOfVariant ? 'border-l-2 border-l-primary/70' : 'border-l border-l-muted-foreground/30'
                  } ${!hasValue ? 'bg-muted/20' : ''}`}
                >
                  {hasValue ? formatSizeValue(valueData.value) : '-'}
                </TableCell>
              );
            });
          })
        ) : (
          <TableCell className="text-center border border-border">
            {processedSpecs[specKey]?.generalValue ? 
              formatSizeValue(processedSpecs[specKey].generalValue || '-') : '-'}
          </TableCell>
        )
      ) : (
        // Non-size specifications with single column per variant
        hasVariants ? (
          variants.map((variant) => {
            const values = processedSpecs[specKey]?.values?.[variant.id] || [];
            const value = values.length > 0 ? values[0].value : '';
            return (
              <TableCell 
                key={variant.id} 
                className="text-center border border-border"
                colSpan={maxSizeCount}
              >
                {value || '-'}
              </TableCell>
            );
          })
        ) : (
          <TableCell className="text-center border border-border">
            {processedSpecs[specKey]?.generalValue || '-'}
          </TableCell>
        )
      )}
    </TableRow>
  );
};

export const ProductVariantsTable: React.FC<ProductVariantsTableProps> = ({
  variants,
  specifications,
  onSpecificationOrderChange
}) => {
  // Return null BEFORE any hooks are called
  if (specifications.length === 0) {
    return null;
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Helper function to format variant name - removes hyphens and everything after them
  const formatVariantName = (variantName: string) => {
    const name = variantName || '';
    // Remove hyphen and everything after it
    const cleanName = name.split('-')[0].trim();
    return cleanName;
  };

  // Group specifications by key and variant, maintaining order for size sets
  const specsByKey = specifications.reduce((acc, spec) => {
    if (!acc[spec.specification_key]) {
      acc[spec.specification_key] = {
        values: {},
        sort_order: spec.sort_order || 0,
        generalValue: null
      };
    }
    if (spec.variant_id) {
      if (!acc[spec.specification_key].values[spec.variant_id]) {
        acc[spec.specification_key].values[spec.variant_id] = [];
      }
      acc[spec.specification_key].values[spec.variant_id].push({
        value: spec.specification_value,
        sort_order: spec.sort_order || 0
      });
    } else {
      acc[spec.specification_key].generalValue = spec.specification_value;
    }
    return acc;
  }, {} as Record<string, { 
    values: Record<string, {value: string, sort_order: number}[]>, 
    sort_order: number, 
    generalValue: string | null 
  }>);

  // Sort values within each specification key by sort_order
  Object.keys(specsByKey).forEach(key => {
    Object.keys(specsByKey[key].values).forEach(variantId => {
      specsByKey[key].values[variantId].sort((a, b) => a.sort_order - b.sort_order);
    });
  });

  // Function to format size values with proper fraction symbols and smaller font
  const formatSizeValue = (value: string): JSX.Element | string => {
    if (!value || value === '-') return value;
    
    // Mapping of common fractions to Unicode symbols
    const fractionMap: { [key: string]: string } = {
      '1/2': '½',
      '1/3': '⅓',
      '2/3': '⅔',
      '1/4': '¼',
      '3/4': '¾',
      '1/5': '⅕',
      '2/5': '⅖',
      '3/5': '⅗',
      '4/5': '⅘',
      '1/6': '⅙',
      '5/6': '⅚',
      '1/8': '⅛',
      '3/8': '⅜',
      '5/8': '⅝',
      '7/8': '⅞'
    };
    
    // Replace fractions with Unicode symbols
    let formattedValue = value;
    Object.entries(fractionMap).forEach(([fraction, symbol]) => {
      formattedValue = formattedValue.replace(new RegExp(fraction, 'g'), symbol);
    });
    
    return <span className="text-sm font-medium" key={formattedValue}>{formattedValue}</span>;
  };

  // Use original specs without modification
  const processedSpecs = { ...specsByKey };

  // Calculate maximum number of sizes across all variants and specifications
  const maxSizeCount = Math.max(
    1,
    ...Object.values(processedSpecs).flatMap(spec => 
      Object.values(spec.values).map(values => values.length)
    )
  );

  // Custom ordering: Description first, then Width, Length, Depth, then others
  const getSpecOrder = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('description')) return 1;
    if (lowerKey === 'width') return 2;
    if (lowerKey === 'length') return 3;
    if (lowerKey === 'depth') return 4;
    return processedSpecs[key].sort_order || 999;
  };

  // Get all unique specification keys with custom ordering
  const [specificationKeys, setSpecificationKeys] = useState<string[]>([]);

  // Update specificationKeys whenever processedSpecs changes
  useEffect(() => {
    const keys = Object.keys(processedSpecs).sort((a, b) => {
      const orderA = getSpecOrder(a);
      const orderB = getSpecOrder(b);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.localeCompare(b);
    });
    
    // Only update if keys have actually changed to prevent infinite loops
    setSpecificationKeys(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(keys)) {
        return keys;
      }
      return prev;
    });
  }, [Object.keys(processedSpecs).join(',')]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = specificationKeys.indexOf(active.id as string);
      const newIndex = specificationKeys.indexOf(over.id as string);
      
      const newOrder = arrayMove(specificationKeys, oldIndex, newIndex);
      setSpecificationKeys(newOrder);
      
      if (onSpecificationOrderChange) {
        onSpecificationOrderChange(newOrder);
      }
    }
  };

  // Determine if we have variants to show or just general specs
  const hasVariants = variants.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications: Standard Sizes (inside dimensions)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="border-t border-r border-b border-border bg-muted/50 font-semibold min-w-[120px]">
                  Specification
                </TableHead>
                {hasVariants ? (
                  variants.flatMap((variant) => {
                    return Array.from({ length: maxSizeCount }).map((_, sizeIndex) => (
                      <TableHead 
                        key={`${variant.id}-${sizeIndex}`} 
                        className="border border-border bg-muted/50 text-center font-semibold min-w-[80px]"
                      >
                        {sizeIndex === 0 && (
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
                        )}
                      </TableHead>
                    ));
                  })
                ) : (
                  <TableHead className="text-center font-semibold">Value</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={specificationKeys} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {specificationKeys.map((specKey) => (
                    <SortableRow
                      key={specKey}
                      specKey={specKey}
                      processedSpecs={processedSpecs}
                      variants={variants}
                      hasVariants={hasVariants}
                      formatSizeValue={formatSizeValue}
                      maxSizeCount={maxSizeCount}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Custom sizes available
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantsTable;