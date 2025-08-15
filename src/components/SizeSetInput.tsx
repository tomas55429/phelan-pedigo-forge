import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface SizeSet {
  id?: string;
  width: string;
  length: string;
  depth: string;
  height: string;
  set_index: number;
}

interface ProductVariant {
  id: string;
  variant_name: string;
}

interface SizeSetInputProps {
  productId: string;
  variants?: ProductVariant[];
  onSizeSetsChange?: (sizeSets: SizeSet[]) => void;
}

interface SortableSizeSetProps {
  sizeSet: SizeSet;
  index: number;
  onUpdate: (index: number, field: keyof SizeSet, value: string) => void;
  onRemove: (index: number) => void;
}

const SortableSizeSet: React.FC<SortableSizeSetProps> = ({
  sizeSet,
  index,
  onUpdate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `size-set-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border border-border rounded-lg bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
        <div>
          <Label htmlFor={`width-${index}`} className="text-xs">Width</Label>
          <Input
            id={`width-${index}`}
            value={sizeSet.width}
            onChange={(e) => onUpdate(index, 'width', e.target.value)}
            placeholder="e.g., 24, 24½"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`length-${index}`} className="text-xs">Length</Label>
          <Input
            id={`length-${index}`}
            value={sizeSet.length}
            onChange={(e) => onUpdate(index, 'length', e.target.value)}
            placeholder="e.g., 36, 36¼"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`depth-${index}`} className="text-xs">Depth</Label>
          <Input
            id={`depth-${index}`}
            value={sizeSet.depth}
            onChange={(e) => onUpdate(index, 'depth', e.target.value)}
            placeholder="e.g., 12, 12⅝"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`height-${index}`} className="text-xs">Height</Label>
          <Input
            id={`height-${index}`}
            value={sizeSet.height}
            onChange={(e) => onUpdate(index, 'height', e.target.value)}
            placeholder="e.g., 8, 8½"
            className="h-8"
          />
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const SizeSetInput: React.FC<SizeSetInputProps> = ({
  productId,
  variants,
  onSizeSetsChange,
}) => {
  const [sizeSets, setSizeSets] = useState<SizeSet[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSizeSets();
  }, [productId, selectedVariantId]);

  const fetchSizeSets = async () => {
    try {
      let query = supabase
        .from('product_size_sets')
        .select('*')
        .eq('product_id', productId)
        .order('set_index');

      if (selectedVariantId) {
        query = query.eq('variant_id', selectedVariantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSizeSets(data || []);
    } catch (error) {
      console.error('Error fetching size sets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch size sets",
        variant: "destructive",
      });
    }
  };

  const addSizeSet = () => {
    const newSizeSet: SizeSet = {
      width: '',
      length: '',
      depth: '',
      height: '',
      set_index: sizeSets.length,
    };
    setSizeSets([...sizeSets, newSizeSet]);
  };

  const updateSizeSet = (index: number, field: keyof SizeSet, value: string) => {
    const updated = [...sizeSets];
    updated[index] = { ...updated[index], [field]: value };
    setSizeSets(updated);
  };

  const removeSizeSet = async (index: number) => {
    const sizeSet = sizeSets[index];
    if (sizeSet.id) {
      try {
        const { error } = await supabase
          .from('product_size_sets')
          .delete()
          .eq('id', sizeSet.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting size set:', error);
        toast({
          title: "Error",
          description: "Failed to delete size set",
          variant: "destructive",
        });
        return;
      }
    }

    const updated = sizeSets.filter((_, i) => i !== index);
    setSizeSets(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSizeSets((items) => {
        const oldIndex = items.findIndex((_, i) => `size-set-${i}` === active.id);
        const newIndex = items.findIndex((_, i) => `size-set-${i}` === over?.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({
          ...item,
          set_index: index,
        }));
      });
    }
  };

  const saveSizeSets = async () => {
    try {
      // Delete existing size sets for this product/variant
      let deleteQuery = supabase
        .from('product_size_sets')
        .delete()
        .eq('product_id', productId);

      if (selectedVariantId) {
        deleteQuery = deleteQuery.eq('variant_id', selectedVariantId);
      } else {
        deleteQuery = deleteQuery.is('variant_id', null);
      }

      const { error: deleteError } = await deleteQuery;
      if (deleteError) throw deleteError;

      // Insert new size sets
      if (sizeSets.length > 0) {
        const sizeSetData = sizeSets
          .filter(set => set.width || set.length || set.depth || set.height)
          .map((set, index) => ({
            product_id: productId,
            variant_id: selectedVariantId,
            set_index: index,
            width: set.width || null,
            length: set.length || null,
            depth: set.depth || null,
            height: set.height || null,
          }));

        if (sizeSetData.length > 0) {
          const { error: insertError } = await supabase
            .from('product_size_sets')
            .insert(sizeSetData);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Success",
        description: "Size sets saved successfully",
      });

      onSizeSetsChange?.(sizeSets);
      fetchSizeSets();
    } catch (error) {
      console.error('Error saving size sets:', error);
      toast({
        title: "Error",
        description: "Failed to save size sets",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Size Sets
          <div className="flex gap-2">
            <Button onClick={addSizeSet} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Size Set
            </Button>
            <Button onClick={saveSizeSets} size="sm" variant="default">
              Save Changes
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants && variants.length > 0 && (
          <div>
            <Label>Select Variant (optional)</Label>
            <select
              value={selectedVariantId || ''}
              onChange={(e) => setSelectedVariantId(e.target.value || null)}
              className="w-full mt-1 p-2 border border-border rounded-md bg-background"
            >
              <option value="">General Product Sizes</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.variant_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sizeSets.map((_, index) => `size-set-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sizeSets.map((sizeSet, index) => (
                <SortableSizeSet
                  key={`size-set-${index}`}
                  sizeSet={sizeSet}
                  index={index}
                  onUpdate={updateSizeSet}
                  onRemove={removeSizeSet}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sizeSets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No size sets added yet. Click "Add Size Set" to get started.
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Use fractions like ½, ¼, ¾, ⅛, ⅜, ⅝, ⅞ for precise measurements.
        </div>
      </CardContent>
    </Card>
  );
};