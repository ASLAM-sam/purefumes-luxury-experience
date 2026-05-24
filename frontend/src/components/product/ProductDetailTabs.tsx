import { memo } from "react";
import { Sparkles } from "lucide-react";
import type { Product } from "@/data/products";
import { NotesGrid } from "@/components/product/NotesGrid";
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
                  About this fragrance
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-navy/70">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span>
                      <span className="font-medium text-navy">Category:</span>{" "}
                      {product.category}
                    </span>
                  </div>
                  {product.type ? (
                    <div className="flex items-center gap-3 text-sm text-navy/70">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span>
                        <span className="font-medium text-navy">Type:</span> {product.type}
                      </span>
                    </div>
                  ) : null}
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
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
});
