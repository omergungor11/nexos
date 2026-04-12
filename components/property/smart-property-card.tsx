"use client";

import { useAnimateUI } from "@/components/shared/animate-context";
import { PropertyCard } from "./property-card";
import { PropertyCardAnimate } from "./property-card-animate";
import type { PropertyListItem } from "@/types";

interface Props {
  property: PropertyListItem;
  priority?: boolean;
  index?: number;
}

export function SmartPropertyCard({ property, priority, index = 0 }: Props) {
  const animateUI = useAnimateUI();

  if (animateUI) {
    return <PropertyCardAnimate property={property} priority={priority} index={index} />;
  }

  return <PropertyCard property={property} priority={priority} />;
}
