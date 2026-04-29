import { memo, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "navy" | "gold" | "outline" | "ghost";
  children: ReactNode;
};

export const Button = memo(function Button({ variant = "navy", className = "", children, ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-7 py-3 text-xs font-medium uppercase tracking-[0.25em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    navy:
      "bg-navy text-beige shadow-soft hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_15px_rgba(212,175,55,0.38)]",
    gold:
      "bg-gold text-navy shadow-luxe hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(212,175,55,0.48)]",
    outline:
      "border border-navy text-navy hover:-translate-y-0.5 hover:bg-navy hover:text-beige hover:shadow-[0_0_15px_rgba(212,175,55,0.28)]",
    ghost: "text-navy hover:-translate-y-0.5 hover:text-gold",
  } as const;
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
});
