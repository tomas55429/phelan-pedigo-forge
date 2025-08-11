import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface SpecificationsTableProps {
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  title?: string;
}

export const SpecificationsTable: React.FC<SpecificationsTableProps> = ({
  variants,
  specifications,
  title = "Specifications: Standard Sizes (inside dimensions)"
}) => {
  // Helper function to format variant name - removes hyphens and everything after them
  const formatVariantName = (variantName: string) => {
    const name = variantName || '';
    const cleanName = name.split('-')[0].trim();
    return cleanName;
  };

  // Helper function to format size values with proper fraction symbols
  const formatSizeValue = (value: string) => {
    if (!value || value === '-') return value;
    
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

  // Return null if there are no specifications
  if (specifications.length === 0) {
    return null;
  }

  // Group specifications by key and variant
  const specsByKey = specifications.reduce((acc, spec) => {
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

  // Separate dimension specs from others and ensure proper order
  const dimensionSpecs = ['Width', 'Length', 'Depth'];
  const otherSpecs = specificationKeys.filter(key => !dimensionSpecs.includes(key));
  const orderedSpecs = [...dimensionSpecs.filter(key => specificationKeys.includes(key)), ...otherSpecs];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
              {orderedSpecs.map((specKey, index) => (
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
                          className={`border text-center px-3 py-3 text-sm ${
                            dimensionSpecs.includes(specKey) 
                              ? 'border-r-2 border-r-primary/30 border-l border-t border-b border-border' 
                              : 'border-border'
                          }`}
                        >
                          {dimensionSpecs.includes(specKey) ? formatSizeValue(value) : value}
                        </TableCell>
                      );
                    })
                  ) : (
                    <TableCell className="border border-border text-center px-4 py-3 text-sm">
                      {dimensionSpecs.includes(specKey) 
                        ? formatSizeValue(specsByKey[specKey].generalValue || '-')
                        : (specsByKey[specKey].generalValue || '-')
                      }
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Footer note */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Custom sizes available upon request</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecificationsTable;