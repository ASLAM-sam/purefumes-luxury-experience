import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About Purefumes Hyderabad | Authentic Perfume Store",
      },
      {
        name: "description",
        content:
          "Learn about Purefumes Hyderabad, an online perfume store based in Hyderabad offering authentic Designer, Middle Eastern, and Niche fragrances across India.",
      },
      {
        property: "og:title",
        content: "About Purefumes Hyderabad",
      },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad offers authentic perfumes online with trusted service from Hyderabad, Telangana.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://purefumeshyderabad.in/about",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <main>
        <Container>
          <section className="py-16 md:py-24">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-3xl border border-border bg-background/80 p-8 shadow-sm md:p-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-serif tracking-tight md:text-5xl">
                      About Us
                    </h1>

                    <h2 className="text-xl font-medium leading-relaxed md:text-2xl">
                      Every fragrance tells a story. Yours begins here.
                    </h2>
                  </div>

                  <div className="space-y-6 text-base leading-8 text-muted-foreground md:text-lg">
                    <p>
                      Purefumes Hyderabad was created with one vision—to make
                      authentic luxury fragrances accessible to everyone who
                      appreciates quality and craftsmanship.
                    </p>

                    <p>
                      From iconic designer perfumes to the finest Middle
                      Eastern creations and exclusive niche masterpieces, every
                      fragrance we offer is carefully selected for authenticity
                      and excellence.
                    </p>

                    <p>
                      Founded by Mohammed Ammar Ali in Hyderabad, India, we are
                      committed to providing a trusted destination where
                      perfume lovers can shop with complete confidence, knowing
                      every bottle is genuine.
                    </p>

                    <p>
                      Because true luxury isn’t just about wearing a
                      fragrance—it’s about leaving a memorable impression.
                    </p>

                    <p className="font-medium text-foreground">
                      Purefumes Hyderabad — Redefine Your Presence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </SiteShell>
  );
}