import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';

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

interface SizeSet {
  id: string;
  product_id: string;
  variant_id?: string;
  set_index: number;
  width?: string;
  length?: string;
  depth?: string;
  weight?: string;
}

interface SpecificationsTableProps {
  productId?: string;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  title?: string;
}

export const SpecificationsTable: React.FC<SpecificationsTableProps> = ({
  productId,
  variants,
  specifications,
  title = "Specifications: Standard Sizes (inside dimensions)"
}) => {
  const [sizeSets, setSizeSets] = useState<SizeSet[]>([]);

  useEffect(() => {
    if (productId) {
      fetchSizeSets();
    }
  }, [productId]);

  const fetchSizeSets = async () => {
    if (!productId) return;
    
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

  // Helper function to format variant name - only removes trailing product codes after hyphens
  const formatVariantName = (variantName: string) => {
    const name = variantName || '';
    
    // If name starts with hyphen, return the full name
    if (name.startsWith('-')) {
      return name;
    }
    
    // Otherwise, remove hyphen and everything after it (product codes)
    const cleanName = name.split('-')[0].trim();
    return cleanName;
  };

  // Helper function to format size values with proper fraction symbols
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

  // Filter out size-related specifications since they're now handled by sizeSets
  const nonSizeSpecs = specifications.filter(spec => {
    const key = spec.specification_key.toLowerCase();
    return !key.includes('width') && !key.includes('length') && !key.includes('depth') && !key.includes('height') && !key.includes('weight');
  });

  // Group specifications by key and variant
  const specsByKey = nonSizeSpecs.reduce((acc, spec) => {
    if (!acc[spec.specification_key]) {
      acc[spec.specification_key] = {
        values: {},
        sort_order: spec.sort_order || 0,
        generalValue: null
      };
    }
    if (spec.variant_id) {
      acc[spec.specification_key].values[spec.variant_id] = spec.specification_value;
    } else {
      acc[spec.specification_key].generalValue = spec.specification_value;
    }
    return acc;
  }, {} as Record<string, { values: Record<string, string>, sort_order: number, generalValue: string | null }>);

  // Get specification keys in order
  const specificationKeys = Object.keys(specsByKey).sort((a, b) => {
    const orderA = specsByKey[a].sort_order;
    const orderB = specsByKey[b].sort_order;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });

  // Group size sets by variant
  const sizeSetsByVariant = sizeSets.reduce((acc, sizeSet) => {
    const key = sizeSet.variant_id || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(sizeSet);
    return acc;
  }, {} as Record<string, SizeSet[]>);

  // Get maximum number of size sets across all variants/general
  const maxSets = Math.max(
    1,
    ...Object.values(sizeSetsByVariant).map(sets => sets.length)
  );

  // Return null if there are no specifications and no size sets
  if (specificationKeys.length === 0 && sizeSets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Size Sets Table */}
      {sizeSets.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Size Sets (inside dimensions)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-border bg-muted/50 font-semibold text-left px-4 py-3 min-w-[120px]">
                      Dimension
                    </TableHead>
                    {variants.length > 0 ? (
                      variants.map((variant) => {
                        const variantSets = sizeSetsByVariant[variant.id] || [];
                        const colSpan = Math.max(1, variantSets.length);
                        
                        return (
                          <TableHead 
                            key={variant.id} 
                            className="border border-border bg-muted/50 text-center font-semibold px-3 py-3"
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
                      <TableHead className="border border-border bg-muted/50 text-center font-semibold px-4 py-3" colSpan={maxSets}>
                        Size Sets
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Width Row */}
                  <TableRow>
                    <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">Width</TableCell>
                    {variants.length > 0 ? (
                      variants.flatMap((variant) => {
                        const variantSets = sizeSetsByVariant[variant.id] || [];
                        const generalSets = sizeSetsByVariant['general'] || [];
                        
                        if (variantSets.length === 0 && generalSets.length > 0) {
                          return generalSets.map((sizeSet, index) => (
                            <TableCell key={`${variant.id}-general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                              {formatSizeValue(sizeSet.width)}
                            </TableCell>
                          ));
                        }
                        
                        return variantSets.map((sizeSet, index) => (
                          <TableCell key={`${variant.id}-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                            {formatSizeValue(sizeSet.width)}
                          </TableCell>
                        ));
                      })
                    ) : (
                      sizeSetsByVariant['general']?.map((sizeSet, index) => (
                        <TableCell key={`general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                          {formatSizeValue(sizeSet.width)}
                        </TableCell>
                      )) || <TableCell className="border border-border text-center px-4 py-3">-</TableCell>
                    )}
                  </TableRow>

                  {/* Length Row */}
                  <TableRow>
                    <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">Length</TableCell>
                    {variants.length > 0 ? (
                      variants.flatMap((variant) => {
                        const variantSets = sizeSetsByVariant[variant.id] || [];
                        const generalSets = sizeSetsByVariant['general'] || [];
                        
                        if (variantSets.length === 0 && generalSets.length > 0) {
                          return generalSets.map((sizeSet, index) => (
                            <TableCell key={`${variant.id}-general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                              {formatSizeValue(sizeSet.length)}
                            </TableCell>
                          ));
                        }
                        
                        return variantSets.map((sizeSet, index) => (
                          <TableCell key={`${variant.id}-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                            {formatSizeValue(sizeSet.length)}
                          </TableCell>
                        ));
                      })
                    ) : (
                      sizeSetsByVariant['general']?.map((sizeSet, index) => (
                        <TableCell key={`general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                          {formatSizeValue(sizeSet.length)}
                        </TableCell>
                      )) || <TableCell className="border border-border text-center px-4 py-3">-</TableCell>
                    )}
                  </TableRow>

                  {/* Depth Row */}
                  <TableRow>
                    <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">Depth</TableCell>
                    {variants.length > 0 ? (
                      variants.flatMap((variant) => {
                        const variantSets = sizeSetsByVariant[variant.id] || [];
                        const generalSets = sizeSetsByVariant['general'] || [];
                        
                        if (variantSets.length === 0 && generalSets.length > 0) {
                          return generalSets.map((sizeSet, index) => (
                            <TableCell key={`${variant.id}-general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                              {formatSizeValue(sizeSet.depth)}
                            </TableCell>
                          ));
                        }
                        
                        return variantSets.map((sizeSet, index) => (
                          <TableCell key={`${variant.id}-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                            {formatSizeValue(sizeSet.depth)}
                          </TableCell>
                        ));
                      })
                    ) : (
                      sizeSetsByVariant['general']?.map((sizeSet, index) => (
                        <TableCell key={`general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                          {formatSizeValue(sizeSet.depth)}
                        </TableCell>
                      )) || <TableCell className="border border-border text-center px-4 py-3">-</TableCell>
                    )}
                   </TableRow>

                   {/* Weight Row */}
                   <TableRow>
                     <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">Weight</TableCell>
                     {variants.length > 0 ? (
                       variants.flatMap((variant) => {
                         const variantSets = sizeSetsByVariant[variant.id] || [];
                         const generalSets = sizeSetsByVariant['general'] || [];
                         
                         if (variantSets.length === 0 && generalSets.length > 0) {
                           return generalSets.map((sizeSet, index) => (
                             <TableCell key={`${variant.id}-general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                               {formatSizeValue(sizeSet.weight)}
                             </TableCell>
                           ));
                         }
                         
                         return variantSets.map((sizeSet, index) => (
                           <TableCell key={`${variant.id}-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                             {formatSizeValue(sizeSet.weight)}
                           </TableCell>
                         ));
                       })
                     ) : (
                       sizeSetsByVariant['general']?.map((sizeSet, index) => (
                         <TableCell key={`general-${index}`} className="border border-border text-center px-3 py-3 text-sm">
                           {formatSizeValue(sizeSet.weight)}
                         </TableCell>
                       )) || <TableCell className="border border-border text-center px-4 py-3">-</TableCell>
                     )}
                   </TableRow>
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

      {/* Non-Size Specifications Table */}
      {specificationKeys.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Additional Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-border bg-muted/50 font-semibold text-left px-4 py-3 min-w-[120px]">
                      Specification
                    </TableHead>
                    {variants.length > 0 ? (
                      variants.map((variant) => (
                        <TableHead 
                          key={variant.id} 
                          className="border border-border bg-muted/50 text-center font-semibold px-3 py-3 min-w-[100px]"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-sm">
                              Product No.
                            </div>
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
                      ))
                    ) : (
                      <TableHead className="border border-border bg-muted/50 text-center font-semibold px-4 py-3">
                        Value
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specificationKeys.map((specKey, index) => (
                    <TableRow key={specKey} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <TableCell className="border border-border font-medium px-4 py-3 bg-muted/30">
                        {specKey}
                      </TableCell>
                      {variants.length > 0 ? (
                        variants.map((variant) => {
                          const value = specsByKey[specKey].values[variant.id] || 
                                       specsByKey[specKey].generalValue || 
                                       '-';
                          return (
                            <TableCell 
                              key={variant.id} 
                              className="border border-border text-center px-3 py-3 text-sm"
                            >
                              {value}
                            </TableCell>
                          );
                        })
                      ) : (
                        <TableCell className="border border-border text-center px-4 py-3 text-sm">
                          {specsByKey[specKey].generalValue || '-'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpecificationsTable;
