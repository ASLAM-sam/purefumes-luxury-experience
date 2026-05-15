type DeferredFallbackOptions = {
  minHeightClass: string;
  tone?: "background" | "beige";
};

export const adaptiveComponentFactory = {
  createDeferredFallback({ minHeightClass, tone = "background" }: DeferredFallbackOptions) {
    const backgroundClass = tone === "beige" ? "bg-beige/20" : "bg-background";

    return <div className={`${minHeightClass} ${backgroundClass}`} aria-hidden="true" />;
  },

  productCardVariant(options: {
    isPromoted?: boolean;
    isMobile?: boolean;
    reduceMotion?: boolean;
  }): "default" | "bestseller" {
    if (options.isPromoted) return "bestseller";
    return "default";
  },
};
