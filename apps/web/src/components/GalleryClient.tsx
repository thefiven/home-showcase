"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { nextPhotoIndex, prevPhotoIndex } from "@/lib/gallery";

const TILE_CLASS = "relative overflow-hidden bg-surface";

export interface ResolvedPhoto {
  id: number;
  src: string;
  alt: string;
}

function Lightbox({
  photos,
  openIndex,
  dictionary,
  onClose,
  onIndexChange,
}: {
  photos: ResolvedPhoto[];
  openIndex: number;
  dictionary: Dictionary;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const photo = photos[openIndex];
  const goNext = () => {
    setZoomed(false);
    onIndexChange(nextPhotoIndex(openIndex, photos.length));
  };
  const goPrev = () => {
    setZoomed(false);
    onIndexChange(prevPhotoIndex(openIndex, photos.length));
  };

  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        goNext();
      } else if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, photos.length]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dictionary.gallery.openAt
        .replace("{index}", String(openIndex + 1))
        .replace("{total}", String(photos.length))}
      className="fixed inset-0 z-50 flex flex-col bg-[color-mix(in_srgb,var(--color-surface-dark)_96%,black)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-[var(--pad-nav-x)] py-14 text-foreground-on-dark">
        <span className="font-mono text-[13px]">
          {dictionary.gallery.counter
            .replace("{current}", String(openIndex + 1))
            .replace("{total}", String(photos.length))}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label={dictionary.gallery.close}
          className="rounded-flat p-4 hover:bg-[color-mix(in_srgb,var(--color-foreground-on-dark)_15%,transparent)]"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-[var(--pad-nav-x)] pb-24">
        {photos.length > 1 && (
          <button
            type="button"
            aria-label={dictionary.gallery.previous}
            className="absolute left-[clamp(8px,3vw,32px)] z-10 rounded-flat p-6 text-foreground-on-dark hover:bg-[color-mix(in_srgb,var(--color-foreground-on-dark)_15%,transparent)]"
            onClick={goPrev}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        )}

        <div
          className={`relative h-full w-full ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setZoomed((value) => !value)}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            className={zoomed ? "object-contain scale-150" : "object-contain"}
          />
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            aria-label={dictionary.gallery.next}
            className="absolute right-[clamp(8px,3vw,32px)] z-10 rounded-flat p-6 text-foreground-on-dark hover:bg-[color-mix(in_srgb,var(--color-foreground-on-dark)_15%,transparent)]"
            onClick={goNext}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          aria-label={zoomed ? dictionary.gallery.zoomOut : dictionary.gallery.zoomIn}
          className="absolute bottom-24 right-[clamp(8px,3vw,32px)] z-10 rounded-flat p-6 text-foreground-on-dark hover:bg-[color-mix(in_srgb,var(--color-foreground-on-dark)_15%,transparent)]"
          onClick={(event) => {
            event.stopPropagation();
            setZoomed((value) => !value);
          }}
        >
          {zoomed ? <ZoomOut aria-hidden="true" /> : <ZoomIn aria-hidden="true" />}
        </button>
      </div>

      {photo.alt && (
        <p className="px-[var(--pad-nav-x)] pb-16 text-center text-[13px] text-[color-mix(in_srgb,var(--color-foreground-on-dark)_75%,transparent)]">
          {photo.alt}
        </p>
      )}
    </div>
  );
}

/**
 * Aperçu grille (héro 2×2 + petites tuiles) et lightbox. Reçoit uniquement
 * des URLs déjà résolues côté serveur par `PropertyGallery` — ne doit jamais
 * appeler `mediaUrl` lui-même (voir commentaire de `PropertyGallery.tsx`).
 */
export function GalleryClient({
  cover,
  tiles,
  allPhotos,
  hiddenCount,
  dictionary,
}: {
  cover: ResolvedPhoto;
  tiles: ResolvedPhoto[];
  allPhotos: ResolvedPhoto[];
  hiddenCount: number;
  dictionary: Dictionary;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lastTileIndex = tiles.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 [grid-auto-rows:220px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <button
          type="button"
          className={`${TILE_CLASS} col-span-2 row-span-2`}
          aria-label={dictionary.gallery.openAt
            .replace("{index}", "1")
            .replace("{total}", String(allPhotos.length))}
          onClick={() => setOpenIndex(0)}
        >
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </button>

        {tiles.map((photo, index) => {
          const photoIndex = index + 1;
          const isLastVisible = index === lastTileIndex && hiddenCount > 0;

          return (
            <button
              key={photo.id}
              type="button"
              className={TILE_CLASS}
              aria-label={
                isLastVisible
                  ? dictionary.gallery.viewAll
                  : dictionary.gallery.openAt
                      .replace("{index}", String(photoIndex + 1))
                      .replace("{total}", String(allPhotos.length))
              }
              onClick={() => setOpenIndex(photoIndex)}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="260px" className="object-cover" />
              {isLastVisible && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[color-mix(in_srgb,var(--color-surface-dark)_55%,transparent)] font-medium text-foreground-on-dark">
                  <Images aria-hidden="true" />
                  {dictionary.gallery.viewAll}
                  <span className="font-mono text-[13px]">+{hiddenCount}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={allPhotos}
          openIndex={openIndex}
          dictionary={dictionary}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </div>
  );
}
