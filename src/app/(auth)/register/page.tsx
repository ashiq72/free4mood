"use client";

import { createUser } from "@/lib/api/user/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

enum GenderEnum {
  male = "male",
  female = "female",
  other = "other",
}

interface IFormInput {
  firstName: string;
  lastName: string;
  gender: GenderEnum;
  phone: string; // Use string to avoid number loss
  password: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);

    try {
      await createUser(data);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reusable Form Field Component
  const FormField = ({
    label,
    children,
    error,
  }: {
    label: string;
    children: React.ReactNode;
    error?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-700 block">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white/50 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="text-gray-600 text-sm">
            Join our platform in just a minute ✨
          </p>
        </div>

        {/* First Name */}
        <FormField label="First Name" error={errors.firstName?.message}>
          <input
            {...register("firstName", {
              required: "First name is required",
              minLength: { value: 2, message: "At least 2 characters" },
            })}
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-4 focus:ring-blue-300/40 outline-none"
            placeholder="Enter first name"
          />
        </FormField>

        {/* Last Name */}
        <FormField label="Last Name" error={errors.lastName?.message}>
          <input
            {...register("lastName", {
              required: "Last name is required",
            })}
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-4 focus:ring-blue-300/40 outline-none"
            placeholder="Enter last name"
          />
        </FormField>

        {/* Gender */}
        <FormField label="Gender" error={errors.gender?.message}>
          <select
            {...register("gender", { required: "Gender is required" })}
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-4 focus:ring-blue-300/40 outline-none"
          >
            <option value="">Choose gender...</option>
            <option value={GenderEnum.male}>Male</option>
            <option value={GenderEnum.female}>Female</option>
            <option value={GenderEnum.other}>Other</option>
          </select>
        </FormField>

        {/* Phone */}
        <FormField label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{11}$/,
                message: "Phone must be 11 digits",
              },
            })}
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-4 focus:ring-blue-300/40 outline-none"
            placeholder="01XXXXXXXXX"
          />
        </FormField>

        {/* Password */}
        <FormField label="Password" error={errors.password?.message}>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                message: "Must include letters & numbers",
              },
            })}
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-4 focus:ring-blue-300/40 outline-none"
            placeholder="Enter password"
          />
        </FormField>

        {/* Login Link */}
        <p className="text-center text-gray-700 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 underline font-semibold">
            Login
          </Link>
        </p>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all bg-gradient-to-r 
            from-blue-600 to-purple-600 
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
