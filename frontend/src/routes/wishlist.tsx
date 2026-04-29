import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useApp();
  const { addNotification } = useNotification();

  const removeProduct = (productId: string) => {
    removeFromWishlist(productId);
    addNotification("Removed from wishlist.", "info");
  };

  const handleClearWishlist = () => {
    clearWishlist();
    addNotification("Wishlist cleared.", "info");
  };

  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Wishlist</p>
              <h1 className="mt-2 font-display text-5xl text-navy">Saved Fragrances</h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {wishlistCount
                  ? `${wishlistCount} saved perfume${wishlistCount === 1 ? "" : "s"} ready for your next browse.`
                  : "Your saved perfumes will appear here."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.24em] text-navy shadow-soft transition hover:border-gold/60 hover:text-gold"
              >
                Continue Shopping
              </Link>
              {wishlist.length ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearWishlist}
                  className="rounded-xl px-5 py-3 text-[0.68rem]"
                >
                  Clear All
                </Button>
              ) : null}
            </div>
          </header>

          {wishlist.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
              <Heart className="mx-auto h-10 w-10 text-gold" />
              <h2 className="mt-5 font-display text-3xl text-navy">No wishlist items yet</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                Tap the heart on any product card or product page to save it here.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90"
              >
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <div className="product-grid mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
              {wishlist.map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </SiteShell>
  );
}
