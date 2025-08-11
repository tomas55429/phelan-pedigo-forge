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
  processedSpecs: Record<string, { values: Record<string, string>, sort_order: number, generalValue: string | null }>;
  variants: ProductVariant[];
  hasVariants: boolean;
  formatSizeValue: (value: string) => JSX.Element | string;
}

const SortableRow: React.FC<SortableRowProps> = ({ specKey, processedSpecs, variants, hasVariants, formatSizeValue }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: specKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <span>{specKey}</span>
        </div>
      </TableCell>
      {hasVariants ? (
        variants.map((variant) => (
           <TableCell key={variant.id} className="text-center">
             {processedSpecs[specKey] ? (
               specKey.toLowerCase().includes('size') 
                 ? formatSizeValue(processedSpecs[specKey].values[variant.id] || processedSpecs[specKey].generalValue || '-')
                 : (processedSpecs[specKey].values[variant.id] || processedSpecs[specKey].generalValue || '-')
             ) : '-'}
           </TableCell>
        ))
      ) : (
         <TableCell className="text-center">
           {processedSpecs[specKey] ? (
             specKey.toLowerCase().includes('size')
               ? formatSizeValue(processedSpecs[specKey].generalValue || '-')
               : (processedSpecs[specKey].generalValue || '-')
           ) : '-'}
         </TableCell>
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

  // Group specifications by key and variant
  const specsByKey = specifications.reduce((acc, spec) => {
    if (!acc[spec.specification_key]) {
      acc[spec.specification_key] = {
        values: {},
        sort_order: spec.sort_order || 0,
        generalValue: null // For specifications without variant_id
      };
    }
    if (spec.variant_id) {
      acc[spec.specification_key].values[spec.variant_id] = spec.specification_value;
    } else {
      // General specification (not tied to a variant)
      acc[spec.specification_key].generalValue = spec.specification_value;
    }
    return acc;
  }, {} as Record<string, { values: Record<string, string>, sort_order: number, generalValue: string | null }>);

  // Function to format size values with proper fraction symbols and smaller font
  const formatSizeValue = (value: string) => {
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
    
    return <span className="text-sm">{formattedValue}</span>;
  };

  // Use original specs without modification
  const processedSpecs = { ...specsByKey };

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
    setSpecificationKeys(keys);
  }, [processedSpecs]);

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
  const hasVariantSpecs = specifications.some(spec => spec.variant_id);
  const hasGeneralSpecs = specifications.some(spec => !spec.variant_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Specification</TableHead>
                {hasVariants ? (
                  variants.map((variant) => (
                    <TableHead key={variant.id} className="text-center font-semibold">
                      {formatVariantName(variant.variant_name)}
                    </TableHead>
                  ))
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