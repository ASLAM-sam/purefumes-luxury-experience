import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/purefumeshyderabad",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/purefumeshyderabad",
    Icon: Facebook,
  },
];

const paymentBadges = ["Visa", "Master", "UPI", "Razorpay", "COD"];

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border bg-[#fffaf4] py-12 text-[#5b3a29] md:py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
          <div>
            <h3 className="font-display text-3xl uppercase tracking-[0.24em] text-[#8b5f3d]">
              Purefumes
              <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.5em] text-[#8b6b56]">
                Hyderabad
              </span>
            </h3>
            <p className="mt-5 max-w-sm font-display text-lg italic text-[#8b5f3d]">
              Redesign Your Appearance
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
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.36em] text-[#8b5f3d]">Shop</p>
            <ul className="space-y-3 text-sm text-[#8b6b56]">
              <li>
                <a href="/shop" className="transition hover:text-[#c89b63]">
                  All Fragrances
                </a>
              </li>
              <li>
                <a href="/shop?category=middle-eastern" className="transition hover:text-[#c89b63]">
                  Middle Eastern
                </a>
              </li>
              <li>
                <a href="/shop?category=designer" className="transition hover:text-[#c89b63]">
                  Designer
                </a>
              </li>
              <li>
                <a href="/shop?category=niche" className="transition hover:text-[#c89b63]">
                  Niche
                </a>
              </li>
              <li>
                <a href="/shop?sort=bestseller" className="transition hover:text-[#c89b63]">
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.36em] text-[#8b5f3d]">
              Company
            </p>
            <ul className="space-y-3 text-sm text-[#8b6b56]">
              <li>
                <Link to="/about" className="transition hover:text-[#c89b63]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#c89b63]">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition hover:text-[#c89b63]">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="transition hover:text-[#c89b63]">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="transition hover:text-[#c89b63]">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="transition hover:text-[#c89b63]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="transition hover:text-[#c89b63]">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="transition hover:text-[#c89b63]">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="transition hover:text-[#c89b63]">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.36em] text-[#8b5f3d]">
              Reach Us
            </p>
            <ul className="space-y-3 text-sm text-[#8b6b56]">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#c89b63]" /> +91 8686003446
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#c89b63]" /> purefumes.hyderabad@gmail.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-[#c89b63]" /> Hyderabad, Telangana, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 text-xs text-[#8b6b56] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Purefumes Hyderabad. All rights reserved.</p>
          <div className="flex flex-wrap gap-2">
            {paymentBadges.map((badge) => (
              <span
                key={badge}
                className="border border-[#c89b63]/30 bg-[#f7f3ed] px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-[#8b5f3d]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
});
