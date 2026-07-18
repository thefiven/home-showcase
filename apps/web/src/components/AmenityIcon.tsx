"use client";

import { Check } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface AmenityIconProps {
  name?: string | null;
}

const ICON_CLASS = "size-4 shrink-0 text-gorse";

export function AmenityIcon({ name }: AmenityIconProps) {
  if (!name) return <Check className={ICON_CLASS} aria-hidden />;

  return (
    <DynamicIcon
      name={name as IconName}
      className={ICON_CLASS}
      aria-hidden
      fallback={() => <Check className={ICON_CLASS} aria-hidden />}
    />
  );
}
