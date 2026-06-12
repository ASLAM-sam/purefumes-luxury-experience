import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Purefumes Hyderabad | Authentic Perfume Store" },
      {
        name: "description",
        content:
          "Learn about Purefumes Hyderabad, an online perfume store based in Hyderabad offering authentic Designer, Middle Eastern, and Niche fragrances across India.",
      },
      { property: "og:title", content: "About Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad offers authentic perfumes online with trusted service from Hyderabad, Telangana.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://purefumeshyderabad.in/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.9))] px-6 py-8 shadow-soft md:px-10 md:py-10">
            <h1 className="font-display text-4xl text-navy sm:text-5xl">About Us</h1>
            <p className="mt-6 text-base leading-8 text-navy/75">
              Purefumes Hyderabad is an online store specializing in original Designer Fragrances,
              Middle Eastern Fragrances, and Niche Fragrances.
            </p>
            <p className="mt-4 text-base leading-8 text-navy/75">
              The business is owned and operated by Mohammed Ammar Ali and is based in Hyderabad,
              Telangana, India. We are committed to providing authentic perfumes at the best
              prices with a smooth online shopping experience.
            </p>
          </article>
        </Container>
      </section>
    </SiteShell>
  );
}
