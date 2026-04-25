import { memo } from "react";
import { Container } from "@/components/common/Container";
import { Instagram, Mail, MapPin } from "lucide-react";

export const Footer = memo(function Footer() {
  return (
    <footer className="mt-24 bg-navy py-16 text-beige">
      <Container>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div>
            <h3 className="font-display text-2xl md:text-3xl">
              <span>Pure</span>
              <span className="text-gold">fumes</span>
              <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.4em] text-beige/60">
                Hyderabad
              </span>
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-7 text-beige/70">
              Curators of authentic luxury fragrances. Decants, full bottles, niche houses - delivered with discretion.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Discover</p>
            <ul className="space-y-2 text-sm text-beige/70">
              <li className="transition duration-300 ease-in-out hover:text-gold">Middle Eastern</li>
              <li className="transition duration-300 ease-in-out hover:text-gold">Designer</li>
              <li className="transition duration-300 ease-in-out hover:text-gold">Niche</li>
              <li className="transition duration-300 ease-in-out hover:text-gold">New Arrivals</li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Visit</p>
            <ul className="space-y-3 text-sm text-beige/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-gold" />
                <span>Banjara Hills, Hyderabad</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 text-gold" />
                <a
                  href="mailto:hello@purefumes.in"
                  className="transition duration-300 ease-in-out hover:text-gold"
                >
                  hello@purefumes.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="mt-1 h-4 w-4 text-gold" />
                <a
                  href="https://instagram.com/purefumeshyderabad"
                  target="_blank"
                  rel="noreferrer"
                  className="transition duration-300 ease-in-out hover:text-gold"
                >
                  @purefumeshyderabad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-beige/10 pt-8 text-center text-[0.68rem] uppercase tracking-[0.34em] text-beige/55">
          Copyright {new Date().getFullYear()} Purefumes Hyderabad - Crafted with intention
        </div>
      </Container>
    </footer>
  );
});
