import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import brandIconUrl from "@/assets/purefumes-hyderabad-logo-circle.png?url";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gold">404</h1>
        <h2 className="mt-4 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This fragrance has eluded us.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gold text-ink px-6 py-3 text-xs uppercase tracking-[0.3em]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Purefumes Hyderabad - Authentic Perfumes Online in India" },
      {
        name: "description",
        content:
          "Shop authentic perfumes, deodorants, and personal care products from Purefumes Hyderabad with secure checkout, support, and fast delivery across India.",
      },
      { name: "theme-color", content: "#fffaf4" },
      { property: "og:site_name", content: "Purefumes Hyderabad" },
      { property: "og:title", content: "Purefumes Hyderabad - Authentic Perfumes Online" },
      {
        property: "og:description",
        content:
          "Authentic perfumes, secure checkout, customer support, and fast delivery across India from Purefumes Hyderabad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: brandIconUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Purefumes Hyderabad" },
      {
        name: "twitter:description",
        content: "Shop authentic fragrances online with Purefumes Hyderabad.",
      },
      { name: "twitter:image", content: brandIconUrl },
    ],
    links: [
      { rel: "icon", href: brandIconUrl, type: "image/png" },
      { rel: "apple-touch-icon", href: brandIconUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppProvider>
          <Outlet />
        </AppProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
