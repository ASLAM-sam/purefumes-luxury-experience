import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { bannersApi, type Banner } from "@/services/api";

const AUTOPLAY_MS = 4000;

const getBannerHref = (banner: Banner | null) => banner?.link?.trim() || "/brands";
const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export const HeroSlider = memo(function HeroSlider({ id }: { id?: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBanners = async () => {
      try {
        const nextBanners = await bannersApi.listActive();

        if (!active) {
          return;
        }

        setBanners(nextBanners);
      } catch (_error) {
        if (!active) {
          return;
        }

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
    if (banners.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % banners.length);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [banners.length]);

  if (loading) {
    return (
      <div
        id={id}
        className="hero-slider flex h-[20rem] w-full animate-pulse items-end rounded-[1.75rem] border border-beige/10 bg-[linear-gradient(135deg,rgba(7,32,63,0.96),rgba(11,26,42,0.92),rgba(32,67,112,0.88))] p-6 shadow-[0_32px_80px_-36px_rgba(0,0,0,0.88)] sm:h-[24rem] md:h-[28rem] lg:h-[32rem]"
      >
        <div className="space-y-4">
          <div className="h-3 w-28 rounded-full bg-beige/20" />
          <div className="h-10 w-56 rounded-full bg-beige/20 sm:w-72" />
          <div className="h-4 w-48 rounded-full bg-beige/15 sm:w-80" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div
        id={id}
        className="hero-slider flex h-[20rem] w-full flex-col justify-end rounded-[1.75rem] border border-beige/10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.22),transparent_36%),linear-gradient(135deg,#071f3a_0%,#0b1a2a_52%,#102a49_100%)] p-6 text-left shadow-[0_32px_80px_-36px_rgba(0,0,0,0.88)] sm:h-[24rem] md:h-[28rem] lg:h-[32rem]"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.42em] text-gold/85">
          Luxury Spotlight
        </p>
        <h2 className="mt-4 max-w-sm font-display text-3xl text-white sm:text-4xl md:text-[2.8rem]">
          Explore our curated fragrance houses
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-beige/80 sm:text-base">
          Active hero banners will appear here automatically once they are enabled in the admin
          panel.
        </p>
        <div className="mt-6">
          <a href="/brands">
            <Button
              variant="gold"
              className="rounded-full px-6 py-3 text-[0.68rem] tracking-[0.28em]"
            >
              Explore Brands
            </Button>
          </a>
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
      className="hero-slider group relative h-[20rem] w-full overflow-hidden rounded-[1.75rem] border border-beige/10 shadow-[0_32px_80px_-36px_rgba(0,0,0,0.88)] sm:h-[24rem] md:h-[28rem] lg:h-[32rem]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id || `${currentIndex}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={currentBanner.image}
            alt={currentBanner.title || "Luxury fragrance banner"}
            width={1600}
            height={1000}
            sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1024px) 92vw, 34rem"
            wrapperClassName="h-full w-full"
            className="hero-slider__image h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(4,18,36,0.92)_0%,rgba(7,32,63,0.7)_38%,rgba(7,32,63,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.22),transparent_34%)]" />

          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end p-6 sm:p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="max-w-[23rem] text-left sm:max-w-[26rem]"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.44em] text-gold/90 sm:text-[0.64rem]">
                Luxury Edit
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-[0.95] text-white sm:text-[2.35rem] md:text-[2.8rem]">
                {currentBanner.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-beige/82 sm:text-base sm:leading-7">
                {currentBanner.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  <Button
                    variant="gold"
                    className="rounded-full px-6 py-3 text-[0.68rem] tracking-[0.28em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      {currentBanner.buttonText || "Explore"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </a>
                <span className="rounded-full border border-beige/15 bg-white/8 px-4 py-2 text-[0.62rem] uppercase tracking-[0.32em] text-beige/78 backdrop-blur-sm">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 ? (
        <div className="absolute bottom-5 right-5 z-[2] flex items-center gap-2 rounded-full border border-beige/15 bg-[#071f3a]/55 px-3 py-2 backdrop-blur-md">
          {banners.map((banner, index) => {
            const active = index === currentIndex;

            return (
              <button
                key={banner.id || `${banner.title}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show banner ${index + 1}`}
                className={`hero-slider__dot h-2.5 rounded-full transition-all duration-300 ${
                  active ? "w-8 bg-gold" : "w-2.5 bg-white/45 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
