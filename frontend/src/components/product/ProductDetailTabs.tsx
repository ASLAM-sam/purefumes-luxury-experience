import { memo } from "react";
import { Clock3, Sparkles, SunMedium, Wind } from "lucide-react";
import type { Product } from "@/data/products";
import { AccordBars } from "@/components/product/AccordBars";
import { NotesGrid } from "@/components/product/NotesGrid";
import { SeasonBadges } from "@/components/product/SeasonBadges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProductDetailTabs = memo(function ProductDetailTabs({ product }: { product: Product }) {
  const hasNotes =
    product.topNotes.length > 0 || product.middleNotes.length > 0 || product.baseNotes.length > 0;

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">Product Details</p>
          <h2 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
            Everything about this fragrance
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-navy/60">
          Explore the story, the structure, and the ideal wearing moments before you commit.
        </p>
      </div>

      <Tabs defaultValue="description" className="mt-8">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1.5rem] bg-beige/70 p-2">
          <TabsTrigger
            value="description"
            className="rounded-full px-5 py-2 text-xs uppercase tracking-[0.24em] data-[state=active]:bg-navy data-[state=active]:text-beige"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-full px-5 py-2 text-xs uppercase tracking-[0.24em] data-[state=active]:bg-navy data-[state=active]:text-beige"
          >
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="rounded-full px-5 py-2 text-xs uppercase tracking-[0.24em] data-[state=active]:bg-navy data-[state=active]:text-beige"
          >
            Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-soft sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
              <div>
                <p className="text-sm leading-8 text-navy/72 sm:text-base">
                  {product.description || "This fragrance arrives with a polished, versatile profile crafted for daily wear and memorable occasions alike."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-card p-5">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">
                  Fragrance mood
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-navy/70">
                    <Sparkles className="h-4 w-4 text-gold" />
                    {product.category}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy/70">
                    <SunMedium className="h-4 w-4 text-gold" />
                    {product.usage}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy/70">
                    <Clock3 className="h-4 w-4 text-gold" />
                    {product.bestTime.length > 0 ? product.bestTime.join(", ") : "Anytime wear"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="space-y-6 rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-soft sm:p-8">
            {hasNotes ? (
              <NotesGrid
                top={product.topNotes}
                middle={product.middleNotes}
                base={product.baseNotes}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-card/60 px-5 py-10 text-center text-sm text-navy/50">
                Detailed note information has not been added for this fragrance yet.
              </div>
            )}

            {product.accords.length > 0 ? (
              <div className="rounded-[1.5rem] border border-border/60 bg-card p-5 sm:p-6">
                <p className="mb-5 text-[0.65rem] uppercase tracking-[0.3em] text-navy/55">
                  Main accords
                </p>
                <AccordBars accords={product.accords} />
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <div className="rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-soft sm:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border/60 bg-card p-5">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-gold" />
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">
                    Longevity
                  </p>
                </div>
                <p className="mt-4 font-display text-2xl text-navy">{product.longevity}</p>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-card p-5">
                <div className="flex items-center gap-3">
                  <Wind className="h-4 w-4 text-gold" />
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">
                    Sillage
                  </p>
                </div>
                <p className="mt-4 font-display text-2xl text-navy">{product.sillage}</p>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-card p-5">
                <div className="flex items-center gap-3">
                  <SunMedium className="h-4 w-4 text-gold" />
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">
                    Recommended use
                  </p>
                </div>
                <p className="mt-4 font-display text-2xl text-navy">{product.usage}</p>
              </div>
            </div>

            {product.bestTime.length > 0 ? (
              <div className="mt-8">
                <p className="mb-3 text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">
                  Best time to wear
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.bestTime.map((time) => (
                    <span
                      key={time}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.2em] text-navy/70"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <p className="mb-3 text-[0.65rem] uppercase tracking-[0.24em] text-navy/50">Seasons</p>
              <SeasonBadges seasons={product.seasons} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
});
