import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
}

interface SizeSet {
  id: string;
  product_id: string;
  variant_id?: string;
  set_index: number;
  width?: string;
  length?: string;
  depth?: string;
}

interface ProductSpecification {
  id: string;
  specification_key: string;
  specification_value: string;
  sort_order?: number;
  variant_id?: string;
}

interface ProductVariantsTableProps {
  productId: string;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  isAdmin?: boolean;
  onSpecificationOrderChange?: (newOrder: ProductSpecification[]) => void;
}

interface SortableRowProps {
  spec: {
    id: string;
    specification_key: string;
    specification_value: string;
    sort_order?: number;
    variantValues: Record<string, string>;
    generalValue: string | null;
  };
  variants: ProductVariant[];
  isAdmin: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
  spec,
  variants,
  isAdmin,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: spec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="border font-medium bg-muted/30 min-w-[120px]">
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button {...listeners} className="cursor-grab hover:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <span>{spec.specification_key}</span>
        </div>
      </TableCell>
      {variants.length > 0 ? (
        variants.map((variant) => (
          <TableCell key={variant.id} className="text-center border">
            {spec.variantValues[variant.id] || spec.generalValue || '-'}
          </TableCell>
        ))
      ) : (
        <TableCell className="text-center border">
          {spec.generalValue || spec.specification_value || '-'}
        </TableCell>
      )}
    </TableRow>
  );
};


