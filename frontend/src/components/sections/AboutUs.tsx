import { memo } from "react";
import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";

const highlights = [
  {
    title: "Secure Checkout",
    description: "Razorpay, UPI, cards, net banking and COD support through the official checkout.",
    Icon: ShieldCheck,
  },
  {
    title: "Authentic Perfumes",
    description: "Products are sourced through trusted channels and checked before dispatch.",
    Icon: BadgeCheck,
  },
  {
    title: "Customer Support",
    description: "Phone support is available Monday to Saturday from 11:00 AM to 6:00 PM.",
    Icon: Headphones,
  },
  {
    title: "Fast Delivery Across India",
    description: "Orders are carefully packed, tracked after dispatch, and shipped across India.",
    Icon: Truck,
  },
] as const;

export const AboutUs = memo(function AboutUs() {
  return (
    <section
      id="about-us"
      className="bg-[#f7f3ed] py-[var(--section-space)]"
    >
      <Container>
        <SectionTitle eyebrow="The Purefumes Promise" title="Why Choose Us" />

        <div className="adaptive-card-grid mx-auto mt-10 max-w-6xl md:mt-12">
          {highlights.map(({ title, description, Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="group rounded-[1.4rem] border border-border/70 bg-[#fffaf4] p-5 text-center shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:border-gold/45 sm:p-6"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dfb77c]/55 text-[#5b3a29] transition duration-300 ease-in-out group-hover:bg-[#c89b63] sm:h-14 sm:w-14">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-5 font-display text-[clamp(1.1rem,0.8vw+0.95rem,1.35rem)] text-[#5b3a29]">
                {title}
              </h3>
              <p className="fluid-body-sm mt-2 text-[#8b6b56]">{description}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
});
