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

interface ProductVariantsTableProps {
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}

export const ProductVariantsTable: React.FC<ProductVariantsTableProps> = ({
  variants,
  specifications
}) => {
  // Return null only if there are no specifications at all
  if (specifications.length === 0) {
    return null;
  }

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

  // Function to format size values with proper fraction symbols
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
    
    return formattedValue;
  };

  // Use original specs without modification
  const processedSpecs = { ...specsByKey };

  // Get all unique specification keys sorted by sort_order, then by name
  const specificationKeys = Object.keys(processedSpecs).sort((a, b) => {
    const orderA = processedSpecs[a].sort_order;
    const orderB = processedSpecs[b].sort_order;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });

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
                      {variant.variant_name}
                    </TableHead>
                  ))
                ) : (
                  <TableHead className="text-center font-semibold">Value</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {specificationKeys.map((specKey) => (
                <TableRow key={specKey}>
                  <TableCell className="font-medium">{specKey}</TableCell>
                   {hasVariants ? (
                     variants.map((variant) => (
                       <TableCell key={variant.id} className="text-center">
                         {specKey.toLowerCase().includes('size') 
                           ? formatSizeValue(processedSpecs[specKey].values[variant.id] || processedSpecs[specKey].generalValue || '-')
                           : (processedSpecs[specKey].values[variant.id] || processedSpecs[specKey].generalValue || '-')
                         }
                       </TableCell>
                     ))
                   ) : (
                     <TableCell className="text-center">
                       {specKey.toLowerCase().includes('size')
                         ? formatSizeValue(processedSpecs[specKey].generalValue || '-')
                         : (processedSpecs[specKey].generalValue || '-')
                       }
                     </TableCell>
                   )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantsTable;