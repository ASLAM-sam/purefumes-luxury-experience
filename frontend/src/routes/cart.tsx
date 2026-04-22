import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cart, cartCount, cartTotal, updateCartQuantity, removeFromCart, openCheckout } = useApp();
  const nav = useNavigate();

  const openProduct = (id?: string) => {
    if (!id) return;
    nav({ to: "/product/$id", params: { id } });
  };

  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Cart</p>
              <h1 className="font-display mt-2 text-5xl text-navy">Your Selection</h1>
            </div>
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy"
            >
              Continue Shopping
            </Link>
          </header>

          {cart.length === 0 ? (
            <div className="mt-12 rounded-lg border border-border bg-card p-10 text-center shadow-soft">
              <ShoppingBag className="mx-auto h-10 w-10 text-gold" />
              <h2 className="font-display mt-5 text-3xl text-navy">Cart is empty</h2>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90"
              >
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
              <div className="space-y-4">
                {cart.map((item) => (
                  <article
                    key={item.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProduct(item.product.id || item.product._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProduct(item.product.id || item.product._id);
                      }
                    }}
                    className="grid cursor-pointer gap-4 rounded-lg border border-border bg-card p-4 shadow-soft transition hover:bg-beige/30 sm:grid-cols-[6rem_1fr_auto]"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="aspect-square w-full rounded-lg bg-beige object-cover sm:w-24"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">
                        {item.product.brand}
                      </p>
                      <h2 className="font-display mt-1 text-2xl text-navy">{item.product.name}</h2>
                      <p className="mt-2 text-sm text-navy/60">{item.size.size}</p>
                      <p className="mt-2 font-medium text-gold">Rs. {item.size.price}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-lg border border-border bg-beige/30">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateCartQuantity(item.key, item.quantity - 1);
                          }}
                          className="p-2 text-navy/60 hover:text-navy"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm tabular-nums text-navy">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateCartQuantity(item.key, item.quantity + 1);
                          }}
                          className="p-2 text-navy/60 hover:text-navy"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFromCart(item.key);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-[0.2em] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-soft">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-navy/60">Summary</p>
                <div className="mt-5 space-y-3 text-sm text-navy/70">
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{cartCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {cartTotal}</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-xs uppercase tracking-[0.25em] text-navy/60">Total</span>
                  <span className="font-display text-3xl text-navy">Rs. {cartTotal}</span>
                </div>
                <Button onClick={openCheckout} className="mt-6 w-full" disabled={!cart.length}>
                  Proceed to Checkout
                </Button>
              </aside>
            </div>
          )}
        </Container>
      </section>
    </SiteShell>
  );
}
