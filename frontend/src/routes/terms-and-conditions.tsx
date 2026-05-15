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
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return <PolicyLayout {...policies.terms} />;
}
