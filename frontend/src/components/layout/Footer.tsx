import { memo } from "react";
import { Container } from "@/components/common/Container";
import { Instagram, Mail, MapPin } from "lucide-react";

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border mt-32 py-16 bg-navy text-beige">
      <Container className="grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-display text-2xl">
            <span>Pure</span><span className="text-gold">fumes</span>
            <span className="block text-[0.65rem] tracking-[0.4em] uppercase text-beige/60 mt-1">Hyderabad</span>
          </h3>
          <p className="mt-4 text-sm text-beige/70 leading-relaxed max-w-xs">
            Curators of authentic luxury fragrances. Decants, full bottles, niche houses — delivered with discretion.
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] text-gold uppercase mb-4">Discover</p>
          <ul className="space-y-2 text-sm text-beige/70">
            <li>Middle Eastern</li><li>Designer</li><li>Niche</li><li>New Arrivals</li>
          </ul>
        </div>
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] text-gold uppercase mb-4">Visit</p>
          <ul className="space-y-3 text-sm text-beige/70">
            <li className="flex gap-2"><MapPin className="w-4 h-4 text-gold mt-0.5" /> Banjara Hills, Hyderabad</li>
            <li className="flex gap-2"><Mail className="w-4 h-4 text-gold mt-0.5" />hello@purefumes.in</li>
            <li className="flex gap-2"><Instagram className="w-4 h-4 text-gold mt-0.5" /> @purefumeshyderabad</li>
          </ul>
        </div>
      </Container>
      <Container className="mt-12 pt-8 border-t border-beige/10 text-xs text-beige/60 tracking-widest uppercase text-center">
        © {new Date().getFullYear()} Purefumes Hyderabad · Crafted with intention
      </Container>
    </footer>
  );
});
