"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/components/AuthShell";
import {
  decodeAccessTokenUser,
  loginUser,
} from "@/lib/api/auth.client";
import type { LoginPayload } from "@/lib/api/auth.client";
import { useUser } from "@/shared/context/UserContext";

const inputClassName =
  "h-12 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-11 pr-12 text-sm text-[var(--mood-ink)] outline-none transition placeholder:text-[var(--mood-muted)] focus:border-[var(--mood-jade)] focus:ring-2 focus:ring-[color:var(--mood-jade)]/10";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  const onSubmit: SubmitHandler<LoginPayload> = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });
      const user = decodeAccessTokenUser(response.data.accessToken);
      if (!user) {
        throw new Error("The server returned an invalid session");
      }

      setUser(user);
      toast.success("Login successful");
      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase text-[var(--mood-coral)]">
          Member access
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--mood-ink)]">
          Sign in to your pulse
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--mood-muted)]">
          Pick up where your conversations left off.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm font-semibold text-[var(--mood-ink)]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-[var(--mood-ink)]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[var(--mood-jade)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              placeholder="Enter your password"
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[var(--mood-muted)] hover:bg-[var(--mood-surface-soft)] hover:text-[var(--mood-ink)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--mood-ink)] px-4 text-sm font-bold text-white transition hover:bg-[var(--mood-coral)] disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--mood-line)]" />
        <span className="text-[11px] font-semibold uppercase text-[var(--mood-muted)]">
          New to Free4Mood?
        </span>
        <span className="h-px flex-1 bg-[var(--mood-line)]" />
      </div>

      <Link
        href="/register"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] text-sm font-bold text-[var(--mood-ink)] transition hover:border-[var(--mood-ink)]"
      >
        Create your account
      </Link>
    </AuthShell>
  );
}

