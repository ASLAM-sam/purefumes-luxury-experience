import { memo, type ChangeEvent } from "react";
import type { AuthUser } from "@/services/api";

export type DeliveryFormValues = {
  name: string;
  email: string;
  phone: string;
  alternatePhone: string;
  houseNumber: string;
  building: string;
  area: string;
  landmark1: string;
  landmark2: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions: string;
  preferredDeliveryTime: string;
  address: string;
};

type DeliveryFieldKey = keyof DeliveryFormValues;
type DeliveryFieldChangeHandler = (
  key: DeliveryFieldKey,
) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

type DeliveryDetailsFieldsProps = {
  form: DeliveryFormValues;
  onChange: DeliveryFieldChangeHandler;
  dense?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold";
const textareaClass =
  "w-full resize-none rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold";

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-navy/55">{children}</p>
);

export const createEmptyDeliveryForm = (): DeliveryFormValues => ({
  name: "",
  email: "",
  phone: "",
  alternatePhone: "",
  houseNumber: "",
  building: "",
  area: "",
  landmark1: "",
  landmark2: "",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "",
  deliveryInstructions: "",
  preferredDeliveryTime: "",
  address: "",
});

export const createDeliveryFormFromUser = (user?: AuthUser | null): DeliveryFormValues => {
  const defaultAddress = user?.addresses?.find((address) => address.isDefault) || user?.addresses?.[0];

  return {
    ...createEmptyDeliveryForm(),
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    houseNumber: defaultAddress?.line1 || defaultAddress?.street || "",
    building: defaultAddress?.line2 || defaultAddress?.landmark || "",
    city: defaultAddress?.city || "Hyderabad",
    state: defaultAddress?.state || "Telangana",
    pincode: defaultAddress?.postalCode || defaultAddress?.pincode || "",
    address: defaultAddress
      ? [
          defaultAddress.line1 || defaultAddress.street,
          defaultAddress.line2 || defaultAddress.landmark,
          defaultAddress.city,
          defaultAddress.state,
          defaultAddress.postalCode || defaultAddress.pincode,
        ]
          .filter(Boolean)
          .join(", ")
      : "",
  };
};

const clean = (value: string) => value.trim();

export const isDeliveryFormComplete = (form: DeliveryFormValues) =>
  Boolean(
    clean(form.name) &&
      clean(form.email) &&
      clean(form.phone) &&
      clean(form.houseNumber) &&
      clean(form.area) &&
      clean(form.city) &&
      clean(form.state) &&
      clean(form.pincode),
  );

export const buildDeliveryAddressText = (form: DeliveryFormValues) => {
  const line1 = [form.houseNumber, form.building, form.area].map(clean).filter(Boolean).join(", ");
  const line2 = [
    form.landmark1 ? `Landmark 1: ${clean(form.landmark1)}` : "",
    form.landmark2 ? `Landmark 2: ${clean(form.landmark2)}` : "",
    form.alternatePhone ? `Alternate phone: ${clean(form.alternatePhone)}` : "",
    form.preferredDeliveryTime ? `Preferred delivery: ${clean(form.preferredDeliveryTime)}` : "",
    form.deliveryInstructions ? `Notes: ${clean(form.deliveryInstructions)}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  const cityLine = [form.city, form.state, form.pincode].map(clean).filter(Boolean).join(", ");

  return [line1, line2, cityLine].filter(Boolean).join("\n");
};

export const buildShippingAddress = (form: DeliveryFormValues) => ({
  fullName: clean(form.name),
  mobile: clean(form.phone),
  phone: clean(form.phone),
  line1: [form.houseNumber, form.building, form.area].map(clean).filter(Boolean).join(", "),
  street: clean(form.area),
  line2: [
    form.landmark1 ? `Landmark 1: ${clean(form.landmark1)}` : "",
    form.landmark2 ? `Landmark 2: ${clean(form.landmark2)}` : "",
    form.alternatePhone ? `Alternate phone: ${clean(form.alternatePhone)}` : "",
    form.preferredDeliveryTime ? `Preferred delivery: ${clean(form.preferredDeliveryTime)}` : "",
    form.deliveryInstructions ? `Notes: ${clean(form.deliveryInstructions)}` : "",
  ]
    .filter(Boolean)
    .join(" | "),
  landmark: [form.landmark1, form.landmark2].map(clean).filter(Boolean).join(", "),
  city: clean(form.city),
  state: clean(form.state),
  postalCode: clean(form.pincode),
  pincode: clean(form.pincode),
  country: "India",
});

export const DeliveryDetailsFields = memo(function DeliveryDetailsFields({
  form,
  onChange,
  dense = false,
}: DeliveryDetailsFieldsProps) {
  return (
    <div className={dense ? "space-y-4" : "space-y-5"}>
      <div className="space-y-3">
        <SectionLabel>Contact Details</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={onChange("name")}
            placeholder="Full name"
            autoComplete="name"
            className={inputClass}
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="Email address"
            autoComplete="email"
            className={inputClass}
          />
          <input
            required
            type="tel"
            value={form.phone}
            onChange={onChange("phone")}
            placeholder="Mobile number"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          />
          <input
            type="tel"
            value={form.alternatePhone}
            onChange={onChange("alternatePhone")}
            placeholder="Alternate phone number"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Delivery Address</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={form.houseNumber}
            onChange={onChange("houseNumber")}
            placeholder="House / flat / apartment number"
            autoComplete="address-line1"
            className={inputClass}
          />
          <input
            value={form.building}
            onChange={onChange("building")}
            placeholder="Building / floor / tower"
            autoComplete="address-line2"
            className={inputClass}
          />
          <input
            required
            value={form.area}
            onChange={onChange("area")}
            placeholder="Area / street / locality"
            className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          />
          <input
            value={form.landmark1}
            onChange={onChange("landmark1")}
            placeholder="Landmark 1"
            className={inputClass}
          />
          <input
            value={form.landmark2}
            onChange={onChange("landmark2")}
            placeholder="Landmark 2"
            className={inputClass}
          />
          <input
            required
            value={form.city}
            onChange={onChange("city")}
            placeholder="City"
            autoComplete="address-level2"
            className={inputClass}
          />
          <input
            required
            value={form.state}
            onChange={onChange("state")}
            placeholder="State"
            autoComplete="address-level1"
            className={inputClass}
          />
          <input
            required
            inputMode="numeric"
            value={form.pincode}
            onChange={onChange("pincode")}
            placeholder="Pincode / ZIP code"
            autoComplete="postal-code"
            className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Delivery Preferences</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.preferredDeliveryTime}
            onChange={onChange("preferredDeliveryTime")}
            placeholder="Preferred delivery time (optional)"
            className={inputClass}
          />
          <textarea
            value={form.deliveryInstructions}
            onChange={onChange("deliveryInstructions")}
            rows={dense ? 2 : 3}
            placeholder="Delivery instructions / notes"
            className={`${textareaClass} sm:col-span-2`}
          />
        </div>
      </div>
    </div>
  );
});
