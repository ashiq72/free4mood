"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import {
  forgotPassword,
  type ForgotPasswordPayload,
} from "@/lib/api/auth.client";

type ForgotFormValues = ForgotPasswordPayload;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>();

  const onSubmit: SubmitHandler<ForgotFormValues> = async (values) => {
    setLoading(true);
    try {
      await forgotPassword({
        phone: values.phone.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Password reset successfully. Please login.");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md backdrop-blur-xl bg-white/40 shadow-2xl border border-white/30 rounded-3xl p-10 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reset Password
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Phone</label>
          <input
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^01[0-9]{9}$/,
                message: "Enter a valid BD phone number (11 digits)",
              },
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 transition-all"
            placeholder="Enter your phone"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            New Password
          </label>
          <input
            type="password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 transition-all"
            placeholder="Enter new password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value, formValues) =>
                value === formValues.newPassword || "Passwords do not match",
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 transition-all"
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <p className="text-center text-gray-700 text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-700 font-semibold underline">
            Back to login
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg transition-all ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

