import { useState, type FormEvent } from "react";
import { Bell, CheckCircle2, Mail, Phone } from "lucide-react";
import type { Product } from "@/data/products";
import { Button } from "@/components/common/Button";
import { productsApi } from "@/services/api";
import { useNotification } from "@/context/NotificationContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(-10);

export function ProductAvailabilityNotify({ product }: { product: Product }) {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    let isValid = true;

    setEmailError("");
    setPhoneError("");
    setStatusMessage("");

    if (!normalizedEmail) {
      setEmailError("Enter your email address.");
      isValid = false;
    } else if (!emailPattern.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    }

    if (!normalizedPhone) {
      setPhoneError("Enter your mobile number.");
      isValid = false;
    } else if (!phonePattern.test(normalizedPhone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      isValid = false;
    }

    return isValid ? { email: normalizedEmail, phone: normalizedPhone } : null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = validate();

    if (!payload) return;

    setLoading(true);
    try {
      const response = await productsApi.notifyWhenAvailable(product.id, payload);
      const message = response.alreadySubscribed
        ? "You've already subscribed for this product."
        : "You're on the list. We'll notify you when it returns.";

      setSubmitted(true);
      setStatusMessage(message);
      addNotification(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Subscription could not be saved.";
      setStatusMessage(message);
      addNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-gold/30 bg-beige/45 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy shadow-[0_14px_24px_rgba(201,161,74,0.24)]">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-navy">Notify Me When Available</h2>
          <p className="mt-2 text-sm leading-6 text-navy/62">
            This fragrance is currently out of stock. Leave your details and we'll notify you as
            soon as it becomes available.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-navy/52">
            Email Address
          </span>
          <span className="mt-2 flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-white/85 px-4 transition focus-within:border-gold/70">
            <Mail className="h-4 w-4 shrink-0 text-gold" />
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
              }}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-navy/34"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading || submitted}
            />
          </span>
          {emailError ? <p className="mt-2 text-xs text-red-600">{emailError}</p> : null}
        </label>

        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-navy/52">
            Mobile Number
          </span>
          <span className="mt-2 flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-white/85 px-4 transition focus-within:border-gold/70">
            <Phone className="h-4 w-4 shrink-0 text-gold" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setPhoneError("");
              }}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-navy/34"
              placeholder="9876543210"
              autoComplete="tel"
              inputMode="tel"
              disabled={loading || submitted}
            />
          </span>
          {phoneError ? <p className="mt-2 text-xs text-red-600">{phoneError}</p> : null}
        </label>

        <Button
          type="submit"
          variant="gold"
          disabled={loading || submitted}
          className="min-h-[52px] w-full gap-2"
        >
          {submitted ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {loading ? "Saving..." : submitted ? "Notification Saved" : "Notify Me"}
        </Button>
      </form>

      <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-navy/60">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        We'll only contact you once this product is back in stock.
      </p>

      {statusMessage ? (
        <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-navy/70">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
