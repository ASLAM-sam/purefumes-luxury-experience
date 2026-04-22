import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import { ordersApi, productsApi, type Order } from "@/services/api";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { addNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch((error) => {
        setProducts([]);
        addNotification(
          error instanceof Error ? error.message : "Products could not be loaded.",
          "error",
        );
      });

    ordersApi
      .list()
      .then(setOrders)
      .catch((error) => {
        setOrders([]);
        addNotification(
          error instanceof Error ? error.message : "Orders could not be loaded.",
          "error",
        );
      });
  }, [addNotification]);

  const lowStock = products.filter((product) => product.stock <= 10).length;
  const revenue = orders.reduce((sum, order) => sum + (order.totalAmount ?? order.price ?? 0), 0);

  const stats = [
    { label: "Total Products", value: products.length, Icon: Package, color: "#07203F" },
    { label: "Total Orders", value: orders.length, Icon: ShoppingCart, color: "#C9A14A" },
    {
      label: "Revenue (Rs.)",
      value: revenue.toLocaleString("en-IN"),
      Icon: TrendingUp,
      color: "#4A9D5A",
    },
    { label: "Low Stock", value: lowStock, Icon: AlertTriangle, color: "#D97706" },
  ];

  return (
    <AdminShell>
      <header>
        <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Overview</p>
        <h1 className="font-display text-4xl text-navy mt-1">Dashboard</h1>
      </header>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="bg-card rounded-2xl p-6 shadow-soft border border-border/60"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-navy/60">{stat.label}</p>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}1A` }}
              >
                <stat.Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="font-display text-4xl text-navy mt-4">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60">
          <h2 className="font-display text-2xl text-navy mb-4">Recent Orders</h2>
          {orders.length === 0 && <p className="text-sm text-navy/50">No orders yet.</p>}
          <ul className="divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <li
                key={order._id || order.id}
                className="py-3 flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium text-navy">{order.productName || "Order item"}</p>
                  <p className="text-xs text-navy/60">
                    {order.customerName} · {order.size || "-"}
                  </p>
                </div>
                <span className="text-gold font-medium">
                  Rs. {Number(order.price ?? order.totalAmount ?? 0).toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60">
          <h2 className="font-display text-2xl text-navy mb-4">Low Stock Alert</h2>
          {products.filter((product) => product.stock <= 10).length === 0 && (
            <p className="text-sm text-navy/50">All products well-stocked.</p>
          )}
          <ul className="divide-y divide-border">
            {products
              .filter((product) => product.stock <= 10)
              .slice(0, 5)
              .map((product) => (
                <li key={product.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-navy">{product.name}</p>
                    <p className="text-xs text-navy/60">{product.brand}</p>
                  </div>
                  <span className="text-amber-600 font-medium">{product.stock} left</span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
