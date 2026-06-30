"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, MailCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "./AuthShell";
import {
  resendEmailVerification,
  verifyEmail,
} from "@/lib/api/auth.client";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [developmentCode, setDevelopmentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    setDevelopmentCode(
      sessionStorage.getItem("free4mood_verification_code") || "",
    );
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await verifyEmail(email, code);
      sessionStorage.removeItem("free4mood_verification_code");
      toast.success("Email verified. You can sign in now.");
      router.replace(`/login?verified=1&email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const response = await resendEmailVerification(email);
      const devCode = response.data?.developmentCode;
      if (devCode) {
        sessionStorage.setItem("free4mood_verification_code", devCode);
        setDevelopmentCode(devCode);
      }
      setCooldown(60);
      toast.success("A new verification code was sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell mode="verify">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase text-[var(--mood-coral)]">
          Verify your email
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--mood-ink)]">
          Enter the six-digit code
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--mood-muted)]">
          We sent a short-lived code to your inbox.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--mood-ink)]">
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-4 text-sm outline-none focus:border-[var(--mood-jade)]"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--mood-ink)]">
          Verification code
          <div className="relative mt-2">
            <MailCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              placeholder="000000"
              className="h-14 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-12 text-center text-xl font-bold tracking-[0.35em] outline-none focus:border-[var(--mood-jade)]"
              required
            />
          </div>
        </label>

        {developmentCode ? (
          <p className="rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface-soft)] p-3 text-xs text-[var(--mood-muted)]">
            Development code: <strong>{developmentCode}</strong>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--mood-coral)] text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Verify email
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <button
        type="button"
        onClick={resend}
        disabled={resending || cooldown > 0 || !email}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--mood-line)] text-sm font-bold text-[var(--mood-ink)] disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        {resending
          ? "Sending..."
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend code"}
      </button>

      <p className="mt-6 text-center text-sm text-[var(--mood-muted)]">
        Already verified?{" "}
        <Link href="/login" className="font-bold text-[var(--mood-jade)]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

