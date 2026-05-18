import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { policies } from "@/data/policies";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Read the Purefumes Hyderabad Privacy Policy covering customer data, account information, payment security, cookies, third-party services, and user rights.",
      },
      { property: "og:title", content: "Privacy Policy | Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Purefumes Hyderabad customer privacy, payment security, data use, cookies, and support contact information.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return <PolicyLayout {...policies.privacy} />;
}
