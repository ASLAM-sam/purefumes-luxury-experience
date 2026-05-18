import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { policies } from "@/data/policies";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Understand Purefumes Hyderabad refund and cancellation rules, including cancellation windows, refund eligibility, processing time, damaged product handling, and payment reversals.",
      },
      { property: "og:title", content: "Refund & Cancellation Policy | Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad refund timelines, cancellation windows, payment reversals, and damaged or missing item verification.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return <PolicyLayout {...policies.refund} />;
}
