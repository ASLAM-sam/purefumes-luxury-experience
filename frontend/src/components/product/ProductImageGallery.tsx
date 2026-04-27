import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SWIPE_THRESHOLD_PX = 40;

const cleanImages = (images: string[]) => images.map((image) => image.trim()).filter(Boolean);

const buildGalleryFrames = (images: string[]) => {
  const uniqueImages = [...new Set(cleanImages(images))];

  if (uniqueImages.length === 0) {
    return { thumbnails: [""], frames: [""] };
  }

  if (uniqueImages.length === 1) {
    return {
      thumbnails: uniqueImages,
      frames: [uniqueImages[0], uniqueImages[0], uniqueImages[0]],
    };
  }

  if (uniqueImages.length === 2) {
    return {
      thumbnails: uniqueImages,
      frames: [uniqueImages[0], uniqueImages[1], uniqueImages[0]],
    };
  }

  return {
    thumbnails: uniqueImages,
    frames: uniqueImages,
  };
};

const findFirstFrameIndex = (frames: string[], image: string) => {
  const nextIndex = frames.findIndex((frame) => frame === image);
  return nextIndex >= 0 ? nextIndex : 0;
};

export const ProductImageGallery = memo(function ProductImageGallery({
  productName,
  images,
  discountPercentage = 0,
}: {
  productName: string;
  images: string[];
  discountPercentage?: number;
}) {
  const { thumbnails, frames } = useMemo(() => buildGalleryFrames(images), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);

  useEffect(() => {
    setActiveIndex(0);
    setZoomed(false);
    setZoomOrigin("50% 50%");
  }, [frames]);

  const activeImage = frames[activeIndex] || frames[0] || "";
  const showControls = thumbnails.length > 1;

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (!frames.length) return;

      const safeIndex = (nextIndex + frames.length) % frames.length;
      setActiveIndex(safeIndex);
    },
    [frames.length],
  );

  const goPrevious = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const goNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const selectThumbnail = useCallback(
    (image: string) => {
      goToIndex(findFirstFrameIndex(frames, image));
    },
    [frames, goToIndex],
  );

  const updateZoomOrigin = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomOrigin(`${Math.min(Math.max(x, 0), 100)}% ${Math.min(Math.max(y, 0), 100)}%`);
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLButtonElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    swipedRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLButtonElement>) => {
      const startX = touchStartXRef.current;
      const endX = event.changedTouches[0]?.clientX ?? null;

      touchStartXRef.current = null;

      if (startX === null || endX === null) {
        return;
      }

      const delta = endX - startX;

      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
        return;
      }

      swipedRef.current = true;

      if (delta < 0) {
        goNext();
      } else {
        goPrevious();
      }
    },
    [goNext, goPrevious],
  );

  const openFullscreen = useCallback(() => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }

    setFullscreenOpen(true);
  }, []);

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[5.25rem_minmax(0,1fr)]">
        <div className="order-2 xl:order-1">
          <div className="flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible no-scrollbar">
            {thumbnails.map((image, index) => {
              const selected = activeImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => selectThumbnail(image)}
                  className={cn(
                    "group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-card p-1 shadow-soft transition duration-300",
                    selected
                      ? "border-navy ring-2 ring-navy/10"
                      : "border-border/60 hover:-translate-y-0.5 hover:border-gold/60",
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={selected}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${productName} thumbnail ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full rounded-[1rem] object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-beige/70 text-[0.55rem] uppercase tracking-[0.22em] text-navy/40">
                      No image
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-2 h-0.5 rounded-full transition",
                      selected ? "bg-gold" : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="order-1 xl:order-2">
          <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-luxe sm:p-6">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-beige/70">
              <button
                type="button"
                onClick={openFullscreen}
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={updateZoomOrigin}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(241,236,230,0.85)_58%,_rgba(234,223,210,0.95))] p-5 text-left sm:aspect-square sm:p-8"
                aria-label="Open product image preview"
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={productName}
                    loading="eager"
                    className={cn(
                      "h-full w-full object-contain transition duration-300 ease-out",
                      zoomed ? "scale-[1.85]" : "scale-100",
                    )}
                    style={zoomed ? { transformOrigin: zoomOrigin } : undefined}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] border border-dashed border-navy/20 text-sm uppercase tracking-[0.3em] text-navy/40">
                    Image unavailable
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy/10 via-transparent to-transparent" />

                {discountPercentage > 0 ? (
                  <div className="absolute left-4 top-4 rounded-full bg-navy px-4 py-2 text-[0.65rem] uppercase tracking-[0.26em] text-beige shadow-soft">
                    {discountPercentage}% off
                  </div>
                ) : null}

                <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy shadow-soft backdrop-blur">
                  <Expand className="h-3.5 w-3.5" />
                  Preview
                </div>

                <div className="absolute bottom-4 left-4 hidden items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy shadow-soft backdrop-blur md:inline-flex">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Hover to zoom
                </div>
              </button>

              {showControls ? (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-navy shadow-soft transition hover:scale-105 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-navy shadow-soft transition hover:scale-105 hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <div className="absolute bottom-4 right-4 rounded-full bg-navy/90 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-beige shadow-soft">
                {Math.min(activeIndex + 1, thumbnails.length)} / {thumbnails.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="left-0 top-0 h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-[#071c36]/98 p-4 text-beige shadow-none sm:p-6 [&>button]:right-4 [&>button]:top-4 [&>button]:text-beige [&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:hover:text-white">
          <div className="flex h-full flex-col gap-4 pt-8">
            <div className="pr-12">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-beige/60">
                Image {Math.min(activeIndex + 1, thumbnails.length)} of {thumbnails.length}
              </p>
              <h2 className="mt-2 font-display text-3xl text-beige sm:text-4xl">{productName}</h2>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <div className="flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-8">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={productName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>

              {showControls ? (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-beige shadow-soft transition hover:bg-white/20 sm:left-4"
                    aria-label="Previous fullscreen image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-beige shadow-soft transition hover:bg-white/20 sm:right-4"
                    aria-label="Next fullscreen image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {thumbnails.map((image, index) => {
                const selected = activeImage === image;

                return (
                  <button
                    key={`fullscreen-${image}-${index}`}
                    type="button"
                    onClick={() => selectThumbnail(image)}
                    className={cn(
                      "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-1 transition duration-300",
                      selected
                        ? "border-gold bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/25",
                    )}
                    aria-label={`Fullscreen image ${index + 1}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${productName} fullscreen thumbnail ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full rounded-[1rem] object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-white/10 text-[0.55rem] uppercase tracking-[0.22em] text-beige/45">
                        No image
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
