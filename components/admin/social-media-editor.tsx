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
  TEMPLATES,
  LAYOUT_LABELS,
  buildPostTemplate,
  type DesignTemplate,
} from "@/lib/editor/templates/social-media-post-templates";
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

interface SocialMediaEditorProps {
  property: PropertyForEditor | null;
}

// ---------------------------------------------------------------------------
// Layout type list for grouped select
// ---------------------------------------------------------------------------

const LAYOUT_ORDER = [
  "classic",
  "fullimage",
  "showcase",
  "magazine",
  "gallery",
  "herooverlay",
  "poster",
  "catalog",
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialMediaEditor({ property }: SocialMediaEditorProps) {
  const [templateId, setTemplateId] = useState("classic-gold");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const designTemplate =
    TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  // Sync custom fields when property changes
  useEffect(() => {
    if (property) {
      setCustomTitle(property.title);
      setCustomPrice(formatPrice(property.price, property.currency));
      setCustomDesc("Detaylı bilgi için bize ulaşın.");
    }
  }, [property]);

  // Build editor template from design template + property
  const editorTemplate: EditorTemplate | null = useMemo(() => {
    if (!property) return null;
    return buildPostTemplate(
      designTemplate,
      property,
      customTitle || undefined,
      customPrice || undefined,
      customDesc || undefined
    );
  }, [designTemplate, property, customTitle, customPrice, customDesc]);

  // Handle export
  const handleExport = useCallback(
    (dataUrl: string) => {
      const link = document.createElement("a");
      link.download = `nexos-${property?.title?.replace(/\s+/g, "-").toLowerCase() ?? "post"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Görsel indirildi.");
    },
    [property]
  );

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Görsel düzenlemek için yukarıdan bir ilan seçin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Sosyal Medya Editörü (1080×1350)
        </h3>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            Açıklama
          </label>
          <Input
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            placeholder="Detaylı bilgi için bize ulaşın."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tasarım
          </label>
          <Select
            value={templateId}
            onValueChange={(v) => v && setTemplateId(v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <Palette className="size-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_ORDER.map((layout) => (
                <div key={layout}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {LAYOUT_LABELS[layout]}
                  </div>
                  {TEMPLATES.filter((t) => t.layout === layout).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-3 rounded-full border"
                          style={{ backgroundColor: t.accent }}
                        />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fabric Editor */}
      {editorTemplate && (
        <FabricEditor
          width={1080}
          height={1350}
          template={editorTemplate}
          propertyData={property}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
