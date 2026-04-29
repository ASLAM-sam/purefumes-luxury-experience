import { memo } from "react";

const whatsappUrl = "https://wa.me/918686003446";
const whatsappNumber = "+91 86860 03446";

export const WhatsAppFloat = memo(function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-[calc(var(--mobile-bottom-nav-height)+1rem)] left-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-18px_rgba(37,211,102,0.8)] transition duration-300 ease-in-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] md:bottom-8"
      aria-label={`Chat on WhatsApp at ${whatsappNumber}`}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M19.11 17.42c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14s-.7.88-.86 1.06c-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.16-1.35-.8-.72-1.33-1.61-1.49-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.33.98 2.62 1.11 2.8.14.18 1.91 2.92 4.63 4.1.65.28 1.16.45 1.55.58.65.2 1.24.17 1.71.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32Z" />
        <path d="M27.06 4.91A15.86 15.86 0 0 0 16 0C7.18 0 0 7.18 0 16c0 2.82.74 5.57 2.14 7.99L0 32l8.24-2.11A15.92 15.92 0 0 0 16 32c8.82 0 16-7.18 16-16 0-4.27-1.66-8.28-4.94-11.09ZM16 29.29c-2.4 0-4.75-.64-6.81-1.84l-.49-.29-4.89 1.25 1.31-4.76-.32-.5A13.23 13.23 0 0 1 2.71 16C2.71 8.67 8.67 2.71 16 2.71S29.29 8.67 29.29 16 23.33 29.29 16 29.29Z" />
      </svg>
    </a>
  );
});
