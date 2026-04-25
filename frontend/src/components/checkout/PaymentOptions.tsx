import { memo } from "react";
import { paymentOptions } from "@/lib/buy-now";

type Props = {
  loading: string | null;
  onSelect: (paymentId: string, paymentName: string) => void;
};

export const PaymentOptions = memo(function PaymentOptions({ loading, onSelect }: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Payment Options</p>
      <h3 className="mt-2 font-display text-3xl text-navy">Pay using UPI apps</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Razorpay will open in UPI mode. On Android mobile, supported apps such as Google Pay or
        PhonePe can open directly; on desktop, Razorpay may show a UPI QR instead.
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        {paymentOptions.map((option) => {
          const processing = loading === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(loading)}
              onClick={() => onSelect(option.id, option.name)}
              className="flex min-h-24 flex-1 items-center justify-center rounded-lg border border-border bg-white px-5 py-4 shadow-md transition duration-300 ease-in-out hover:scale-105 hover:border-gold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processing ? (
                <span className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-navy">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-r-transparent" />
                  Processing
                </span>
              ) : (
                <img
                  src={option.logo}
                  alt={option.name}
                  className="h-10 w-auto object-contain"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
