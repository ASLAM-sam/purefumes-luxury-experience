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
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return <PolicyLayout {...policies.refund} />;
}
