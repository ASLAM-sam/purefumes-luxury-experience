import { memo } from "react";
import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";

const highlights = [
  {
    title: "Authentic Products",
    description: "Sourced from trusted channels and checked before dispatch.",
    Icon: BadgeCheck,
  },
  {
    title: "Fast Delivery",
    description: "Careful packing and prompt delivery across India.",
    Icon: Truck,
  },
  {
    title: "Secure Payment",
    description: "Razorpay, UPI, cards, net banking and COD flow support.",
    Icon: ShieldCheck,
  },
  {
    title: "Concierge Support",
    description: "Guidance for finding a signature scent or a rare bottle.",
    Icon: Headphones,
  },
] as const;

export const AboutUs = memo(function AboutUs() {
  return (
    <section
      id="about-us"
      className="bg-[#f7f3ed] py-16 md:py-24"
    >
      <Container>
        <SectionTitle eyebrow="The Purefumes Promise" title="Why Choose Us" />

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {highlights.map(({ title, description, Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="group border border-border/70 bg-[#fffaf4] p-6 text-center shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:border-gold/45"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dfb77c]/55 text-[#5b3a29] transition duration-300 ease-in-out group-hover:bg-[#c89b63]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-[#5b3a29]">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-[#8b6b56]">{description}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
});
