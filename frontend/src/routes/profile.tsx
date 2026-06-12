import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Edit,
  Heart,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Container } from "@/components/common/Container";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { SiteShell } from "@/components/layout/SiteShell";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import type { Product } from "@/data/products";
import {
  accountApi,
  type Address,
  type AuthUser,
  type DashboardStats,
  type Order,
} from "@/services/api";
import { setRedirectAfterLogin } from "@/lib/auth-redirect";
import { formatINR } from "@/lib/money";
import { getOrderDisplayId } from "@/lib/order-id";
import { formatOrderStatusLabel, formatPaymentStatusLabel } from "@/lib/order-status";
import { frontendMediator } from "@/lib/performance/mediator";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

type ProfileForm = {
  name: string;
  email: string;
  username: string;
  mobile: string;
};

type AddressForm = {
  fullName: string;
  mobile: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const emptyStats: DashboardStats = {
  totalOrders: 0,
  totalSpent: 0,
  wishlistItems: 0,
  addressCount: 0,
};

const emptyAddressForm: AddressForm = {
  fullName: "",
  mobile: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const toProfileForm = (profile: AuthUser | null): ProfileForm => ({
  name: profile?.name || "",
  email: profile?.email || "",
  username: profile?.username || "",
  mobile: profile?.mobile || "",
});

const toAddressForm = (address?: Address | null, profile?: AuthUser | null): AddressForm => ({
  fullName: address?.fullName || profile?.name || "",
  mobile: address?.mobile || address?.phone || profile?.mobile || "",
  line1: address?.line1 || address?.street || "",
  line2: address?.line2 || address?.landmark || "",
  city: address?.city || "",
  state: address?.state || "",
  postalCode: address?.postalCode || address?.pincode || "",
  country: address?.country || "India",
  isDefault: Boolean(address?.isDefault),
});

const addressFromForm = (form: AddressForm, id?: string): Address => ({
  _id: id,
  fullName: form.fullName.trim(),
  mobile: form.mobile.trim(),
  phone: form.mobile.trim(),
  line1: form.line1.trim(),
  street: form.line1.trim(),
  line2: form.line2.trim(),
  landmark: form.line2.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  postalCode: form.postalCode.trim(),
  pincode: form.postalCode.trim(),
  country: form.country.trim(),
  isDefault: form.isDefault,
});

const validateProfileForm = (form: ProfileForm) => {
  if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
  if (form.username.trim() && !/^[a-z0-9]{1,6}$/.test(form.username.trim())) {
    return "Username must be 1-6 lowercase letters or numbers.";
  }
  if (form.mobile.trim() && !/^[0-9+\-\s()]{7,25}$/.test(form.mobile.trim())) {
    return "Enter a valid phone number.";
  }
  return "";
};

const validateAddressForm = (form: AddressForm) => {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!/^[0-9+\-\s()]{7,25}$/.test(form.mobile.trim())) return "Enter a valid phone number.";
  if (!form.line1.trim()) return "Street address is required.";
  if (!form.city.trim()) return "City is required.";
  if (!form.state.trim()) return "State is required.";
  if (!form.postalCode.trim()) return "Pincode is required.";
  if (
    form.country.trim().toLowerCase() === "india" &&
    !/^[1-9][0-9]{5}$/.test(form.postalCode.trim())
  ) {
    return "Enter a valid 6-digit Indian pincode.";
  }
  if (!form.country.trim()) return "Country is required.";
  return "";
};

const safeNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatCurrency = formatINR;

const formatOrderDate = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusBadgeClass = (status = "") => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "delivered") return "bg-green-50 text-green-700";
  if (normalizedStatus === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (normalizedStatus === "cancelled") return "bg-red-50 text-red-700";
  if (normalizedStatus === "shipped") return "bg-blue-50 text-blue-700";
  if (normalizedStatus === "processing") return "bg-gold/15 text-gold";
  return "bg-navy/10 text-navy/65";
};

