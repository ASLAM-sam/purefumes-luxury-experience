import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { policies } from "@/data/policies";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Review Purefumes Hyderabad website terms for product information, pricing, availability, order acceptance, customer responsibilities, liability, and governing law.",
      },
      { property: "og:title", content: "Terms & Conditions | Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad ecommerce terms covering browsing, ordering, payments, delivery, and customer responsibilities.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return <PolicyLayout {...policies.terms} />;
}
