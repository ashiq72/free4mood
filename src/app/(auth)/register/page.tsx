"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { createUser } from "@/lib/api/user";
import { GenderEnum, IFormInput } from "@/features/auth/types";

const inputClassName =
  "h-12 w-full rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-11 pr-12 text-sm text-[var(--mood-ink)] outline-none transition placeholder:text-[var(--mood-muted)] focus:border-[var(--mood-jade)] focus:ring-2 focus:ring-[color:var(--mood-jade)]/10";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    try {
      await createUser({
        ...data,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
      });
      toast.success("Account created successfully");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="register">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase text-[var(--mood-coral)]">
          Join the circle
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--mood-ink)]">
          Create your space
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--mood-muted)]">
          One account for your moments, people, and conversations.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-semibold text-[var(--mood-ink)]"
            >
              Full name
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
              <input
                id="register-name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                {...register("name", {
                  required: "Full name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
                placeholder="Your name"
                className={inputClassName}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-gender"
              className="mb-2 block text-sm font-semibold text-[var(--mood-ink)]"
            >
              Gender
            </label>
            <div className="relative">
              <select
                id="register-gender"
                aria-invalid={Boolean(errors.gender)}
                {...register("gender", { required: "Gender is required" })}
                className="h-12 w-full appearance-none rounded-md border border-[var(--mood-line)] bg-[var(--mood-surface)] px-3 pr-10 text-sm text-[var(--mood-ink)] outline-none transition focus:border-[var(--mood-jade)] focus:ring-2 focus:ring-[color:var(--mood-jade)]/10"
              >
                <option value="">Choose</option>
                <option value={GenderEnum.male}>Male</option>
                <option value={GenderEnum.female}>Female</option>
                <option value={GenderEnum.other}>Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            </div>
            {errors.gender && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-semibold text-[var(--mood-ink)]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            <input
              id="register-email"
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
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-semibold text-[var(--mood-ink)]"
          >
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mood-muted)]" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                  message: "Use at least one letter and one number",
                },
              })}
              placeholder="At least 6 characters"
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
          {errors.password ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.password.message}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[var(--mood-muted)]">
              Include letters and numbers.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--mood-coral)] px-4 text-sm font-bold text-white transition hover:bg-[var(--mood-coral-deep)] disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--mood-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[var(--mood-jade)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
