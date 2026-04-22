import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { productsApi } from "@/services/api";

export const Route = createFileRoute("/admin/products/$id")({
  loader: async ({ params }) => {
    const product = await productsApi.get(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: EditProduct,
  notFoundComponent: () => (
    <AdminShell>
      <div className="text-navy">Product not found.</div>
    </AdminShell>
  ),
  errorComponent: ({ error }) => (
    <AdminShell>
      <div className="text-red-600">{error.message}</div>
    </AdminShell>
  ),
});

function EditProduct() {
  const { product } = Route.useLoaderData();
  const nav = useNavigate();
  return (
    <AdminShell>
      <header>
        <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Edit</p>
        <h1 className="font-display text-4xl text-navy mt-1">{product.name}</h1>
      </header>
      <div className="mt-8 max-w-4xl bg-card rounded-2xl p-8 shadow-soft border border-border/60">
        <ProductForm
          initial={product}
          submitLabel="Save Changes"
          onSubmit={async (payload) => {
            await productsApi.updateWithImages(product.id, payload);
            nav({ to: "/admin/products" });
          }}
        />
      </div>
    </AdminShell>
  );
}
