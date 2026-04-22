import { memo } from "react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/common/Button";

export const Hero = memo(function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <img src={heroImg} alt="Luxury perfume" width={1920} height={1080}
        className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-transparent to-navy/60" />

      <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-[0.7rem] md:text-xs uppercase tracking-[0.5em] text-gold"
        >
          Established · Hyderabad
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl mt-6 leading-[0.95] max-w-3xl text-beige"
        >
          Purefumes<br /><span className="italic text-gold">Hyderabad</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 max-w-md text-base md:text-lg text-beige/80 font-light"
        >
          Discover luxury fragrances — Middle Eastern oud, designer classics, and rare niche houses, decanted with care.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex gap-4"
        >
        <a href="#featured"><Button variant="gold">Explore Collection</Button></a>
          <a href="#categories"><Button className="!bg-beige !text-navy hover:!opacity-90">Browse Categories</Button></a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.4em] text-beige/60 uppercase"
      >
        Scroll
      </motion.div>
    </section>
  );
});
