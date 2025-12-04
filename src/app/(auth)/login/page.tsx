"use client";
import { loginUser } from "@/lib/api/auth/auth";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IFormInput {
  phone: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const router = useRouter();
  const onSubmit: SubmitHandler<IFormInput> = async ({ phone, password }) => {
    try {
      // Validate phone
      const cleanedPhone = phone.trim();
      if (!/^01[0-9]{9}$/.test(cleanedPhone)) {
        return toast.error("Invalid phone number!");
      }

      // Prepare payload
      const payload = { phone: cleanedPhone, password };

      // Login request
      const res = await loginUser(payload);

      toast.success("Login successful");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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

        {/* Phone input only */}
        <div className="space-y-1 flex justify-center items-center">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap pr-2">
            Phone :
          </label>
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

        {/* Password */}
        <div className="space-y-1 flex justify-center items-center">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap pr-2">
            Password :
          </label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 transition-all"
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

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold shadow-lg transition-all"
        >
          Login
        </button>
      </form>
    </div>
  );
}
