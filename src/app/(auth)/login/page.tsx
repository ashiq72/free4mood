"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/auth/auth";

interface IFormInput {
  phone: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  // --- Phone validation helper ---
  const validatePhone = (phone: string) => /^01[0-9]{9}$/.test(phone.trim());

  const onSubmit: SubmitHandler<IFormInput> = async ({ phone, password }) => {
    setLoading(true);

    try {
      const cleanedPhone = phone.trim();

      if (!validatePhone(cleanedPhone)) {
        toast.error("Invalid phone number!");
        return;
      }

      await loginUser({ phone: cleanedPhone, password });

      toast.success("Login successful");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md backdrop-blur-xl bg-white/40 shadow-2xl border border-white/30 rounded-3xl p-10 space-y-6 transition-all"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>

        {/* ---- Input Group Component (Refactor-ready) ---- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Phone :</label>
          <input
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^01[0-9]{9}$/,
                message: "Enter a valid BD phone number (11 digits)",
              },
            })}
            placeholder="Enter phone number"
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 
            focus:ring-4 focus:ring-blue-400/40 transition-all"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Password :
          </label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 
            focus:ring-4 focus:ring-blue-400/40 transition-all"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <p className="text-center text-gray-700 text-sm">
          Not registered yet?{" "}
          <Link
            href="/register"
            className="text-blue-700 font-semibold underline"
          >
            Create an account
          </Link>
        </p>

        {/* ---- Button ---- */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 
          text-white font-bold shadow-lg transition-all flex items-center justify-center
          ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Logging in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
