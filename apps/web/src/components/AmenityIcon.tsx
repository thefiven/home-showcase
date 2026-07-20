"use client";

import {
  AirVent,
  Baby,
  Bath,
  Bed,
  Camera,
  Car,
  Check,
  CigaretteOff,
  Coffee,
  Dumbbell,
  Fan,
  Flame,
  Key,
  type LucideIcon,
  Microwave,
  Mountain,
  ParkingCircle,
  PawPrint,
  Refrigerator,
  ShieldCheck,
  Snowflake,
  Sun,
  Trees,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
} from "lucide-react";

interface AmenityIconProps {
  name?: string | null;
}

const ICON_CLASS = "size-4 shrink-0 text-gorse";

// Icon allowlist (named, tree-shakeable imports) rather than
// lucide-react/dynamic: DynamicIcon forces the bundler to analyze the ~2000
// dynamic imports of the library as soon as this component is reachable
// from a route, which made the dev compile of /property
// pathological (issue #60). The `icon` field in the CMS remains free text;
// a name outside the list simply falls back to Check.
const ICONS_BY_NAME: Record<string, LucideIcon> = {
  wifi: Wifi,
  "parking-circle": ParkingCircle,
  waves: Waves,
  "utensils-crossed": UtensilsCrossed,
  "paw-print": PawPrint,
  "air-vent": AirVent,
  snowflake: Snowflake,
  flame: Flame,
  tv: Tv,
  "washing-machine": WashingMachine,
  fan: Fan,
  coffee: Coffee,
  bath: Bath,
  bed: Bed,
  car: Car,
  sun: Sun,
  trees: Trees,
  mountain: Mountain,
  dumbbell: Dumbbell,
  key: Key,
  camera: Camera,
  baby: Baby,
  "cigarette-off": CigaretteOff,
  "shield-check": ShieldCheck,
  microwave: Microwave,
  refrigerator: Refrigerator,
};

export function AmenityIcon({ name }: AmenityIconProps) {
  const Icon = (name && ICONS_BY_NAME[name]) || Check;
  return <Icon className={ICON_CLASS} aria-hidden />;
}
