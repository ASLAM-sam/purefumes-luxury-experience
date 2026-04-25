import { memo } from "react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";

export const Hero = memo(function Hero() {
  return (
    <section className="bg-navy text-beige">
      <Container className="grid min-h-[80svh] items-center gap-12 py-16 md:py-20 lg:grid-cols-2 lg:gap-14">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="font-display text-5xl leading-[0.92] text-beige sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Purefumes
            <br />
            <span className="italic text-gold">Hyderabad</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-6 max-w-lg text-base leading-8 text-beige/80 md:text-lg"
          >
            Discover luxury fragrances crafted with rare ingredients and timeless elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <a href="#featured">
              <Button
                variant="gold"
                className="min-w-[190px] rounded-full px-8 py-4 text-[0.72rem] tracking-[0.32em]"
              >
                Explore Collection
              </Button>
            </a>
            <a href="#categories">
              <Button
                variant="outline"
                className="min-w-[190px] rounded-full border-beige/40 bg-transparent px-8 py-4 text-[0.72rem] tracking-[0.32em] !text-beige hover:!bg-beige hover:!text-navy"
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
          className="mx-auto w-full max-w-[34rem] lg:ml-auto"
        >
          <img
            src={heroImg}
            alt="Luxury perfume"
            width={1920}
            height={1080}
            className="h-[24rem] w-full rounded-[1.75rem] object-cover shadow-luxe sm:h-[28rem] lg:h-[32rem]"
          />
        </motion.div>
      </Container>
    </section>
  );
});