export const ProductVariantsTableNew: React.FC<ProductVariantsTableProps> = ({
  productId,
  variants,
  specifications,
  isAdmin = false,
  onSpecificationOrderChange,
}) => {
  const { isAdmin: userIsAdmin } = useAuth();
  const effectiveIsAdmin = isAdmin || userIsAdmin;
  const [sizeSets, setSizeSets] = useState<SizeSet[]>([]);

  // Fetch size sets
  useEffect(() => {
    fetchSizeSets();
  }, [productId]);

  const fetchSizeSets = async () => {
    try {
      const { data, error } = await supabase
        .from('product_size_sets')
        .select('*')
        .eq('product_id', productId)
        .order('variant_id', { nullsFirst: true })
        .order('set_index');

      if (error) throw error;
      setSizeSets(data || []);
    } catch (error) {
      console.error('Error fetching size sets:', error);
    }
  };

  const formatSizeValue = (value?: string): string => {
    if (!value || value === '-') return '-';
    
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
    
    let formattedValue = value;
    Object.entries(fractionMap).forEach(([fraction, symbol]) => {
      formattedValue = formattedValue.replace(new RegExp(fraction, 'g'), symbol);
    });
    
    return formattedValue;
  };

  // Group size sets by variant
  const sizeSetsByVariant = sizeSets.reduce((acc, sizeSet) => {
    const key = sizeSet.variant_id || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(sizeSet);
    return acc;
  }, {} as Record<string, SizeSet[]>);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter out size-related specifications since they're now handled by SizeSetsTable
  const nonSizeSpecs = specifications.filter(spec => {
    const key = spec.specification_key.toLowerCase();
    return !key.includes('width') && !key.includes('length') && !key.includes('depth') && !key.includes('height');
  });

  // Group specifications by key to avoid duplicates - each spec key should appear only once
  const specsByKey = nonSizeSpecs.reduce((acc, spec) => {
    if (!acc[spec.specification_key]) {
      acc[spec.specification_key] = {
        id: spec.id,
        specification_key: spec.specification_key,
        specification_value: spec.specification_value,
        sort_order: spec.sort_order,
        variantValues: {},
        generalValue: null
      };
    }
    
    if (spec.variant_id) {
      acc[spec.specification_key].variantValues[spec.variant_id] = spec.specification_value;
    } else {
      acc[spec.specification_key].generalValue = spec.specification_value;
    }
    
    return acc;
  }, {} as Record<string, {
    id: string;
    specification_key: string;
    specification_value: string;
    sort_order?: number;
    variantValues: Record<string, string>;
    generalValue: string | null;
  }>);

  // Convert back to array for rendering, with unique specifications
  const uniqueSpecs = Object.values(specsByKey).sort((a, b) => {
    const orderA = a.sort_order || 0;
    const orderB = b.sort_order || 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.specification_key.localeCompare(b.specification_key);
  });

  const [specificationOrder, setSpecificationOrder] = useState(uniqueSpecs);

  // Update specification order when uniqueSpecs changes
  useEffect(() => {
    setSpecificationOrder(uniqueSpecs);
  }, [uniqueSpecs.length, specifications.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = specificationOrder.findIndex(spec => spec.id === active.id);
      const newIndex = specificationOrder.findIndex(spec => spec.id === over.id);
      
      const newOrder = arrayMove(specificationOrder, oldIndex, newIndex);
      setSpecificationOrder(newOrder);
      
      if (onSpecificationOrderChange) {
        onSpecificationOrderChange(newOrder);
      }
    }
  };

  const formatVariantName = (variantName: string) => {
    // If name starts with hyphen, return the full name
    if (variantName.startsWith('-')) {
      return variantName;
    }
    // Otherwise, remove hyphen and everything after it (product codes)
    return variantName.split('-')[0].trim();
  };

  return (
    <div className="space-y-4">
      {/* Combined Specifications Table */}
      {(sizeSets.length > 0 || uniqueSpecs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border bg-muted/50 font-semibold min-w-[120px]">
                      Specification
                    </TableHead>
                    {variants.length > 0 ? (
                      variants.map((variant) => {
                        const variantSets = sizeSetsByVariant[variant.id] || [];
                        const generalSets = sizeSetsByVariant['general'] || [];
                        const effectiveSets = variantSets.length > 0 ? variantSets : generalSets;
                        const colSpan = Math.max(1, effectiveSets.length);
                        
                        return (
                          <TableHead 
                            key={variant.id} 
                            className="border bg-muted/50 text-center font-semibold"
                            colSpan={colSpan}
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
                        );
                      })
                    ) : (
                      <TableHead className="border bg-muted/50 text-center font-semibold" colSpan={Math.max(1, sizeSetsByVariant['general']?.length || 1)}>
                        Value
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Size Set Rows - Width, Length, Depth */}
                  {sizeSets.length > 0 && (
                    <>
                      {/* Width Row */}
                      <TableRow>
                        <TableCell className="border font-medium bg-muted/30">Width (inside dimensions)</TableCell>
                        {variants.length > 0 ? (
                          variants.flatMap((variant) => {
                            const variantSets = sizeSetsByVariant[variant.id] || [];
                            const generalSets = sizeSetsByVariant['general'] || [];
                            
                            if (variantSets.length === 0 && generalSets.length > 0) {
                              return generalSets.map((sizeSet, index) => (
                                <TableCell key={`${variant.id}-general-${index}`} className="text-center border text-sm">
                                  {formatSizeValue(sizeSet.width)}
                                </TableCell>
                              ));
                            }
                            
                            return variantSets.map((sizeSet, index) => (
                              <TableCell key={`${variant.id}-${index}`} className="text-center border text-sm">
                                {formatSizeValue(sizeSet.width)}
                              </TableCell>
                            ));
                          })
                        ) : (
                          sizeSetsByVariant['general']?.map((sizeSet, index) => (
                            <TableCell key={`general-${index}`} className="text-center border text-sm">
                              {formatSizeValue(sizeSet.width)}
                            </TableCell>
                          )) || <TableCell className="text-center border">-</TableCell>
                        )}
                      </TableRow>

                      {/* Length Row */}
                      <TableRow>
                        <TableCell className="border font-medium bg-muted/30">Length (inside dimensions)</TableCell>
                        {variants.length > 0 ? (
                          variants.flatMap((variant) => {
                            const variantSets = sizeSetsByVariant[variant.id] || [];
                            const generalSets = sizeSetsByVariant['general'] || [];
                            
                            if (variantSets.length === 0 && generalSets.length > 0) {
                              return generalSets.map((sizeSet, index) => (
                                <TableCell key={`${variant.id}-general-${index}`} className="text-center border text-sm">
                                  {formatSizeValue(sizeSet.length)}
                                </TableCell>
                              ));
                            }
                            
                            return variantSets.map((sizeSet, index) => (
                              <TableCell key={`${variant.id}-${index}`} className="text-center border text-sm">
                                {formatSizeValue(sizeSet.length)}
                              </TableCell>
                            ));
                          })
                        ) : (
                          sizeSetsByVariant['general']?.map((sizeSet, index) => (
                            <TableCell key={`general-${index}`} className="text-center border text-sm">
                              {formatSizeValue(sizeSet.length)}
                            </TableCell>
                          )) || <TableCell className="text-center border">-</TableCell>
                        )}
                      </TableRow>

                      {/* Depth Row */}
                      <TableRow>
                        <TableCell className="border font-medium bg-muted/30">Depth (inside dimensions)</TableCell>
                        {variants.length > 0 ? (
                          variants.flatMap((variant) => {
                            const variantSets = sizeSetsByVariant[variant.id] || [];
                            const generalSets = sizeSetsByVariant['general'] || [];
                            
                            if (variantSets.length === 0 && generalSets.length > 0) {
                              return generalSets.map((sizeSet, index) => (
                                <TableCell key={`${variant.id}-general-${index}`} className="text-center border text-sm">
                                  {formatSizeValue(sizeSet.depth)}
                                </TableCell>
                              ));
                            }
                            
                            return variantSets.map((sizeSet, index) => (
                              <TableCell key={`${variant.id}-${index}`} className="text-center border text-sm">
                                {formatSizeValue(sizeSet.depth)}
                              </TableCell>
                            ));
                          })
                        ) : (
                          sizeSetsByVariant['general']?.map((sizeSet, index) => (
                            <TableCell key={`general-${index}`} className="text-center border text-sm">
                              {formatSizeValue(sizeSet.depth)}
                            </TableCell>
                          )) || <TableCell className="text-center border">-</TableCell>
                        )}
                      </TableRow>
                    </>
                  )}

                  {/* Additional Specifications Rows */}
                  {effectiveIsAdmin ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={specificationOrder.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {specificationOrder.map((spec) => (
                          <SortableRow
                            key={spec.id}
                            spec={spec}
                            variants={variants}
                            isAdmin={effectiveIsAdmin}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <>
                      {specificationOrder.map((spec) => (
                        <SortableRow
                          key={spec.id}
                          spec={spec}
                          variants={variants}
                          isAdmin={effectiveIsAdmin}
                        />
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Footer note */}
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Custom sizes available upon request</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};