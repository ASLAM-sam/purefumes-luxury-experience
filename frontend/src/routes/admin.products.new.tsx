import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { useNotification } from "@/context/NotificationContext";
import { productsApi } from "@/services/api";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const nav = useNavigate();
  const { addNotification } = useNotification();
  return (
    <AdminShell>
      <header>
        <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Catalog</p>
        <h1 className="font-display text-4xl text-navy mt-1">New Product</h1>
      </header>
      <div className="mt-8 max-w-4xl bg-card rounded-2xl p-8 shadow-soft border border-border/60">
        <ProductForm
          resetOnSuccess
          submitLabel="Create Product"
          onSubmit={async (payload) => {
            await productsApi.createWithImages(payload);
            addNotification("Product added to MongoDB.");
            nav({ to: "/admin/products" });
          }}
        />
      </div>
    </AdminShell>
  );
}
