import { memo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { PerfumeRequestDialog } from "@/components/request/PerfumeRequestDialog";

export const PerfumeRequestSection = memo(function PerfumeRequestSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="bg-navy py-[var(--section-space)] text-beige">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="overflow-hidden rounded-[var(--radius-panel)] border border-beige/12 bg-[linear-gradient(135deg,rgba(7,32,63,0.98),rgba(10,34,63,0.95)_48%,rgba(18,47,80,0.92))] shadow-[0_32px_80px_-42px_rgba(0,0,0,0.7)]"
          >
            <div className="grid gap-6 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-10 md:py-12">
              <div>
                <div className="fluid-eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 uppercase text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Private Queries
                </div>
                <h2 className="max-w-2xl font-display text-[clamp(2rem,4vw,3.7rem)] leading-[0.94] text-beige">
                  Can&apos;t find your fragrance?
                </h2>
                <p className="fluid-body mt-5 max-w-xl text-beige/75">
                  Request a perfume and we&apos;ll try to source it for you. Share the bottle name,
                  wishlist details, and reference photos if you have them.
                </p>
              </div>

              <div className="rounded-[clamp(1.2rem,2vw,1.6rem)] border border-beige/10 bg-beige/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6">
                <p className="fluid-eyebrow uppercase text-gold/85">
                  Personal sourcing desk
                </p>
                <p className="fluid-body-sm mt-3 text-beige/70">
                  Send the fragrance name, preferred size, budget, and up to three reference photos
                  from your gallery. We&apos;ll review the request and contact you.
                </p>
                <Button
                  type="button"
                  variant="gold"
                  onClick={() => setOpen(true)}
                  className="mt-6 w-full rounded-full hover:-translate-y-1 hover:shadow-[0_28px_54px_-24px_rgba(200,169,106,0.92)] md:w-auto"
                >
                  <span className="inline-flex items-center gap-2">
                    Request a Perfume
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <PerfumeRequestDialog open={open} onOpenChange={setOpen} />
    </>
  );
});
