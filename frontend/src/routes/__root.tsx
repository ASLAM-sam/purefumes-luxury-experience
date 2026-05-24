import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Sentry } from "@/lib/sentry";
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
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setTag("area", "react");
      }}
      fallback={({ error, resetError }) => (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {import.meta.env.DEV && error instanceof Error && error.message && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left font-mono text-xs text-destructive">
                {error.message}
              </pre>
            )}
            <button
              onClick={resetError}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    >
      <NotificationProvider>
        <AuthProvider>
          <AppProvider>
            <Outlet />
          </AppProvider>
        </AuthProvider>
      </NotificationProvider>
    </Sentry.ErrorBoundary>
  );
}
