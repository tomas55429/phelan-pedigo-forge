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

  // Function to format dimensions from Width, Length, Depth
  const formatDimensions = (width: string | undefined, length: string | undefined, depth: string | undefined) => {
    const w = width || '-';
    const l = length || '-';
    const d = depth || '-';
    return `${w} x ${l} x ${d}`;
  };

  // Create combined dimensions and filter out individual dimension specs
  const processedSpecs = { ...specsByKey };
  const dimensionKeys = ['Width', 'Length', 'Depth', 'width', 'length', 'depth'];
  
  // Check if we have any dimension specifications
  const hasDimensions = dimensionKeys.some(key => 
    Object.keys(specsByKey).some(specKey => 
      specKey.toLowerCase().includes(key.toLowerCase())
    )
  );

  if (hasDimensions) {
    // Find width, length, depth specs (case insensitive)
    const widthKey = Object.keys(specsByKey).find(key => key.toLowerCase().includes('width'));
    const lengthKey = Object.keys(specsByKey).find(key => key.toLowerCase().includes('length'));
    const depthKey = Object.keys(specsByKey).find(key => key.toLowerCase().includes('depth'));

    // Create combined dimensions spec
    if (widthKey || lengthKey || depthKey) {
      const dimensionsSpec = {
        values: {} as Record<string, string>,
        sort_order: Math.min(
          specsByKey[widthKey]?.sort_order || 999,
          specsByKey[lengthKey]?.sort_order || 999,
          specsByKey[depthKey]?.sort_order || 999
        ),
        generalValue: null as string | null
      };

      // Handle variant-specific dimensions
      const allVariantIds = new Set<string>();
      [widthKey, lengthKey, depthKey].forEach(key => {
        if (key && specsByKey[key]) {
          Object.keys(specsByKey[key].values).forEach(variantId => {
            allVariantIds.add(variantId);
          });
        }
      });

      // Combine dimensions for each variant
      allVariantIds.forEach(variantId => {
        const width = widthKey ? specsByKey[widthKey].values[variantId] : undefined;
        const length = lengthKey ? specsByKey[lengthKey].values[variantId] : undefined;
        const depth = depthKey ? specsByKey[depthKey].values[variantId] : undefined;
        dimensionsSpec.values[variantId] = formatDimensions(width, length, depth);
      });

      // Handle general dimensions (not tied to variants)
      const generalWidth = widthKey ? specsByKey[widthKey].generalValue : null;
      const generalLength = lengthKey ? specsByKey[lengthKey].generalValue : null;
      const generalDepth = depthKey ? specsByKey[depthKey].generalValue : null;
      
      if (generalWidth || generalLength || generalDepth) {
        dimensionsSpec.generalValue = formatDimensions(generalWidth || undefined, generalLength || undefined, generalDepth || undefined);
      }

      // Add the combined dimensions spec
      processedSpecs['Dimensions'] = dimensionsSpec;

      // Remove individual dimension specs
      [widthKey, lengthKey, depthKey].forEach(key => {
        if (key) {
          delete processedSpecs[key];
        }
      });
    }
  }

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
                        {processedSpecs[specKey].values[variant.id] || processedSpecs[specKey].generalValue || '-'}
                      </TableCell>
                    ))
                  ) : (
                    <TableCell className="text-center">
                      {processedSpecs[specKey].generalValue || '-'}
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