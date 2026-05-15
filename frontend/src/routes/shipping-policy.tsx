import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.9))] px-6 py-8 shadow-soft md:px-10 md:py-10">
            <h1 className="font-display text-4xl text-navy sm:text-5xl">Shipping & Delivery Policy</h1>

            <p className="mt-6 text-base leading-8 text-navy/75">
              Purefumes Hyderabad ships products across India.
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-8 text-navy/75">
              <li>Estimated delivery time is 3–7 business days, depending on location.</li>
              <li>We dispatch orders as quickly as possible after order confirmation.</li>
              <li>
                Delivery timelines may be affected by courier delays, weather, public holidays, or
                other unforeseen circumstances.
              </li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-navy">Contact</h2>
            <p className="mt-3 text-base leading-8 text-navy/75">
              Email: purefumes.hyderabad@gmail.com
              <br />
              Phone: 8686003446
            </p>

            <p className="mt-6 text-base leading-8 text-navy/75">
              Business Name: Purefumes Hyderabad
              <br />
              Owner Name: Mohammed Ammar Ali
            </p>
          </article>
        </Container>
      </section>
    </SiteShell>
  );
}
