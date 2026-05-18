import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { bannersApi, type Banner } from "@/services/api";
import { useAdaptiveLoadingStrategy } from "@/lib/performance/loading-strategy";

const AUTOPLAY_MS = 5000;

const getBannerHref = (banner: Banner | null) =>
  banner?.link?.trim() || "/brands";

const isExternalHref = (href: string) =>
  /^https?:\/\//i.test(href);

export const HeroSlider = memo(function HeroSlider({
  id,
}: {
  id?: string;
}) {
  const loadingStrategy = useAdaptiveLoadingStrategy();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBanners = async () => {
      try {
        const nextBanners = await bannersApi.listActive();

        if (!active) return;

        setBanners(nextBanners);
      } catch {
        if (!active) return;

        setBanners([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadBanners();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || loadingStrategy.reduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [banners.length, loadingStrategy.reduceMotion]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div
        id={id}
        className="relative w-full animate-pulse overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] bg-[#ece3d7] aspect-[16/10] sm:aspect-[16/9]"
      />
    );
  }

  if (banners.length === 0) {
    return (
      <div
        id={id}
        className="flex w-full items-center justify-center rounded-[clamp(1.5rem,3vw,2.5rem)] bg-[#ece3d7] aspect-[16/10] px-6 text-center sm:aspect-[16/9]"
      >
        <div className="text-center">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.75rem)] text-[#7a5645]">
            No Active Banners
          </h2>

          <p className="mt-3 fluid-body-sm text-[#7f7267]">
            Add hero banners from admin panel
          </p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex] ?? banners[0];

  const href = getBannerHref(currentBanner);

  const external = isExternalHref(href);

  return (
    <div
      id={id}
      className="group relative w-full overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] shadow-[0_40px_90px_rgba(0,0,0,0.18)] aspect-[16/10] sm:aspect-[16/9]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id || `${currentIndex}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0"
        >
          {/* IMAGE */}
          <OptimizedImage
            src={currentBanner.image}
            alt={currentBanner.title || "Luxury Banner"}
            width={1600}
            height={1000}
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            wrapperClassName="h-full w-full"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-[2200ms]
              ease-out
              will-change-transform
              group-hover:scale-[1.08]
            "
          />

          {/* OVERLAY */}
          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(110deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_45%,rgba(0,0,0,0.06)_100%)]
            "
          />

          {/* GOLD LIGHT */}
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_34%)]
            "
          />

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-end p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.12,
              }}
              className="max-w-[34rem]"
            >
              <p className="fluid-eyebrow uppercase text-[#d6b07c]">
                Luxury Collection
              </p>

              <h2 className="mt-3 font-display text-[clamp(1.8rem,4.4vw,4.8rem)] leading-[0.9] tracking-[-0.04em] text-white">
                {currentBanner.title}
              </h2>

              <p className="fluid-body mt-4 max-w-[30rem] text-[#f5ede3]">
                {currentBanner.subtitle}
              </p>

              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="w-full sm:w-auto"
                >
                  <Button
                    className="w-full rounded-full bg-[#c59a63] text-white hover:bg-[#b7874b] sm:w-auto"
                  >
                    <span className="inline-flex items-center gap-2">
                      {currentBanner.buttonText || "Explore"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION */}
      {banners.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 sm:bottom-6"
        >
          <div className="flex items-center gap-2 rounded-full border border-white/18 bg-white/88 px-3 py-2 shadow-lg backdrop-blur-md sm:gap-3 sm:px-4">
            <button
              onClick={prevSlide}
              className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7a5645] shadow-sm transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {banners.map((banner, index) => {
                const active = index === currentIndex;

                return (
                  <button
                    key={banner.id || index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      active ? "w-9 bg-[#c59a63]" : "w-2.5 bg-white/40"
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={nextSlide}
              className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7a5645] shadow-sm transition-all duration-300 hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
