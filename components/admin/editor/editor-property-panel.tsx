"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorPropertyPanelProps {
  objectProps: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onCommit: () => void;
}

export function EditorPropertyPanel({
  objectProps,
  onChange,
  onCommit,
}: EditorPropertyPanelProps) {
  const type = objectProps.type as string;
  const role = objectProps.role as string | undefined;
  const isLocked = role === "background" || role === "logo";

  if (isLocked) return null;

  return (
    <div className="w-56 shrink-0 space-y-4 rounded-lg border bg-background p-3 text-sm">
      <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
        {type === "textbox"
          ? "Metin"
          : type === "image"
            ? "Görsel"
            : "Şekil"}
      </h3>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-xs text-muted-foreground">X</span>
          <Input
            type="number"
            className="h-7 text-xs"
            value={objectProps.left as number}
            onChange={(e) => onChange("left", Number(e.target.value))}
            onBlur={onCommit}
          />
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Y</span>
          <Input
            type="number"
            className="h-7 text-xs"
            value={objectProps.top as number}
            onChange={(e) => onChange("top", Number(e.target.value))}
            onBlur={onCommit}
          />
        </div>
      </div>

      {/* Rotation */}
      <div>
        <span className="text-xs text-muted-foreground">Rotasyon</span>
        <Input
          type="number"
          className="h-7 text-xs"
          value={objectProps.angle as number}
          onChange={(e) => onChange("angle", Number(e.target.value))}
          onBlur={onCommit}
          min={0}
          max={360}
        />
      </div>

      {/* Opacity */}
      <div>
        <span className="text-xs text-muted-foreground">
          Opaklık: {Math.round((objectProps.opacity as number) * 100)}%
        </span>
        <Slider
          value={[(objectProps.opacity as number) * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v: number | readonly number[]) => {
            const val = Array.isArray(v) ? v[0] : v;
            onChange("opacity", val / 100);
          }}
          onValueCommitted={onCommit}
          className="mt-1"
        />
      </div>

      {/* Text-specific controls */}
      {type === "textbox" && (
        <>
          <div>
            <span className="text-xs text-muted-foreground">Yazı Boyutu</span>
            <Input
              type="number"
              className="h-7 text-xs"
              value={objectProps.fontSize as number}
              onChange={(e) => onChange("fontSize", Number(e.target.value))}
              onBlur={onCommit}
              min={8}
              max={200}
            />
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Yazı Tipi</span>
            <Select
              value={(objectProps.fontFamily as string)?.split(",")[0]?.trim() ?? "Montserrat"}
              onValueChange={(v) => {
                onChange("fontFamily", `${v}, system-ui, sans-serif`);
                onCommit();
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Kalınlık</span>
            <Select
              value={String(objectProps.fontWeight ?? "normal")}
              onValueChange={(v) => {
                onChange("fontWeight", v);
                onCommit();
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">SemiBold (600)</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Hizalama</span>
            <div className="flex gap-1 mt-1">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  variant={objectProps.textAlign === align ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    onChange("textAlign", align);
                    onCommit();
                  }}
                >
                  {align === "left" && <AlignLeft className="h-3.5 w-3.5" />}
                  {align === "center" && <AlignCenter className="h-3.5 w-3.5" />}
                  {align === "right" && <AlignRight className="h-3.5 w-3.5" />}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Renk</span>
            <Input
              type="color"
              className="h-7 w-full cursor-pointer"
              value={(objectProps.fill as string) ?? "#000000"}
              onChange={(e) => onChange("fill", e.target.value)}
              onBlur={onCommit}
            />
          </div>

          <div>
            <span className="text-xs text-muted-foreground">
              Satır Yüksekliği: {(objectProps.lineHeight as number)?.toFixed(1)}
            </span>
            <Slider
              value={[(objectProps.lineHeight as number) * 10]}
              min={8}
              max={30}
              step={1}
              onValueChange={(v: number | readonly number[]) => {
                const val = Array.isArray(v) ? v[0] : v;
                onChange("lineHeight", val / 10);
              }}
              onValueCommitted={onCommit}
              className="mt-1"
            />
          </div>
        </>
      )}

      {/* Rect-specific controls */}
      {type === "rect" && (
        <>
          <div>
            <span className="text-xs text-muted-foreground">Dolgu Rengi</span>
            <Input
              type="color"
              className="h-7 w-full cursor-pointer"
              value={
                typeof objectProps.fill === "string"
                  ? objectProps.fill
                  : "#ffffff"
              }
              onChange={(e) => onChange("fill", e.target.value)}
              onBlur={onCommit}
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Köşe Yarıçapı</span>
            <Input
              type="number"
              className="h-7 text-xs"
              value={(objectProps.rx as number) ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange("rx", v);
                onChange("ry", v);
              }}
              onBlur={onCommit}
              min={0}
              max={100}
            />
          </div>
        </>
      )}
    </div>
  );
}
