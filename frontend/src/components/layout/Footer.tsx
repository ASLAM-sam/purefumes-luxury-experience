import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { Facebook, Instagram } from "lucide-react";

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

export const Footer = memo(function Footer() {
  return (
    <footer className="mt-16 bg-navy py-12 text-beige md:mt-24 md:py-14">
      <Container>
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <div>
            <h3 className="font-display text-2xl md:text-3xl">
              <span>Pure</span>
              <span className="text-gold">fumes</span>
              <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.4em] text-beige/60">
                Hyderabad
              </span>
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-beige/75">
              Original niche, designer, and Middle Eastern fragrances with a trusted online shopping
              experience.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Information</p>
            <ul className="space-y-2 text-sm text-beige/75">
              <li>
                <Link to="/about" className="transition duration-300 ease-in-out hover:text-gold">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition duration-300 ease-in-out hover:text-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="transition duration-300 ease-in-out hover:text-gold"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="transition duration-300 ease-in-out hover:text-gold"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Business Details</p>
            <ul className="space-y-2 text-sm text-beige/75">
              <li>Owner: Mohammed Ammar Ali</li>
              <li>Business Type: Individual</li>
              <li>Location: Hyderabad, Telangana, India</li>
              <li>Email: purefumes.hyderabad@gmail.com</li>
              <li>Phone: 8686003446</li>
              <li>GST: Not Available</li>
            </ul>

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
        </div>

        <div className="mt-8 border-t border-beige/10 pt-6 text-center text-xs text-beige/80">
          © 2026 Purefumes Hyderabad. Owned and operated by Mohammed Ammar Ali, Hyderabad,
          Telangana, India.
        </div>
      </Container>
    </footer>
  );
});
