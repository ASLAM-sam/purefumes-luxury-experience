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
