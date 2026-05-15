import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OptimizedImage } from "@/components/common/OptimizedImage";

const SWIPE_THRESHOLD_PX = 40;
type GalleryMedia = { type: "image" | "video"; url: string };

const cleanImages = (images: string[] | string | undefined) => {
  if (!images) return [];

  if (Array.isArray(images)) {
    return images.map((image: string) => String(image || "").trim()).filter(Boolean);
  }

  const trimmed = String(images).trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((image: unknown) => String(image || "").trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  return trimmed
    .split(",")
    .map((image) => String(image || "").trim())
    .filter(Boolean);
};

const buildGalleryFrames = (images: string[] = [], videoUrl?: string) => {
  const uniqueImages = Array.from(new Set<string>(cleanImages(images)));
  const cleanVideoUrl = String(videoUrl || "").trim();
  const mediaItems: GalleryMedia[] = [
    ...(cleanVideoUrl ? [{ type: "video" as const, url: cleanVideoUrl }] : []),
    ...uniqueImages.map((url) => ({ type: "image" as const, url })),
  ];

  if (mediaItems.length === 0) {
    return { thumbnails: [], frames: [] };
  }

  if (mediaItems.length === 1) {
    return {
      thumbnails: mediaItems,
      frames: [mediaItems[0], mediaItems[0], mediaItems[0]],
    };
  }

  if (mediaItems.length === 2) {
    return {
      thumbnails: mediaItems,
      frames: [mediaItems[0], mediaItems[1], mediaItems[0]],
    };
  }

  return {
    thumbnails: mediaItems,
    frames: mediaItems,
  };
};

const findFirstFrameIndex = (frames: GalleryMedia[], media: GalleryMedia) => {
  const nextIndex = frames.findIndex((frame) => frame.type === media.type && frame.url === media.url);
  return nextIndex >= 0 ? nextIndex : 0;
};

export const ProductImageGallery = memo(function ProductImageGallery({
  productName,
  images,
  videoUrl,
  discountPercentage = 0,
}: {
  productName: string;
  images: string[];
  videoUrl?: string;
  discountPercentage?: number;
}) {
  const { thumbnails, frames } = useMemo(() => buildGalleryFrames(images, videoUrl), [images, videoUrl]);
  const hasMedia = frames.length > 0;
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

  const activeMedia = hasMedia ? frames[activeIndex] || frames[0] : { type: "image" as const, url: "" };
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
    (media: GalleryMedia) => {
      goToIndex(findFirstFrameIndex(frames, media));
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
      <div className="mx-auto grid w-full max-w-[42rem] gap-3 sm:gap-4 xl:max-w-none xl:grid-cols-[4.5rem_minmax(0,1fr)]">
        <div className="order-2 xl:order-1">
          <div className="flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible no-scrollbar">
            {thumbnails.length ? (
              thumbnails.map((media, index) => {
                const selected = activeMedia.type === media.type && activeMedia.url === media.url;

                return (
                  <button
                    key={`${media.type}-${media.url}-${index}`}
                    type="button"
                    onClick={() => selectThumbnail(media)}
                    className={cn(
                      "group relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-card p-1 shadow-soft transition duration-300 sm:h-20 sm:w-20 xl:h-[4.5rem] xl:w-[4.5rem]",
                      selected
                        ? "border-navy ring-2 ring-navy/10"
                        : "border-border/60 hover:-translate-y-0.5 hover:border-gold/60",
                    )}
                    aria-label={`View ${media.type} ${index + 1}`}
                    aria-pressed={selected}
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full rounded-[1rem] object-contain object-center"
                      />
                    ) : (
                      <OptimizedImage
                        src={media.url}
                        alt={`${productName} thumbnail ${index + 1}`}
                        width={160}
                        height={160}
                        sizes="5rem"
                        className="h-full w-full rounded-[1rem] object-contain object-center p-1"
                      />
                    )}
                    <span
                      className={cn(
                        "absolute inset-x-3 bottom-2 h-0.5 rounded-full transition",
                        selected ? "bg-gold" : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-beige/70 text-center text-[0.55rem] uppercase tracking-[0.16em] text-navy/40 sm:h-20 sm:w-20 sm:text-[0.65rem] sm:tracking-[0.24em]">
                Gallery unavailable
              </div>
            )}
          </div>
        </div>

        <div className="order-1 xl:order-2">
          <div className="rounded-[1.5rem] border border-border/60 bg-card p-3 shadow-luxe sm:rounded-[2rem] sm:p-4">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-beige/70">
              <button
                type="button"
                onClick={openFullscreen}
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={updateZoomOrigin}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="group product-fit-frame relative flex aspect-square w-full items-center justify-center overflow-hidden p-2 text-left sm:p-4"
                aria-label="Open product image preview"
              >
                {hasMedia && activeMedia.url ? (
                  activeMedia.type === "video" ? (
                    <video
                      src={activeMedia.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain object-center"
                    />
                  ) : (
                    <OptimizedImage
                      src={activeMedia.url}
                      alt={productName}
                      width={1100}
                      height={1100}
                      sizes="(max-width: 768px) 92vw, 55vw"
                      className={cn(
                        "h-full w-full object-contain object-center p-1 transition duration-300 ease-out sm:p-2",
                        zoomed ? "scale-[1.04]" : "scale-100",
                      )}
                      style={zoomed ? { transformOrigin: zoomOrigin } : undefined}
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-beige/80 text-sm uppercase tracking-[0.3em] text-navy/40">
                    <span className="inline-flex h-3.5 w-3.5 rounded-full bg-navy/20" />
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
                Media {Math.min(activeIndex + 1, thumbnails.length)} of {thumbnails.length}
              </p>
              <h2 className="mt-2 font-display text-3xl text-beige sm:text-4xl">{productName}</h2>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <div className="flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-8">
                {hasMedia && activeMedia.url ? (
                  activeMedia.type === "video" ? (
                    <video
                      src={activeMedia.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain object-center"
                    />
                  ) : (
                    <OptimizedImage
                      src={activeMedia.url}
                      alt={productName}
                      width={1400}
                      height={1400}
                      sizes="92vw"
                      className="h-full w-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-white/5 text-[0.8rem] uppercase tracking-[0.24em] text-beige/60">
                    <span className="inline-flex h-3.5 w-3.5 rounded-full bg-beige/40" />
                  </div>
                )}
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
              {thumbnails.length ? (
                thumbnails.map((media, index) => {
                  const selected = activeMedia.type === media.type && activeMedia.url === media.url;

                  return (
                    <button
                      key={`fullscreen-${media.type}-${media.url}-${index}`}
                      type="button"
                      onClick={() => selectThumbnail(media)}
                      className={cn(
                        "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-1 transition duration-300",
                        selected
                          ? "border-gold bg-white/10"
                          : "border-white/10 bg-white/5 hover:border-white/25",
                      )}
                      aria-label={`Fullscreen ${media.type} ${index + 1}`}
                    >
                      {media.type === "video" ? (
                        <video
                          src={media.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full rounded-[1rem] object-contain object-center"
                        />
                      ) : (
                        <OptimizedImage
                          src={media.url}
                          alt={`${productName} fullscreen thumbnail ${index + 1}`}
                          width={160}
                          height={160}
                          sizes="5rem"
                          className="h-full w-full rounded-[1rem] object-contain object-center"
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[0.65rem] uppercase tracking-[0.24em] text-beige/60">
                  Gallery unavailable
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
