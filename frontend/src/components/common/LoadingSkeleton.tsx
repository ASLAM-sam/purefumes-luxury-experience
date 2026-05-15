import { memo } from "react";

type Props = {
  className?: string;
};

export const LoadingSkeleton = memo(function LoadingSkeleton({ className = "" }: Props) {
  return <div className={`animate-pulse rounded-2xl bg-navy/8 ${className}`} />;
});
