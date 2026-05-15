import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const token = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("token") || "",
    [],
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setMessage("Verification token is missing.");
      return;
    }

    accountApi
      .verifyEmail(token)
      .then(() => setMessage("Email verified successfully."))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Verification failed."));
  }, [token]);

  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-soft">
            <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
            <h1 className="mt-5 font-display text-4xl text-navy">Email Verification</h1>
            <p className="mt-4 text-sm text-navy/65">{message}</p>
            <Link to="/profile" className="mt-6 inline-flex rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.22em] text-beige">
              Go to Profile
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
