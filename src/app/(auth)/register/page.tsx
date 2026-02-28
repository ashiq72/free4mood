"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ArrowRight, Lock, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "@/lib/api/user";
import { GenderEnum, IFormInput } from "@/features/auth/types";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const selectClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    try {
      await createUser(data);
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
    <div className="auth-page-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_42%)] p-4 sm:p-6">
      <div className="auth-float pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="auth-float pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-indigo-300/35 blur-3xl" style={{ animationDelay: "1.4s" }} />
      <div className="auth-float pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl" style={{ animationDelay: "0.8s" }} />

      <div className="auth-card-enter relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_35px_85px_-35px_rgba(15,23,42,0.55)] backdrop-blur md:grid-cols-2">
        <div className="auth-panel-enter relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-800 p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-blue-200/20 blur-2xl" />
          <div className="pointer-events-none absolute bottom-10 left-8 h-24 w-24 rounded-full border border-blue-100/40" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
              Free4Mood
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight">
              Create your account.
            </h1>
            <p className="mt-3 text-sm text-slate-200">
              Join the community and start sharing instantly.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-200">
            <p>Build your profile.</p>
            <p>Find people and connect.</p>
            <p>Post, react, and chat in one place.</p>
          </div>
        </div>

        <div className="auth-form-enter p-6 sm:p-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Register
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Create a new account
            </h2>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              The first load may take up to 40 seconds. Please wait.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("name", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                  placeholder="Enter your name"
                  className={inputClassName}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select
                {...register("gender", { required: "Gender is required" })}
                className={selectClassName}
              >
                <option value="">Choose gender</option>
                <option value={GenderEnum.male}>Male</option>
                <option value={GenderEnum.female}>Female</option>
                <option value={GenderEnum.other}>Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: "Phone must be 11 digits",
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
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                      message: "Must include letters and numbers",
                    },
                  })}
                  placeholder="Create password"
                  className={inputClassName}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
