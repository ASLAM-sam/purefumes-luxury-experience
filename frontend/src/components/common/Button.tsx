import { memo, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "navy" | "gold" | "outline" | "ghost";
  children: ReactNode;
};

export const Button = memo(function Button({ variant = "navy", className = "", children, ...rest }: Props) {
  const base = "inline-flex items-center justify-center px-7 py-3 rounded-xl text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    navy: "bg-navy text-beige hover:opacity-90 shadow-soft",
    gold: "bg-gold text-navy hover:scale-[1.02] shadow-luxe",
    outline: "border border-navy text-navy hover:bg-navy hover:text-beige",
    ghost: "text-navy hover:text-gold",
  } as const;
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
});
