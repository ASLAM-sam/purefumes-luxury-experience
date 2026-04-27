import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductPageSkeleton() {
  return (
    <SiteShell>
      <section className="pb-32 pt-10 sm:pt-12 lg:pb-16">
        <Container>
          <Skeleton className="h-4 w-40" />

          <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.18fr)_minmax(21rem,0.82fr)]">
            <div className="grid gap-4 xl:grid-cols-[5.25rem_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 xl:order-1 xl:flex-col">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-20 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="order-1 aspect-[4/5] rounded-[2rem] sm:aspect-square xl:order-2" />
            </div>

            <div className="space-y-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-56 rounded-[2rem]" />
              <Skeleton className="h-28 rounded-[1.5rem]" />
              <Skeleton className="h-48 rounded-[1.75rem]" />
            </div>
          </div>

          <Skeleton className="mt-10 h-44 rounded-[2rem]" />
          <Skeleton className="mt-10 h-[28rem] rounded-[2rem]" />

          <div className="mt-14">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-10 w-72" />
            <div className="mt-8 flex gap-6 overflow-x-auto no-scrollbar">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="min-w-[78vw] shrink-0 sm:min-w-[20rem] lg:min-w-[22rem]">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="mt-4 h-3 w-20" />
                  <Skeleton className="mt-3 h-6 w-40" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
