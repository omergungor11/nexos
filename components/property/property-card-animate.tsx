"use client";

import { motion } from "motion/react";
import { PropertyCard } from "./property-card";
import type { PropertyListItem } from "@/types";

interface Props {
  property: PropertyListItem;
  priority?: boolean;
  index?: number;
}

export function PropertyCardAnimate({ property, priority, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <PropertyCard property={property} priority={priority} />
    </motion.div>
  );
}
