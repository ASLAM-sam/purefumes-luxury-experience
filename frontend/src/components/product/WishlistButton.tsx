import { memo, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";

type WishlistButtonProps = {
  product: Product;
  className?: string;
  showLabel?: boolean;
  variant?: "floating" | "inline";
};

export const WishlistButton = memo(function WishlistButton({
  product,
  className,
  showLabel = false,
  variant = "floating",
}: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useApp();
  const { addNotification } = useNotification();
  const active = isWishlisted(product.id);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const added = toggleWishlist(product);
    addNotification(added ? "Added to wishlist." : "Removed from wishlist.", added ? "success" : "info");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center gap-2 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
        variant === "floating"
          ? "h-10 w-10 rounded-full border-white/70 bg-white/90 text-navy shadow-soft backdrop-blur hover:-translate-y-0.5 hover:border-gold/70 hover:text-gold"
          : "rounded-xl border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.22em] text-navy shadow-soft hover:border-gold/60 hover:text-gold",
        active ? "border-gold/70 text-gold" : "",
        className,
      )}
    >
      <Heart className="h-4 w-4" fill={active ? "currentColor" : "none"} />
      {showLabel ? <span>{active ? "Wishlisted" : "Wishlist"}</span> : null}
    </button>
  );
});
