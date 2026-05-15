import { memo, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
  variant?: "navy" | "gold" | "outline" | "ghost" | "destructive" | "soft";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export const Button = memo(function Button({
  variant = "navy",
  size = "md",
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    navy:
      "bg-navy text-beige shadow-soft hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_15px_rgba(212,175,55,0.38)]",
    gold:
      "bg-gold text-navy shadow-luxe hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(212,175,55,0.48)]",
    outline:
      "border border-navy text-navy hover:-translate-y-0.5 hover:bg-navy hover:text-beige hover:shadow-[0_0_15px_rgba(212,175,55,0.28)]",
    ghost: "text-navy hover:-translate-y-0.5 hover:text-gold",
    destructive:
      "bg-red-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]",
    soft:
      "border border-white/70 bg-white/80 text-navy shadow-[0_12px_28px_rgba(7,31,63,0.08)] hover:-translate-y-0.5 hover:bg-white",
  } as const;
  const sizes = {
    sm: "px-4 py-2 text-[0.65rem] tracking-[0.24em]",
    md: "px-7 py-3 text-xs tracking-[0.25em]",
    lg: "px-8 py-3.5 text-sm tracking-[0.28em]",
  } as const;
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
});
