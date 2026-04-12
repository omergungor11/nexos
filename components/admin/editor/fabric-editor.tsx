"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { Canvas, FabricObject, Textbox, Rect, FabricImage, Line, Circle, Gradient } from "fabric";
import { useEditorStore } from "@/store/editor-store";
import {
  ensureFonts,
  loadImageAsync,
  createRoundedRect,
  createTextBlock,
  serializeCanvas,
  deserializeCanvas,
  exportCanvasAsPNG,
  getObjectRole,
  setObjectRole,
  applyEditabilityRules,
} from "@/lib/editor/fabric-helpers";
import type {
  EditorObjectSpec,
  EditorTemplate,
  PropertyForEditor,
} from "@/lib/editor/fabric-editor-types";
import { EditorToolbar } from "./editor-toolbar";
import { EditorPropertyPanel } from "./editor-property-panel";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FabricEditorProps {
  width: number;
  height: number;
  template: EditorTemplate | null;
  propertyData: PropertyForEditor | null;
  onExport?: (dataUrl: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Hook: useFabricCanvas
// ---------------------------------------------------------------------------

function useFabricCanvas(
  canvasElRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number
) {
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: "#ffffff",
    });

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // Only re-create on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return fabricRef;
}

// ---------------------------------------------------------------------------
// Build template objects on canvas
// ---------------------------------------------------------------------------

async function renderTemplate(
  canvas: Canvas,
  template: EditorTemplate,
  property: PropertyForEditor | null
): Promise<void> {
  canvas.clear();
  canvas.backgroundColor = template.config.backgroundColor;

  await ensureFonts();

  for (const spec of template.objects) {
    const obj = await specToFabricObject(spec, property);
    if (obj) {
      // Store role metadata
      setObjectRole(obj, spec.role);
      (obj as FabricObject & { id?: string }).id = spec.id;
      applyEditabilityRules(obj);
      canvas.add(obj);
    }
  }

  canvas.renderAll();
}

