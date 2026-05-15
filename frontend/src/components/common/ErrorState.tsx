import { memo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/Button";

type Props = {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
};

export const ErrorState = memo(function ErrorState({
  title = "Something needs attention",
  description,
  onRetry,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-[1.75rem] border border-red-200/70 bg-red-50/90 px-6 py-8 text-center shadow-[0_18px_40px_rgba(127,29,29,0.08)] ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/12 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-navy/70">{description}</p>
      {onRetry ? (
        <div className="mt-5">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
});
