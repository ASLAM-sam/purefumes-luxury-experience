import { useEffect, useRef, type ReactNode } from "react";
import { StickyOfferBar } from "./StickyOfferBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { CheckoutModal } from "@/components/product/CheckoutModal";

export function SiteShell({ children }: { children: ReactNode }) {
  const cursorLightRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const light = cursorLightRef.current;

    if (!light) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !supportsFinePointer) {
      light.style.display = "none";
      return undefined;
    }

    let rafId = 0;
    let nextX = window.innerWidth / 2;
    let nextY = window.innerHeight / 2;

    const render = () => {
      rafId = 0;
      light.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -50%)`;
      light.style.opacity = "1";
    };

    const handleMouseMove = (event: MouseEvent) => {
      nextX = event.clientX;
      nextY = event.clientY;

      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observedSections = new WeakSet<Element>();
    const getSections = () => Array.from(mainElement.querySelectorAll("section"));

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      const revealSections = () => {
        getSections().forEach((section) => {
          section.classList.add("section-reveal", "section-reveal--visible");
        });
      };
      const mutationObserver = new MutationObserver(revealSections);

      revealSections();
      mutationObserver.observe(mainElement, { childList: true, subtree: true });

      return () => {
        mutationObserver.disconnect();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const observeSections = () => {
      getSections().forEach((section, index) => {
        if (observedSections.has(section)) {
          return;
        }

        observedSections.add(section);
        section.classList.add("section-reveal");

        if (index === 0) {
          section.classList.add("section-reveal--visible");
          return;
        }

        observer.observe(section);
      });
    };

    const mutationObserver = new MutationObserver(observeSections);

    observeSections();
    mutationObserver.observe(mainElement, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <div className="site-shell relative isolate flex min-h-screen min-w-0 flex-col overflow-x-hidden">
      <div ref={cursorLightRef} className="cursor-light" aria-hidden="true" />
      <div className="site-shell__content relative z-[1] flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="site-header">
          <StickyOfferBar />
          <Navbar />
        </div>
        <main ref={mainRef} className="site-main min-w-0 flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <CheckoutModal />
      </div>
    </div>
  );
}
