"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ImageIcon, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  STORY_TEMPLATES,
  buildStoryTemplate,
  type StoryTemplateId,
} from "@/lib/editor/templates/story-templates";
import { formatPrice } from "@/lib/editor/fabric-helpers";
import type {
  EditorTemplate,
  PropertyForEditor,
} from "@/lib/editor/fabric-editor-types";

// Dynamic import of FabricEditor (no SSR)
const FabricEditor = dynamic(
  () =>
    import("@/components/admin/editor/fabric-editor").then(
      (m) => m.FabricEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-32">
        <p className="text-sm text-muted-foreground">Editör yükleniyor...</p>
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoryEditorProps {
  property: PropertyForEditor | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryEditor({ property }: StoryEditorProps) {
  const [templateId, setTemplateId] = useState<StoryTemplateId>("klasik");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Sync custom fields when property changes
  useEffect(() => {
    if (property) {
      setCustomTitle(property.title);
      setCustomPrice(formatPrice(property.price, property.currency));
    }
  }, [property]);

  // Build editor template
  const editorTemplate: EditorTemplate | null = useMemo(() => {
    if (!property) return null;
    return buildStoryTemplate(
      templateId,
      property,
      customTitle || undefined,
      customPrice || undefined
    );
  }, [templateId, property, customTitle, customPrice]);

  // Handle export
  const handleExport = useCallback(
    (dataUrl: string) => {
      const link = document.createElement("a");
      link.download = `nexos-story-${property?.title?.replace(/\s+/g, "-").toLowerCase() ?? "story"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Story görseli indirildi.");
    },
    [property]
  );

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Story oluşturmak için yukarıdan bir ilan seçin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Story Editörü (1080×1920)
        </h3>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Başlık
          </label>
          <Input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="İlan başlığı"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Fiyat
          </label>
          <Input
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="£285,000"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Şablon
          </label>
          <Select
            value={templateId}
            onValueChange={(v) => v && setTemplateId(v as StoryTemplateId)}
          >
            <SelectTrigger className="h-8 text-sm">
              <Palette className="size-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORY_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fabric Editor */}
      {editorTemplate && (
        <FabricEditor
          width={1080}
          height={1920}
          template={editorTemplate}
          propertyData={property}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
