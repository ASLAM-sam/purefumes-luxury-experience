import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { Product } from "@/data/products";
import { productsApi } from "@/services/api";

const getHeroImage = (product?: Product | null) =>
  product?.images?.find(Boolean) || product?.image || "";

export const Hero = memo(function Hero() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    const loadHeroProduct = async () => {
      try {
        const latestProducts = await productsApi.listLatest();
        const nextProducts = latestProducts.length
          ? latestProducts
          : await productsApi.list({ page: 1, limit: 6 });

        if (active) {
          setProducts(nextProducts);
        }
      } catch (_error) {
        if (active) {
          setProducts([]);
        }
      }
    };

    void loadHeroProduct();

    return () => {
      active = false;
    };
  }, []);

  const heroProduct = useMemo(
    () => products.find((product) => getHeroImage(product)) || products[0] || null,
    [products],
  );
  const heroImage = getHeroImage(heroProduct);

  return (
    <section className="hero overflow-hidden bg-[#f7f3ed] text-[#5b3a29]">
      <Container className="grid min-h-[calc(100svh-7rem)] items-center gap-10 py-14 md:grid-cols-[0.94fr_1.06fr] md:py-20 lg:gap-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="inline-flex items-center gap-2 border border-white/80 bg-white/60 px-5 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-[#8b6b56] shadow-soft"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#c89b63]" />
            Luxury Perfume House
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.06 }}
            className="mt-8 font-display text-[clamp(3.25rem,9vw,6.8rem)] leading-[0.92] text-[#5b3a29]"
          >
            Purefumes
            <span className="block italic text-[#8b5f3d]">Hyderabad</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16 }}
            className="mt-6 font-display text-2xl italic text-[#c89b63] md:text-3xl"
          >
            Redesign Your Appearance
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.24 }}
            className="mt-6 max-w-xl text-sm leading-8 text-[#8b6b56] md:text-base"
          >
            An exclusive curation of Middle Eastern, designer and niche fragrances,
            handpicked for connoisseurs of timeless elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.32 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <a href="/shop" className="w-full sm:w-auto">
              <Button className="w-full min-w-[14rem] rounded-none bg-[#8b5f3d] py-4 text-[#fffaf4] hover:bg-[#5b3a29] sm:w-auto">
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="/shop?sort=bestseller" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full min-w-[14rem] rounded-none border-[#8b5f3d] bg-transparent py-4 text-[#5b3a29] hover:bg-[#8b5f3d] hover:text-[#fffaf4] sm:w-auto"
              >
                Shop Best Sellers
              </Button>
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.14 }}
          className="relative mx-auto w-full max-w-[40rem]"
        >
          <div className="aspect-[4/4.6] overflow-hidden bg-[#efe7dc] shadow-[0_30px_80px_-44px_rgba(91,58,41,0.42)]">
            {heroImage ? (
              <OptimizedImage
                src={heroImage}
                alt={heroProduct?.name || "Purefumes Hyderabad fragrance"}
                width={1200}
                height={1380}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 767px) 92vw, 42vw"
                wrapperClassName="h-full w-full"
                className="h-full w-full object-contain object-center p-6 transition duration-700 ease-out hover:scale-[1.025] md:p-10"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#efe7dc] px-8 text-center">
                <p className="font-display text-5xl text-[#5b3a29]/35">Purefumes</p>
                <p className="mt-4 text-[0.68rem] uppercase tracking-[0.34em] text-[#8b6b56]">
                  Product imagery appears here automatically
                </p>
              </div>
            )}
          </div>

          {heroProduct ? (
            <div className="absolute bottom-5 left-5 right-5 bg-[#fffaf4]/88 p-4 shadow-soft backdrop-blur">
              <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#c89b63]">
                {heroProduct.brand}
              </p>
              <p className="mt-1 truncate font-display text-2xl text-[#5b3a29]">
                {heroProduct.name}
              </p>
            </div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  );
});
