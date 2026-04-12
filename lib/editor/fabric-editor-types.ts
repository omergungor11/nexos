// ---------------------------------------------------------------------------
// Fabric Editor — Type Definitions
// ---------------------------------------------------------------------------

/** Canvas dimensions and background */
export interface EditorConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

/** Roles for template objects — determines editability rules */
export type ObjectRole =
  | "background"
  | "logo"
  | "title"
  | "price"
  | "description"
  | "badge"
  | "cover"
  | "extra-image"
  | "detail"
  | "footer"
  | "decorative"
  | "custom";

/** Base properties shared by all object specs */
interface BaseObjectSpec {
  id: string;
  role: ObjectRole;
  left: number;
  top: number;
  width?: number;
  height?: number;
  angle?: number;
  opacity?: number;
  selectable?: boolean;
  evented?: boolean;
  lockMovementX?: boolean;
  lockMovementY?: boolean;
}

/** Text object spec */
export interface TextObjectSpec extends BaseObjectSpec {
  type: "textbox";
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  charSpacing?: number;
  underline?: boolean;
  letterSpacing?: number;
}

/** Image object spec */
export interface ImageObjectSpec extends BaseObjectSpec {
  type: "image";
  src: string;
  scaleX?: number;
  scaleY?: number;
  clipPath?: { type: "rect"; rx: number; ry: number };
}

/** Rectangle object spec */
export interface RectObjectSpec extends BaseObjectSpec {
  type: "rect";
  fill: string;
  rx?: number;
  ry?: number;
  stroke?: string;
  strokeWidth?: number;
}

/** Circle object spec */
export interface CircleObjectSpec extends BaseObjectSpec {
  type: "circle";
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

/** Line object spec */
export interface LineObjectSpec extends BaseObjectSpec {
  type: "line";
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

/** Gradient background spec */
export interface GradientRectSpec extends BaseObjectSpec {
  type: "gradient-rect";
  width: number;
  height: number;
  colorStops: { offset: number; color: string }[];
  direction?: "vertical" | "horizontal";
}

/** Union of all object specs */
export type EditorObjectSpec =
  | TextObjectSpec
  | ImageObjectSpec
  | RectObjectSpec
  | CircleObjectSpec
  | LineObjectSpec
  | GradientRectSpec;

/** Template definition */
export interface EditorTemplate {
  id: string;
  name: string;
  layout: string;
  config: EditorConfig;
  objects: EditorObjectSpec[];
  /** Design template color scheme */
  colors: {
    bg: string;
    cardBg: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    gradientOverlay: [string, string];
  };
}

/** Active tool in editor */
export type EditorTool = "select" | "text" | "shape" | "image";

/** Property data passed to template builders */
export interface PropertyForEditor {
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  city_name: string;
  district_name: string | null;
  cover_image: string | null;
  extra_images: string[];
}
