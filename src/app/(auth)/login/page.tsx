"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ArrowRight, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/auth.client";
import type { LoginPayload } from "@/lib/api/auth.client";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  const onSubmit: SubmitHandler<LoginPayload> = async ({ phone, password }) => {
    setLoading(true);
    try {
      const cleanedPhone = phone.trim();
      if (!/^01[0-9]{9}$/.test(cleanedPhone)) {
        toast.error("Enter a valid phone number");
        return;
      }

      await loginUser({ phone: cleanedPhone, password });
      toast.success("Login successful");
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_42%)] p-4 sm:p-6">
      <div className="auth-float pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-300/35 blur-3xl" />
      <div className="auth-float pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" style={{ animationDelay: "1.2s" }} />
      <div className="auth-float pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl" style={{ animationDelay: "0.6s" }} />

      <div className="auth-card-enter relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_35px_85px_-35px_rgba(15,23,42,0.55)] backdrop-blur md:grid-cols-2">
        <div className="auth-panel-enter relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute bottom-10 left-8 h-24 w-24 rounded-full border border-white/40" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
              Free4Mood
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight">
              Welcome back.
            </h1>
            <p className="mt-3 text-sm text-blue-100">
              Sign in to continue your feed, messages, and notifications.
            </p>
          </div>

          <div className="space-y-3 text-sm text-blue-100">
            <p>Share posts with your circle.</p>
            <p>Stay connected in real time.</p>
            <p>Manage everything from one account.</p>
          </div>
        </div>

        <div className="auth-form-enter p-6 sm:p-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Login
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              The first load may take up to 40 seconds. Please wait.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^01[0-9]{9}$/,
                      message: "Enter 11-digit BD phone number",
                    },
                  })}
                  placeholder="01XXXXXXXXX"
                  className={inputClassName}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  placeholder="Enter password"
                  className={inputClassName}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
              <div className="pt-1 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
