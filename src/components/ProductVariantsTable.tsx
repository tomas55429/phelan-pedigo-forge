import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
}

interface ProductSpecification {
  id: string;
  variant_id?: string;
  specification_key: string;
  specification_value: string;
}

interface ProductVariantsTableProps {
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}

export const ProductVariantsTable: React.FC<ProductVariantsTableProps> = ({
  variants,
  specifications
}) => {
  if (variants.length === 0) {
    return null;
  }

  // Group specifications by key and variant
  const specsByKey = specifications.reduce((acc, spec) => {
    if (!acc[spec.specification_key]) {
      acc[spec.specification_key] = {};
    }
    if (spec.variant_id) {
      acc[spec.specification_key][spec.variant_id] = spec.specification_value;
    }
    return acc;
  }, {} as Record<string, Record<string, string>>);

  // Get all unique specification keys
  const specificationKeys = Object.keys(specsByKey).sort();

  // Check if we have any variant-specific specifications
  const hasVariantSpecs = specifications.some(spec => spec.variant_id);

  if (!hasVariantSpecs || specificationKeys.length === 0) {
    return null;
  }

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
                <TableHead className="font-semibold">Product No.</TableHead>
                {variants.map((variant) => (
                  <TableHead key={variant.id} className="text-center font-semibold">
                    {variant.variant_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {specificationKeys.map((specKey) => (
                <TableRow key={specKey}>
                  <TableCell className="font-medium">{specKey}</TableCell>
                  {variants.map((variant) => (
                    <TableCell key={variant.id} className="text-center">
                      {specsByKey[specKey][variant.id] || '-'}
                    </TableCell>
                  ))}
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