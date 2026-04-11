import {
  ArrowUpDown,
  Car,
  Waves,
  TreePine,
  Shield,
  LayoutDashboard,
  Sofa,
  AirVent,
  CookingPot,
  Shirt,
  Bath,
  Flame,
  Building,
  Warehouse,
  Dumbbell,
  Thermometer,
  Baby,
  ShoppingCart,
  GraduationCap,
  Heart,
  Train,
  Bus,
  Anchor,
  Mountain,
  Snowflake,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowUpDown,
  Car,
  Waves,
  TreePine,
  Trees: TreePine,
  Shield,
  LayoutDashboard,
  Sofa,
  AirVent,
  CookingPot,
  Shirt,
  Bath,
  Flame,
  Building,
  Warehouse,
  Dumbbell,
  Thermometer,
  Baby,
  ShoppingCart,
  GraduationCap,
  Heart,
  Train,
  Bus,
  Anchor,
  Mountain,
  Snowflake,
};

export function FeatureIcon({
  name,
  className = "size-4",
}: {
  name: string | null;
  className?: string;
}) {
  if (!name) return <CheckCircle className={className} />;
  const Icon = ICON_MAP[name] ?? CheckCircle;
  return <Icon className={className} />;
}
