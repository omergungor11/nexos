"use client";

import {
  Undo2,
  Redo2,
  Download,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ArrowUp,
  ArrowDown,
  Type,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onDelete: () => void;
  onAlign: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onAddText: () => void;
  onAddRect: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function EditorToolbar({
  onUndo,
  onRedo,
  onExport,
  onDelete,
  onAlign,
  onBringForward,
  onSendBackward,
  onAddText,
  onAddRect,
  canUndo,
  canRedo,
  hasSelection,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-background px-2 py-1">
      {/* Undo / Redo */}
      <ToolbarButton
        icon={Undo2}
        label="Geri Al (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ToolbarButton
        icon={Redo2}
        label="Yinele (Ctrl+Shift+Z)"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Add elements */}
      <ToolbarButton icon={Type} label="Metin Ekle" onClick={onAddText} />
      <ToolbarButton icon={Square} label="Şekil Ekle" onClick={onAddRect} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment */}
      <ToolbarButton
        icon={AlignLeft}
        label="Sola Hizala"
        onClick={() => onAlign("left")}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignCenter}
        label="Ortala (Yatay)"
        onClick={() => onAlign("center")}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignRight}
        label="Sağa Hizala"
        onClick={() => onAlign("right")}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignStartVertical}
        label="Üste Hizala"
        onClick={() => onAlign("top")}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignCenterVertical}
        label="Ortala (Dikey)"
        onClick={() => onAlign("middle")}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignEndVertical}
        label="Alta Hizala"
        onClick={() => onAlign("bottom")}
        disabled={!hasSelection}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Layer ordering */}
      <ToolbarButton
        icon={ArrowUp}
        label="Öne Getir"
        onClick={onBringForward}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={ArrowDown}
        label="Arkaya Gönder"
        onClick={onSendBackward}
        disabled={!hasSelection}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Delete */}
      <ToolbarButton
        icon={Trash2}
        label="Sil (Delete)"
        onClick={onDelete}
        disabled={!hasSelection}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      <Button size="sm" onClick={onExport} className="gap-1.5">
        <Download className="h-4 w-4" />
        PNG İndir
      </Button>
    </div>
  );
}
