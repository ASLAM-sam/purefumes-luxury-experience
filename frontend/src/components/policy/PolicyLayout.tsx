import { Link } from "@tanstack/react-router";
import { ArrowRight, Home, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import type { PolicyPageContent } from "@/data/policies";

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund & Cancellation Policy", to: "/refund-policy" },
  { label: "Return Policy", to: "/return-policy" },
] as const;

const supportLinks = [
  {
    label: "Email",
    value: "purefumes.hyderabad@gmail.com",
    href: "mailto:purefumes.hyderabad@gmail.com",
    Icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 8686003446",
    href: "tel:+918686003446",
    Icon: Phone,
  },
  {
    label: "Location",
    value: "Hyderabad, Telangana, India",
    Icon: MapPin,
  },
] as const;

type PolicyLayoutProps = PolicyPageContent;

export function PolicyLayout({
  title,
  eyebrow,
  description,
  lastUpdated,
  sections,
}: PolicyLayoutProps) {
  return (
    <SiteShell>
      <div className="relative overflow-hidden bg-[#f7f3ed] text-[#5b3a29]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(239,231,220,0.72)_58%,rgba(247,243,237,0))]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,rgba(200,155,99,0.08),rgba(200,155,99,0))]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(200,155,99,0.45),transparent)]"
          aria-hidden="true"
        />

        <section className="relative px-0 pb-10 pt-10 md:pb-14 md:pt-16">
          <Container className="mx-auto max-w-6xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#8b6b56]"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 transition hover:text-[#c89b63]"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              <span className="text-[#c89b63]">/</span>
              <span className="text-[#5b3a29]">{title}</span>
            </nav>

            <div className="max-w-3xl">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]">
                {eyebrow}
              </p>
              <h1 className="mt-4 font-display text-4xl leading-tight text-[#1e1b18] sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#6f4d38] md:text-lg">
                {description}
              </p>
              <div className="mt-7 inline-flex border border-[#c89b63]/30 bg-[#fffaf4]/76 px-4 py-2 text-[0.66rem] uppercase tracking-[0.24em] text-[#8b5f3d] shadow-soft">
                Last updated: {lastUpdated}
              </div>
            </div>
          </Container>
        </section>

        <section className="relative pb-16 md:pb-24">
          <Container className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <article className="space-y-5" aria-label={`${title} sections`}>
                {sections.map((section, index) => (
                  <section
                    key={section.title}
                    className="group rounded-lg border border-[#5b3a29]/10 bg-[#fffaf4]/86 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-[#c89b63]/35 hover:bg-[#fffaf4] md:p-7"
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <span className="mt-1 flex h-8 w-8 flex-none items-center justify-center border border-[#c89b63]/30 bg-[#f7f3ed] text-xs font-medium text-[#8b5f3d] transition group-hover:border-[#c89b63]/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="font-display text-2xl leading-snug text-[#1e1b18] md:text-3xl">
                        {section.title}
                      </h2>
                    </div>

                    {section.content?.map((paragraph) => (
                      <p key={paragraph} className="mt-3 text-sm leading-7 text-[#6f4d38] md:text-base">
                        {paragraph}
                      </p>
                    ))}

                    {section.items?.length ? (
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-[#6f4d38] md:text-base">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#c89b63]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </article>

              <aside className="self-start lg:sticky lg:top-32">
                <div className="rounded-lg border border-[#5b3a29]/10 bg-[#fffaf4]/84 p-5 shadow-soft backdrop-blur">
                  <p className="text-[0.64rem] uppercase tracking-[0.3em] text-[#c89b63]">
                    Company Policies
                  </p>
                  <div className="mt-4 space-y-2">
                    {policyLinks.map((link) => {
                      const isCurrent = link.label === title;

                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`group flex items-center justify-between border-b border-[#5b3a29]/10 py-3 text-sm transition last:border-b-0 ${
                            isCurrent ? "text-[#c89b63]" : "text-[#6f4d38] hover:text-[#c89b63]"
                          }`}
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        <section className="relative border-y border-[#c89b63]/18 bg-[#1e1b18] py-12 text-[#fffaf4] md:py-16">
          <Container className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[1fr_1.35fr] md:items-center">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#e3c69e]">
                  Contact Support
                </p>
                <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
                  Need help with a policy or order?
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#efe7dc]/78 md:text-base">
                  Our support team can help with order IDs, damaged delivery checks, refunds,
                  returns, account requests, and payment confirmation queries.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {supportLinks.map(({ label, value, href, Icon }) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 items-center justify-center border border-[#e3c69e]/25 text-[#e3c69e]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="mt-4 block text-[0.62rem] uppercase tracking-[0.26em] text-[#e3c69e]">
                        {label}
                      </span>
                      <span className="mt-2 block break-words text-sm leading-6 text-[#fffaf4]">
                        {value}
                      </span>
                    </>
                  );

                  if (href) {
                    return (
                      <a
                        key={label}
                        href={href}
                        className="rounded-lg border border-[#fffaf4]/12 bg-[#fffaf4]/5 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#e3c69e]/40 hover:bg-[#fffaf4]/9"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div
                      key={label}
                      className="rounded-lg border border-[#fffaf4]/12 bg-[#fffaf4]/5 p-4"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </SiteShell>
  );
}