const firstOrderItem = (order: Order) => order.items?.[0];

function ProfilePage() {
  const nav = useNavigate();
  const { user, authReady, logout, reloadUser } = useAuth();
  const { removeFromWishlist } = useApp();
  const { addNotification } = useNotification();
  const [profile, setProfile] = useState<AuthUser | null>(user);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>(toProfileForm(user));
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressActionId, setAddressActionId] = useState<string | null>(null);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<Address | null>(null);
  const [wishlistActionId, setWishlistActionId] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !user) {
      setRedirectAfterLogin("/profile");
      nav({ to: "/login" });
    }
  }, [authReady, nav, user]);

  useEffect(() => {
    if (!user) return;
    setProfile((current) => current || user);
    setProfileForm(toProfileForm(user));
  }, [user]);

  const applyProfile = useCallback((nextUser: AuthUser) => {
    const nextAddresses = nextUser.addresses || [];
    setProfile(nextUser);
    setProfileForm(toProfileForm(nextUser));
    setAddresses(nextAddresses);
    setStats((current) => ({
      ...current,
      totalOrders: Number(nextUser.totalOrders || current.totalOrders || 0),
      totalSpent: Number(nextUser.totalSpent || current.totalSpent || 0),
      addressCount: nextAddresses.length,
    }));
  }, []);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const dashboard = await frontendMediator.requestDashboardRefresh({
          reason: "profile-dashboard",
          silent,
          refresh: () => accountApi.dashboard(),
        });
        setProfile(dashboard.user);
        setProfileForm(toProfileForm(dashboard.user));
        setStats({
          totalOrders: safeNumber(dashboard.stats.totalOrders),
          totalSpent: safeNumber(dashboard.stats.totalSpent),
          wishlistItems: safeNumber(dashboard.stats.wishlistItems),
          addressCount: safeNumber(dashboard.stats.addressCount),
        });
        setRecentOrders(dashboard.recentOrders);
        setWishlist(dashboard.wishlist);
        setAddresses(dashboard.addresses);
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Dashboard data could not be loaded.",
          "error",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addNotification, user],
  );

  useEffect(() => {
    if (!authReady || !user) return;
    void loadDashboard();
  }, [authReady, loadDashboard, user]);

  const signOut = useCallback(async () => {
    await logout();
    nav({ to: "/" });
  }, [logout, nav]);

  const refresh = useCallback(async () => {
    await Promise.all([loadDashboard({ silent: true }), reloadUser()]);
  }, [loadDashboard, reloadUser]);

  const openEditProfile = useCallback(() => {
    setProfileForm(toProfileForm(profile));
    setEditOpen(true);
  }, [profile]);

  const saveProfile = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (savingProfile) return;

      const validationError = validateProfileForm(profileForm);
      if (validationError) {
        addNotification(validationError, "error");
        return;
      }

      setSavingProfile(true);
      const previousProfile = profile;
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        username: profileForm.username.trim(),
        mobile: profileForm.mobile.trim(),
      };

      if (previousProfile) {
        applyProfile({
          ...previousProfile,
          ...payload,
          emailVerified:
            payload.email !== previousProfile.email ? false : previousProfile.emailVerified,
        });
      }

      try {
        const nextUser = await accountApi.updateProfile(payload);
        applyProfile(nextUser);
        await reloadUser();
        setEditOpen(false);
        addNotification("Profile updated successfully.", "success");
      } catch (error) {
        if (previousProfile) applyProfile(previousProfile);
        addNotification(
          error instanceof Error ? error.message : "Profile could not be updated.",
          "error",
        );
      } finally {
        setSavingProfile(false);
      }
    },
    [addNotification, applyProfile, profile, profileForm, reloadUser, savingProfile],
  );

  const startAddAddress = useCallback(() => {
    setEditingAddressId(null);
    setAddressForm({ ...toAddressForm(null, profile), isDefault: addresses.length === 0 });
  }, [addresses.length, profile]);

  const startEditAddress = useCallback(
    (address: Address) => {
      setEditingAddressId(address._id || null);
      setAddressForm(toAddressForm(address, profile));
    },
    [profile],
  );

  const openAddressManager = useCallback(() => {
    setAddressOpen(true);
    setEditingAddressId(null);
    setAddressForm({ ...toAddressForm(null, profile), isDefault: addresses.length === 0 });
  }, [addresses.length, profile]);

  const saveAddress = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (savingAddress) return;

      const validationError = validateAddressForm(addressForm);
      if (validationError) {
        addNotification(validationError, "error");
        return;
      }

      setSavingAddress(true);
      const previousAddresses = addresses;
      const optimisticAddress = addressFromForm(
        {
          ...addressForm,
          isDefault: addressForm.isDefault || addresses.length === 0,
        },
        editingAddressId || `temp-${Date.now()}`,
      );
      const nextOptimisticAddresses = editingAddressId
        ? addresses.map((address) =>
            address._id === editingAddressId
              ? optimisticAddress
              : {
                  ...address,
                  isDefault: optimisticAddress.isDefault ? false : Boolean(address.isDefault),
                },
          )
        : [
            ...addresses.map((address) => ({
              ...address,
              isDefault: optimisticAddress.isDefault ? false : Boolean(address.isDefault),
            })),
            optimisticAddress,
          ];

      setAddresses(nextOptimisticAddresses);
      setStats((current) => ({ ...current, addressCount: nextOptimisticAddresses.length }));

      try {
        const payload = {
          fullName: addressForm.fullName.trim(),
          mobile: addressForm.mobile.trim(),
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postalCode: addressForm.postalCode.trim(),
          country: addressForm.country.trim(),
          isDefault: addressForm.isDefault,
        };
        const nextUser = editingAddressId
          ? await accountApi.updateAddress(editingAddressId, payload)
          : await accountApi.addAddress(payload);

        applyProfile(nextUser);
        await reloadUser();
        setEditingAddressId(null);
        setAddressForm(toAddressForm(null, nextUser));
        addNotification(editingAddressId ? "Address updated." : "Address added.", "success");
      } catch (error) {
        setAddresses(previousAddresses);
        setStats((current) => ({ ...current, addressCount: previousAddresses.length }));
        addNotification(
          error instanceof Error ? error.message : "Address could not be saved.",
          "error",
        );
      } finally {
        setSavingAddress(false);
      }
    },
    [
      addNotification,
      addressForm,
      addresses,
      applyProfile,
      editingAddressId,
      reloadUser,
      savingAddress,
    ],
  );

  const requestDeleteAddress = useCallback(
    (address: Address) => {
      if (address.isDefault && addresses.length > 1) {
        addNotification("Set another address as default before deleting this one.", "error");
        return;
      }

      setDeleteAddressTarget(address);
    },
    [addNotification, addresses.length],
  );

  const deleteAddress = useCallback(async () => {
    const addressId = deleteAddressTarget?._id;
    if (!addressId || addressActionId) return;

    setAddressActionId(addressId);
    const previousAddresses = addresses;
    const nextAddresses = addresses.filter((address) => address._id !== addressId);
    setAddresses(nextAddresses);
    setStats((current) => ({ ...current, addressCount: nextAddresses.length }));

    try {
      const nextUser = await accountApi.deleteAddress(addressId);
      applyProfile(nextUser);
      await reloadUser();
      setDeleteAddressTarget(null);
      addNotification("Address deleted.", "info");
    } catch (error) {
      setAddresses(previousAddresses);
      setStats((current) => ({ ...current, addressCount: previousAddresses.length }));
      addNotification(
        error instanceof Error ? error.message : "Address could not be deleted.",
        "error",
      );
    } finally {
      setAddressActionId(null);
    }
  }, [addNotification, addressActionId, addresses, applyProfile, deleteAddressTarget, reloadUser]);

  const setDefaultAddress = useCallback(
    async (addressId?: string) => {
      if (!addressId || addressActionId) return;

      setAddressActionId(addressId);
      const previousAddresses = addresses;
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address._id === addressId,
        })),
      );

      try {
        const nextUser = await accountApi.setDefaultAddress(addressId);
        applyProfile(nextUser);
        await reloadUser();
        addNotification("Default address updated.", "success");
      } catch (error) {
        setAddresses(previousAddresses);
        addNotification(
          error instanceof Error ? error.message : "Default address could not be updated.",
          "error",
        );
      } finally {
        setAddressActionId(null);
      }
    },
    [addNotification, addressActionId, addresses, applyProfile, reloadUser],
  );

  const removeWishlistItem = useCallback(
    async (productId: string) => {
      if (!productId || wishlistActionId) return;

      setWishlistActionId(productId);
      const previousWishlist = wishlist;
      setWishlist((current) => current.filter((product) => product.id !== productId));
      setStats((current) => ({
        ...current,
        wishlistItems: Math.max(0, current.wishlistItems - 1),
      }));

      try {
        const nextWishlist = await removeFromWishlist(productId);
        if (nextWishlist) {
          setWishlist(nextWishlist);
          setStats((current) => ({ ...current, wishlistItems: nextWishlist.length }));
        }
        addNotification("Removed from wishlist.", "info");
      } catch (error) {
        setWishlist(previousWishlist);
        setStats((current) => ({ ...current, wishlistItems: previousWishlist.length }));
        addNotification(
          error instanceof Error ? error.message : "Wishlist could not be updated.",
          "error",
        );
      } finally {
        setWishlistActionId(null);
      }
    },
    [addNotification, removeFromWishlist, wishlist, wishlistActionId],
  );

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0] || null,
    [addresses],
  );

  const resolvedStats = useMemo(
    () => ({
      totalOrders: safeNumber(stats.totalOrders || profile?.totalOrders || 0),
      totalSpent: safeNumber(stats.totalSpent || profile?.totalSpent || 0),
      wishlistItems: safeNumber(stats.wishlistItems || wishlist.length || 0),
      addressCount: safeNumber(stats.addressCount || addresses.length || 0),
    }),
    [addresses.length, profile?.totalOrders, profile?.totalSpent, stats, wishlist.length],
  );

  if (!authReady || !profile) return null;

  const statCards = [
    {
      label: "Total Orders",
      value: resolvedStats.totalOrders.toLocaleString("en-IN"),
      Icon: Package,
      color: "#071f3f",
      link: "/my-orders",
    },
    {
      label: "Total Spent",
      value: formatCurrency(resolvedStats.totalSpent),
      Icon: ShoppingBag,
      color: "#c9a14a",
      link: "/my-orders",
    },
    {
      label: "Wishlist Items",
      value: resolvedStats.wishlistItems.toLocaleString("en-IN"),
      Icon: Heart,
      color: "#dc2626",
      link: "/wishlist",
    },
    {
      label: "Addresses",
      value: resolvedStats.addressCount.toLocaleString("en-IN"),
      Icon: MapPin,
      color: "#4a9d5a",
      action: openAddressManager,
    },
  ];

  return (
    <SiteShell>
      <section className="py-10 md:py-16">
        <Container>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Dashboard</p>
              <h1 className="mt-2 font-display text-4xl text-navy sm:text-5xl">
                Welcome back, {profile.name.split(" ")[0] || "there"}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={refresh} variant="outline" disabled={refreshing || loading}>
                {refreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button onClick={signOut}>Logout</Button>
            </div>
          </header>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <motion.button
                key={stat.label}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-lg border border-border/60 bg-card p-6 text-left shadow-soft transition-shadow hover:shadow-luxe"
                onClick={() => {
                  if (stat.action) {
                    stat.action();
                    return;
                  }

                  if (stat.link === "/my-orders") nav({ to: "/my-orders" });
                  if (stat.link === "/wishlist") nav({ to: "/wishlist" });
                }}
              >
                <span className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-navy/60">
                    {stat.label}
                  </span>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${stat.color}1A` }}
                  >
                    <stat.Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </span>
                </span>
                {loading ? (
                  <span className="mt-4 block h-8 w-24 animate-pulse rounded bg-navy/10" />
                ) : (
                  <span className="mt-4 block font-display text-2xl text-navy">{stat.value}</span>
                )}
              </motion.button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <UserCircle className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-3xl text-navy">{profile.name}</h2>
                      <div className="mt-3 space-y-2 text-sm text-navy/65">
                        <p>{profile.email}</p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" /> {profile.mobile || "Phone not provided"}
                        </p>
                        <p className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          {profile.emailVerified ? "Email verified" : "Email not verified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={openEditProfile}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-navy">Recent Orders</h3>
                  <Link to="/my-orders" className="text-sm text-gold hover:text-gold/80">
                    View all
                  </Link>
                </div>
                {loading ? (
                  <DashboardSkeleton rows={3} />
                ) : recentOrders.length === 0 ? (
                  <EmptyMessage
                    title="No orders yet"
                    body="Your latest purchases will appear here after checkout."
                  />
                ) : (
                  <div className="mt-4 space-y-3">
                    {recentOrders.map((order) => {
                      const item = firstOrderItem(order);
                      return (
                        <div
                          key={order.id || order._id}
                          className="flex flex-col gap-3 rounded-lg bg-beige/30 p-3 sm:flex-row sm:items-center"
                        >
                          <div className="product-fit-frame h-16 w-16 rounded-lg">
                            <OptimizedImage
                              src={item?.productImage || ""}
                              alt={item?.productName || order.productName || "Order item"}
                              width={96}
                              height={96}
                              className="product-fit-image"
                              fallback={
                                <div className="flex h-full w-full items-center justify-center text-navy/45">
                                  <Package className="h-6 w-6" />
                                </div>
                              }
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-navy">
                              {item?.productName ||
                                order.productName ||
                                `Order ${getOrderDisplayId(order)}`}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy/60">
                              <span>
                                Qty {item?.quantity || 1}
                                {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                              </span>
                              <span>{formatOrderDate(order.createdAt)}</span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] ${getStatusBadgeClass(order.status)}`}
                              >
                                {formatOrderStatusLabel(order.status)}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-emerald-700">
                                Payment: {formatPaymentStatusLabel(order.paymentStatus)}
                              </span>
                            </div>
                          </div>
                          <p className="font-medium text-navy">
                            {formatCurrency(safeNumber(order.totalAmount))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-navy">Wishlist</h3>
                  <Link to="/wishlist" className="text-sm text-gold hover:text-gold/80">
                    View all
                  </Link>
                </div>
                {loading ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="aspect-square rounded-lg bg-navy/10" />
                        <div className="mt-2 h-4 rounded bg-navy/10" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-navy/10" />
                      </div>
                    ))}
                  </div>
                ) : wishlist.length === 0 ? (
                  <EmptyMessage
                    title="No wishlist items"
                    body="Saved perfumes will appear here instantly."
                  />
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {wishlist.slice(0, 6).map((product) => (
                      <div key={product.id} className="rounded-lg bg-beige/30 p-3">
                        <Link to="/product/$id" params={{ id: product.id }} className="group block">
                          <div className="product-fit-frame aspect-square rounded-lg">
                            <OptimizedImage
                              src={product.image || product.images?.[0] || ""}
                              alt={product.name}
                              width={220}
                              height={220}
                              className="product-fit-image transition-transform group-hover:scale-[1.01]"
                            />
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm font-medium text-navy">
                            {product.name}
                          </p>
                        </Link>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-navy">
                              {formatCurrency(product.price ?? 0)}
                            </p>
                            <p className="text-xs text-navy/55">
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void removeWishlistItem(product.id)}
                            disabled={wishlistActionId === product.id}
                            className="rounded-full border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            aria-label="Remove from wishlist"
                          >
                            {wishlistActionId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-navy/20 bg-navy p-6 text-beige shadow-luxe">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">
                  Account Summary
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-beige/55">Orders</p>
                    <p className="mt-1 font-display text-3xl">{resolvedStats.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-beige/55">Spent</p>
                    <p className="mt-1 font-display text-2xl">
                      {formatCurrency(resolvedStats.totalSpent)}
                    </p>
                  </div>
                </div>
                <Link
                  to="/my-orders"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-3 text-xs uppercase tracking-[0.18em] text-navy"
                >
                  <Package className="h-4 w-4" /> View Orders
                </Link>
              </div>

              <div
                id="addresses"
                className="rounded-lg border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-navy">Addresses</h3>
                  <Button variant="outline" size="sm" onClick={openAddressManager}>
                    <Edit className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </div>
                {defaultAddress ? (
                  <div className="mt-4 rounded-lg bg-beige/30 p-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-navy">{defaultAddress.fullName}</p>
                      {defaultAddress.isDefault ? (
                        <span className="rounded-full bg-gold/15 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-navy/60">
                      {defaultAddress.line1}
                      {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""},{" "}
                      {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                    </p>
                    <p className="mt-1 text-sm text-navy/60">{defaultAddress.mobile}</p>
                  </div>
                ) : (
                  <EmptyMessage
                    title="No addresses saved"
                    body="Add a delivery address for faster checkout."
                    compact
                  />
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
                <h3 className="font-display text-xl text-navy">Quick Actions</h3>
                <div className="mt-4 space-y-3">
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-beige/30"
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-navy">My Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-beige/30"
                  >
                    <ShoppingBag className="h-5 w-5 text-navy" />
                    <span className="text-navy">My Cart</span>
                  </Link>
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-beige/30"
                  >
                    <Package className="h-5 w-5 text-gold" />
                    <span className="text-navy">Order History</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {editOpen ? (
        <ProfileModal title="Edit Profile" onClose={() => setEditOpen(false)}>
          <form onSubmit={saveProfile} className="space-y-4">
            <TextInput
              label="Name"
              value={profileForm.name}
              onChange={(value) => setProfileForm((form) => ({ ...form, name: value }))}
            />
            <TextInput
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(value) => setProfileForm((form) => ({ ...form, email: value }))}
            />
            <TextInput
              label="Username"
              value={profileForm.username}
              onChange={(value) =>
                setProfileForm((form) => ({ ...form, username: value.toLowerCase() }))
              }
            />
            <TextInput
              label="Phone"
              inputMode="tel"
              value={profileForm.mobile}
              onChange={(value) => setProfileForm((form) => ({ ...form, mobile: value }))}
            />
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </form>
        </ProfileModal>
      ) : null}

      {addressOpen ? (
        <ProfileModal title="Manage Addresses" onClose={() => setAddressOpen(false)} wide>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3">
              <Button type="button" variant="outline" size="sm" onClick={startAddAddress}>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
              {addresses.length ? (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className="rounded-lg border border-border bg-beige/25 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-navy">{address.fullName}</p>
                          {address.isDefault ? (
                            <span className="rounded-full bg-gold/15 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-navy/60">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                          {address.state} {address.postalCode}
                        </p>
                        <p className="mt-1 text-sm text-navy/60">{address.mobile}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditAddress(address)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void setDefaultAddress(address._id)}
                        disabled={address.isDefault || addressActionId === address._id}
                      >
                        {addressActionId === address._id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        Default
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => requestDeleteAddress(address)}
                        disabled={addressActionId === address._id}
                      >
                        {addressActionId === address._id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyMessage
                  title="No addresses yet"
                  body="Add your first delivery address."
                  compact
                />
              )}
            </div>

            <form onSubmit={saveAddress} className="space-y-4 rounded-lg border border-border p-4">
              <div>
                <p className="font-display text-xl text-navy">
                  {editingAddressId ? "Edit Address" : "Add Address"}
                </p>
                <p className="mt-1 text-sm text-navy/55">
                  Saved addresses stay linked to this account only.
                </p>
              </div>
              <TextInput
                label="Full name"
                value={addressForm.fullName}
                onChange={(value) => setAddressForm((form) => ({ ...form, fullName: value }))}
              />
              <TextInput
                label="Phone"
                inputMode="tel"
                value={addressForm.mobile}
                onChange={(value) => setAddressForm((form) => ({ ...form, mobile: value }))}
              />
              <TextInput
                label="Street"
                value={addressForm.line1}
                onChange={(value) => setAddressForm((form) => ({ ...form, line1: value }))}
              />
              <TextInput
                label="Landmark"
                value={addressForm.line2}
                onChange={(value) => setAddressForm((form) => ({ ...form, line2: value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="City"
                  value={addressForm.city}
                  onChange={(value) => setAddressForm((form) => ({ ...form, city: value }))}
                />
                <TextInput
                  label="State"
                  value={addressForm.state}
                  onChange={(value) => setAddressForm((form) => ({ ...form, state: value }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={addressForm.postalCode}
                  onChange={(value) => setAddressForm((form) => ({ ...form, postalCode: value }))}
                />
                <TextInput
                  label="Country"
                  value={addressForm.country}
                  onChange={(value) => setAddressForm((form) => ({ ...form, country: value }))}
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-navy/70">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) =>
                    setAddressForm((form) => ({ ...form, isDefault: event.target.checked }))
                  }
                  className="h-4 w-4 accent-gold"
                />
                Set as default address
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                {editingAddressId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startAddAddress}
                    disabled={savingAddress}
                  >
                    New
                  </Button>
                ) : null}
                <Button type="submit" disabled={savingAddress}>
                  {savingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingAddressId ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </ProfileModal>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteAddressTarget)}
        title="Delete address"
        message={
          deleteAddressTarget
            ? `Delete the saved address for ${deleteAddressTarget.fullName}? This cannot be undone.`
            : "Delete this saved address?"
        }
        confirmLabel="Delete"
        loading={Boolean(addressActionId && addressActionId === deleteAddressTarget?._id)}
        onClose={() => {
          if (!addressActionId) setDeleteAddressTarget(null);
        }}
        onConfirm={deleteAddress}
      />
    </SiteShell>
  );
}

function DashboardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-navy/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded bg-navy/10" />
            <div className="h-3 w-28 rounded bg-navy/10" />
          </div>
          <div className="h-4 w-20 rounded bg-navy/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyMessage({
  title,
  body,
  compact = false,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "mt-4 rounded-lg bg-beige/30 p-4" : "mt-4 rounded-lg bg-beige/30 p-6 text-center"
      }
    >
      {!compact ? (
        <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Package className="h-5 w-5" />
        </span>
      ) : null}
      <p className="font-medium text-navy">{title}</p>
      <p className="mt-1 text-sm text-navy/55">{body}</p>
    </div>
  );
}

function ProfileModal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-navy/55 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:justify-center">
      <div
        className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-t-2xl border border-white/70 bg-card p-5 shadow-luxe sm:rounded-2xl sm:p-6 ${
          wide ? "sm:max-w-5xl" : "sm:max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-navy">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-navy/65 transition hover:bg-beige/60 hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  maxLength?: number;
}) {
  return (
    <label className="block text-sm font-medium text-navy/70">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      />
    </label>
  );
}
