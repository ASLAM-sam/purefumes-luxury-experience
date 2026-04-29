import { memo, useEffect, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src?: string;
  alt: string;
  wrapperClassName?: string;
  placeholderSrc?: string;
  fallback?: ReactNode;
};

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  placeholderSrc,
  fallback,
  loading = "lazy",
  decoding = "async",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={cn(
          "flex h-full w-full animate-pulse items-center justify-center bg-beige text-sm uppercase tracking-[0.24em] text-navy/35",
          wrapperClassName,
        )}
      >
        No image
      </div>
    );
  }

  return (
    <span className={cn("relative block h-full w-full overflow-hidden", wrapperClassName)}>
      {!loaded ? (
        <span className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(235,222,212,0.85),rgba(255,255,255,0.72),rgba(235,222,212,0.85))] bg-[length:220%_100%]" />
      ) : null}

      {placeholderSrc && !loaded ? (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn("absolute inset-0 h-full w-full scale-105 object-cover blur-lg", className)}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <img
        {...props}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setFailed(true);
          onError?.(event);
        }}
        className={cn(
          className,
          "transition-[filter,opacity,transform] duration-500 ease-out",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        )}
      />
    </span>
  );
});
