import { memo } from "react";

const promoMessage = "Authentic products at reasonable prices | Pan India free shipping";

export const StickyOfferBar = memo(function StickyOfferBar() {
  return (
    <div className="promo-bar">
      <div className="promo-bar__inner px-4 uppercase">
        <div className="promo-bar__viewport">
          <span className="sr-only">{promoMessage}</span>
          <div className="promo-bar__track" aria-hidden="true">
            <span className="promo-bar__text">{promoMessage}</span>
            <span className="promo-bar__text promo-bar__text--duplicate">{promoMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
