import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { HeroSlider } from "@/components/sections/HeroSlider";

export const Hero = memo(function Hero() {
  return (
    <section className="hero bg-navy text-beige">
      <Container className="hero-container grid items-center gap-8 py-[60px] text-center md:min-h-[80svh] md:gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:text-left">
        <div className="mx-auto max-w-xl lg:mx-0">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="hero-title max-w-full font-display text-[clamp(2.25rem,9vw,5rem)] leading-[0.95] text-beige [overflow-wrap:anywhere] sm:text-[clamp(2.6rem,9vw,5rem)] md:text-7xl lg:text-[5.5rem]"
          >
            Purefumes
            <br />
            <span className="italic text-gold">Hyderabad</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-5 max-w-lg text-[0.98rem] leading-7 text-beige/80 md:mt-6 md:text-lg md:leading-8"
          >
            Discover luxury fragrances crafted with rare ingredients and timeless elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-actions mt-8 flex flex-col items-center gap-4 md:mt-10 md:flex-row md:justify-center lg:justify-start"
          >
            <a href="#featured" className="w-full max-w-[280px] md:w-auto md:max-w-none">
              <Button
                variant="gold"
                className="w-full rounded-full px-8 py-4 text-[0.72rem] tracking-[0.24em] md:min-w-[190px] md:w-auto md:tracking-[0.32em]"
              >
                Explore Collection
              </Button>
            </a>
            <a href="#categories" className="w-full max-w-[280px] md:w-auto md:max-w-none">
              <Button
                variant="outline"
                className="w-full rounded-full border-beige/40 bg-transparent px-8 py-4 text-[0.72rem] tracking-[0.24em] !text-beige hover:!bg-beige hover:!text-navy md:min-w-[190px] md:w-auto md:tracking-[0.32em]"
              >
                Browse Categories
              </Button>
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mx-auto mt-2 w-full max-w-[34rem] md:mt-0 lg:ml-auto"
        >
          <HeroSlider id="hero-slider-luxury-replace-image" />
        </motion.div>
      </Container>
    </section>
  );
});