async function specToFabricObject(
  spec: EditorObjectSpec,
  property: PropertyForEditor | null
): Promise<FabricObject | null> {
  const common = {
    left: spec.left,
    top: spec.top,
    angle: spec.angle ?? 0,
    opacity: spec.opacity ?? 1,
    selectable: spec.selectable ?? true,
    evented: spec.evented ?? true,
    lockMovementX: spec.lockMovementX ?? false,
    lockMovementY: spec.lockMovementY ?? false,
  };

  switch (spec.type) {
    case "textbox": {
      const tb = new Textbox(spec.text, {
        ...common,
        width: spec.width ?? 400,
        fontSize: spec.fontSize,
        fontFamily: spec.fontFamily ?? "Montserrat, system-ui, sans-serif",
        fontWeight: spec.fontWeight ?? "normal",
        fill: spec.fill,
        textAlign: spec.textAlign ?? "left",
        lineHeight: spec.lineHeight ?? 1.2,
        charSpacing: spec.charSpacing ?? 0,
        underline: spec.underline ?? false,
        editable: true,
        splitByGrapheme: false,
      });
      return tb;
    }

    case "image": {
      const img = await loadImageAsync(spec.src);
      if (!img) return null;

      img.set({
        ...common,
      });

      // Scale to desired dimensions
      if (spec.width && spec.height) {
        img.scaleToWidth(spec.width);
        const currentHeight = img.getScaledHeight();
        if (currentHeight !== spec.height) {
          img.scaleToHeight(spec.height);
        }
      } else if (spec.width) {
        img.scaleToWidth(spec.width);
      } else if (spec.height) {
        img.scaleToHeight(spec.height);
      }

      if (spec.scaleX) img.set({ scaleX: spec.scaleX });
      if (spec.scaleY) img.set({ scaleY: spec.scaleY });

      // Rounded corners clip path
      if (spec.clipPath) {
        const clipRect = new Rect({
          width: spec.width ?? img.width ?? 100,
          height: spec.height ?? img.height ?? 100,
          rx: spec.clipPath.rx,
          ry: spec.clipPath.ry,
          originX: "center",
          originY: "center",
        });
        img.set({ clipPath: clipRect });
      }

      return img;
    }

    case "rect": {
      return new Rect({
        ...common,
        width: spec.width ?? 100,
        height: spec.height ?? 100,
        fill: spec.fill,
        rx: spec.rx ?? 0,
        ry: spec.ry ?? 0,
        stroke: spec.stroke ?? undefined,
        strokeWidth: spec.strokeWidth ?? 0,
      });
    }

    case "circle": {
      return new Circle({
        ...common,
        radius: spec.radius,
        fill: spec.fill,
        stroke: spec.stroke ?? undefined,
        strokeWidth: spec.strokeWidth ?? 0,
      });
    }

    case "line": {
      return new Line([spec.left, spec.top, spec.x2, spec.y2], {
        stroke: spec.stroke,
        strokeWidth: spec.strokeWidth,
        selectable: common.selectable,
        evented: common.evented,
      });
    }

    case "gradient-rect": {
      const rect = new Rect({
        ...common,
        width: spec.width,
        height: spec.height,
      });
      const gradient = new Gradient({
        type: "linear",
        gradientUnits: "pixels",
        coords:
          spec.direction === "horizontal"
            ? { x1: 0, y1: 0, x2: spec.width, y2: 0 }
            : { x1: 0, y1: 0, x2: 0, y2: spec.height },
        colorStops: spec.colorStops.map((cs) => ({
          offset: cs.offset,
          color: cs.color,
        })),
      });
      rect.set({ fill: gradient });
      return rect;
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FabricEditor({
  width,
  height,
  template,
  propertyData,
  onExport,
  className,
}: FabricEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useFabricCanvas(canvasElRef, width, height);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [selectedProps, setSelectedProps] = useState<Record<string, unknown> | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const store = useEditorStore();

  // ---- Responsive scaling ----
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableWidth = entry.contentRect.width;
        const newScale = Math.min(1, availableWidth / width);
        setScale(newScale);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [width]);

  // ---- Load template ----
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !template) return;

    renderTemplate(canvas, template, propertyData).then(() => {
      // Push initial state to undo stack
      const json = serializeCanvas(canvas);
      store.pushHistory(json);
      setCanvasReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, propertyData]);

  // ---- Canvas events ----
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleSelectionCreated = (e: { selected: FabricObject[] }) => {
      if (e.selected.length === 1) {
        const obj = e.selected[0];
        const id = (obj as FabricObject & { id?: string }).id ?? null;
        store.selectObject(id);
        setSelectedProps(extractObjectProps(obj));
      }
    };

    const handleSelectionUpdated = (e: { selected: FabricObject[] }) => {
      if (e.selected.length === 1) {
        const obj = e.selected[0];
        const id = (obj as FabricObject & { id?: string }).id ?? null;
        store.selectObject(id);
        setSelectedProps(extractObjectProps(obj));
      }
    };

    const handleSelectionCleared = () => {
      store.selectObject(null);
      setSelectedProps(null);
    };

    const handleObjectModified = () => {
      const json = serializeCanvas(canvas);
      store.pushHistory(json);

      // Update selected props
      const active = canvas.getActiveObject();
      if (active) {
        setSelectedProps(extractObjectProps(active));
      }
    };

    canvas.on("selection:created", handleSelectionCreated as never);
    canvas.on("selection:updated", handleSelectionUpdated as never);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:modified", handleObjectModified);

    return () => {
      canvas.off("selection:created", handleSelectionCreated as never);
      canvas.off("selection:updated", handleSelectionUpdated as never);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("object:modified", handleObjectModified);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        const active = canvas.getActiveObject();
        if (active && active.selectable) {
          const role = getObjectRole(active);
          if (role !== "background" && role !== "logo") {
            canvas.remove(active);
            canvas.discardActiveObject();
            store.pushHistory(serializeCanvas(canvas));
          }
        }
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl/Cmd + Shift + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  // ---- Actions ----
  const handleUndo = useCallback(() => {
    const json = store.undo();
    const canvas = fabricRef.current;
    if (json && canvas) {
      deserializeCanvas(canvas, json);
    }
  }, [store]);

  const handleRedo = useCallback(() => {
    const json = store.redo();
    const canvas = fabricRef.current;
    if (json && canvas) {
      deserializeCanvas(canvas, json);
    }
  }, [store]);

  const handleExport = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Deselect before export
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = exportCanvasAsPNG(canvas);
    onExport?.(dataUrl);
  }, [onExport]);

  const handleDeleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.selectable) {
      const role = getObjectRole(active);
      if (role !== "background" && role !== "logo") {
        canvas.remove(active);
        canvas.discardActiveObject();
        store.pushHistory(serializeCanvas(canvas));
      }
    }
  }, [store]);

  const handleAlignObject = useCallback(
    (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      switch (alignment) {
        case "left":
          active.set({ left: 0 });
          break;
        case "center":
          active.set({ left: (width - (active.getScaledWidth?.() ?? 0)) / 2 });
          break;
        case "right":
          active.set({ left: width - (active.getScaledWidth?.() ?? 0) });
          break;
        case "top":
          active.set({ top: 0 });
          break;
        case "middle":
          active.set({ top: (height - (active.getScaledHeight?.() ?? 0)) / 2 });
          break;
        case "bottom":
          active.set({ top: height - (active.getScaledHeight?.() ?? 0) });
          break;
      }
      canvas.renderAll();
      store.pushHistory(serializeCanvas(canvas));
    },
    [width, height, store]
  );

  const handleBringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      store.pushHistory(serializeCanvas(canvas));
    }
  }, [store]);

  const handleSendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      store.pushHistory(serializeCanvas(canvas));
    }
  }, [store]);

  const handleAddText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = createTextBlock({
      text: "Metin ekle",
      left: width / 2 - 100,
      top: height / 2 - 20,
      width: 200,
      fontSize: 32,
      fill: "#000000",
      fontWeight: "600",
      textAlign: "center",
      selectable: true,
      editable: true,
    });
    setObjectRole(text, "custom");
    (text as FabricObject & { id?: string }).id = `custom-text-${Date.now()}`;
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    store.pushHistory(serializeCanvas(canvas));
  }, [width, height, store]);

  const handleAddRect = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = createRoundedRect({
      left: width / 2 - 50,
      top: height / 2 - 50,
      width: 100,
      height: 100,
      fill: "rgba(255, 202, 62, 0.8)",
      rx: 8,
      ry: 8,
      selectable: true,
      evented: true,
    });
    setObjectRole(rect, "custom");
    (rect as FabricObject & { id?: string }).id = `custom-rect-${Date.now()}`;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    store.pushHistory(serializeCanvas(canvas));
  }, [width, height, store]);

  const handlePropertyChange = useCallback(
    (key: string, value: unknown) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      active.set({ [key]: value } as Partial<FabricObject>);
      canvas.renderAll();
      setSelectedProps(extractObjectProps(active));
    },
    []
  );

  const handlePropertyCommit = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    store.pushHistory(serializeCanvas(canvas));
  }, [store]);

  // ---- Render ----
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      {/* Toolbar */}
      <EditorToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onDelete={handleDeleteSelected}
        onAlign={handleAlignObject}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onAddText={handleAddText}
        onAddRect={handleAddRect}
        canUndo={store.undoStack.length > 1}
        canRedo={store.redoStack.length > 0}
        hasSelection={store.selectedObjectId !== null}
      />

      <div className="flex gap-3">
        {/* Canvas container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden rounded-lg border bg-muted/30"
        >
          <div
            style={{
              width: width * scale,
              height: height * scale,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width,
                height,
              }}
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>
        </div>

        {/* Property Panel */}
        {selectedProps && (
          <EditorPropertyPanel
            objectProps={selectedProps}
            onChange={handlePropertyChange}
            onCommit={handlePropertyCommit}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractObjectProps(obj: FabricObject): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: obj.type,
    left: Math.round(obj.left ?? 0),
    top: Math.round(obj.top ?? 0),
    width: Math.round(obj.getScaledWidth?.() ?? 0),
    height: Math.round(obj.getScaledHeight?.() ?? 0),
    angle: Math.round(obj.angle ?? 0),
    opacity: obj.opacity ?? 1,
    role: getObjectRole(obj),
  };

  if (obj instanceof Textbox) {
    base.text = obj.text;
    base.fontSize = obj.fontSize;
    base.fontFamily = obj.fontFamily;
    base.fontWeight = obj.fontWeight;
    base.fill = obj.fill;
    base.textAlign = obj.textAlign;
    base.lineHeight = obj.lineHeight;
  }

  if (obj instanceof Rect) {
    base.fill = obj.fill;
    base.rx = (obj as Rect & { rx?: number }).rx ?? 0;
    base.ry = (obj as Rect & { ry?: number }).ry ?? 0;
    base.stroke = obj.stroke;
    base.strokeWidth = obj.strokeWidth;
  }

  if (obj instanceof FabricImage) {
    base.scaleX = obj.scaleX;
    base.scaleY = obj.scaleY;
  }

  return base;
}
