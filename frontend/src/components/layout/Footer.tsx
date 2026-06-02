import { memo } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Clock,
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Container } from "@/components/common/Container";

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund & Cancellation Policy", to: "/refund-policy" },
  { label: "Return Policy", to: "/return-policy" },
] as const;

const shopLinks = [
  { label: "All Fragrances", href: "/shop" },
  { label: "Best Sellers", href: "/shop?sort=bestseller" },
  { label: "Latest Arrivals", href: "/shop?sort=latest" },
] as const;

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18pRD83qWQ/?mibextid=wwXIfr",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/purefumes.hyderabad?igsh=MW00bGIzMGxleHo5dw==",
    Icon: Instagram,
  },
] as const;

const trustItems = [
  { label: "Secure Checkout", Icon: ShieldCheck },
  { label: "Authentic Perfumes", Icon: BadgeCheck },
  { label: "Customer Support", Icon: Headphones },
  { label: "Fast Delivery Across India", Icon: Truck },
] as const;

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path d="M19.11 17.42c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14s-.7.88-.86 1.06c-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.16-1.35-.8-.72-1.33-1.61-1.49-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.33.98 2.62 1.11 2.8.14.18 1.91 2.92 4.63 4.1.65.28 1.16.45 1.55.58.65.2 1.24.17 1.71.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32Z" />
    <path d="M27.06 4.91A15.86 15.86 0 0 0 16 0C7.18 0 0 7.18 0 16c0 2.82.74 5.57 2.14 7.99L0 32l8.24-2.11A15.92 15.92 0 0 0 16 32c8.82 0 16-7.18 16-16 0-4.27-1.66-8.28-4.94-11.09ZM16 29.29c-2.4 0-4.75-.64-6.81-1.84l-.49-.29-4.89 1.25 1.31-4.76-.32-.5A13.23 13.23 0 0 1 2.71 16C2.71 8.67 8.67 2.71 16 2.71S29.29 8.67 29.29 16 23.33 29.29 16 29.29Z" />
  </svg>
);

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border bg-[#fffaf4] text-[#5b3a29]">
      <Container className="py-[clamp(2.75rem,5vw,4.75rem)]">
        <div className="grid gap-3 border-b border-[#5b3a29]/10 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-[#5b3a29]/10 bg-[#f7f3ed] px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c89b63]/16 text-[#8b5f3d]">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium text-[#5b3a29]">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-[1.15fr_0.75fr_1fr_1fr]">
          <div>
            <h3 className="font-display text-[clamp(2rem,2vw+1.1rem,3rem)] uppercase tracking-[0.24em] text-[#8b5f3d]">
              Purefumes
              <span className="fluid-eyebrow mt-2 block uppercase tracking-[0.5em] text-[#8b6b56]">
                Hyderabad
              </span>
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#8b6b56]">
              Purefumes Hyderabad offers authentic perfumes and personal care products with
              secure checkout, careful packing, and delivery support across India.
            </p>
            <div className="footer-socials">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-social-link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]">Shop</p>
            <ul className="space-y-3 text-sm text-[#8b6b56]">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-[#c89b63]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]">
              Company Links
            </p>
            <ul className="grid gap-3 text-sm text-[#8b6b56] sm:grid-cols-2 lg:grid-cols-1">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition hover:text-[#c89b63]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]">
              Contact
            </p>
            <ul className="space-y-4 text-sm text-[#8b6b56]">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" />
                <a href="tel:+918686003446" className="transition hover:text-[#c89b63]">
                  +91-8686 003 446
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918341174677"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp at +91 83411 74677"
                  className="flex items-start gap-3 transition hover:text-[#c89b63]"
                >
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 fill-current text-[#c89b63]" />
                  <span>WhatsApp: +91 83411 74677</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" />
                <span>Monday to Saturday | 11:00 AM – 6:00 PM</span>
              </li>
              <li className="flex items-start gap-3 break-all">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" />
                <a
                  href="mailto:purefumes.hyderabad@gmail.com"
                  className="transition hover:text-[#c89b63]"
                >
                  purefumes.hyderabad@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" />
                <span>Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-[clamp(0.75rem,0.16vw+0.72rem,0.82rem)] text-[#8b6b56]">
          <p>© 2026 Purefumes Hyderabad. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
});
