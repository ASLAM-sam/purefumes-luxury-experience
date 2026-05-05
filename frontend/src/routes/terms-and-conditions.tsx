import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/terms-and-conditions")({
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.9))] px-6 py-8 shadow-soft md:px-10 md:py-10">
            <h1 className="font-display text-4xl text-navy sm:text-5xl">Terms & Conditions</h1>
            <p className="mt-6 text-base leading-8 text-navy/75">
              By using this website, you agree to provide accurate order information and use the
              platform for lawful purchases only. Product availability, pricing, and shipping
              timelines may change as needed.
            </p>
            <p className="mt-4 text-base leading-8 text-navy/75">
              Returns, cancellations, and support are handled based on product condition and order
              status. For any issue, please contact us and we will assist you fairly and promptly.
            </p>
            <p className="mt-4 text-base leading-8 text-navy/75">
              Business Name: Purefumes Hyderabad<br />
              Owner Name: Mohammed Ammar Ali<br />
              Contact Email: purefumes.hyderabad@gmail.com
            </p>
          </article>
        </Container>
      </section>
    </SiteShell>
  );
}
