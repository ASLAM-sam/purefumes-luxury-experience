import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { policies } from "@/data/policies";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Read the Purefumes Hyderabad Return Policy for return eligibility, timelines, product condition rules, non-returnable items, replacements, and return shipping.",
      },
    ],
  }),
  component: ReturnPolicyPage,
});

function ReturnPolicyPage() {
  return <PolicyLayout {...policies.return} />;
}
