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

// Liste blanche d'icônes (imports nommés, tree-shakeable) plutôt que
// lucide-react/dynamic : DynamicIcon force le bundler à analyser les ~2000
// imports dynamiques de la librairie dès que ce composant est atteignable
// par une route, ce qui rendait la compilation dev de /property
// pathologique (issue #60). Le champ `icon` en CMS reste du texte libre ;
// un nom hors liste retombe simplement sur Check.
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
