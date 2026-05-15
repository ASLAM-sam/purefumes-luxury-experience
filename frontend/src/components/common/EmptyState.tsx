import { memo, type ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 px-6 py-10 text-center shadow-[0_18px_40px_rgba(7,31,63,0.08)] ${className}`}
    >
      {icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 font-display text-2xl text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-navy/60">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
});
