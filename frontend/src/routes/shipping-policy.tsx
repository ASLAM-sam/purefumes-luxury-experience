import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { policies } from "@/data/policies";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Read the Purefumes Hyderabad Shipping Policy covering order processing, 1-3 business day dispatch, India delivery timelines, courier delays, and tracking details.",
      },
      { property: "og:title", content: "Shipping Policy | Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad shipping details, processing timelines, delivery expectations across India, and support information.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return <PolicyLayout {...policies.shipping} />;
}
