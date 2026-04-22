import type { ReactNode } from "react";
import { StickyOfferBar } from "./StickyOfferBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductModal } from "@/components/product/ProductModal";
import { CheckoutModal } from "@/components/product/CheckoutModal";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <StickyOfferBar />
      <Navbar />
      <main className="pt-[7.25rem]">{children}</main>
      <Footer />
      <ProductModal />
      <CheckoutModal />
    </>
  );
}
