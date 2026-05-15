import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.9))] px-6 py-8 shadow-soft md:px-10 md:py-10">
            <h1 className="font-display text-4xl text-navy sm:text-5xl">Contact</h1>
            <dl className="mt-8 grid gap-5 text-sm leading-7 text-navy/80 sm:text-base">
              <div>
                <dt className="font-semibold text-navy">Business Name</dt>
                <dd>Purefumes Hyderabad</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Owner Name</dt>
                <dd>Mohammed Ammar Ali</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Business Type</dt>
                <dd>Individual</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Location</dt>
                <dd>Hyderabad, Telangana, India</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Email</dt>
                <dd>
                  <a className="underline decoration-gold/60 underline-offset-4" href="mailto:purefumes.hyderabad@gmail.com">
                    purefumes.hyderabad@gmail.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Phone</dt>
                <dd>
                  <a className="underline decoration-gold/60 underline-offset-4" href="tel:8686003446">
                    8686003446
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">GST</dt>
                <dd>Not Available</dd>
              </div>
            </dl>
          </article>
        </Container>
      </section>
    </SiteShell>
  );
}
