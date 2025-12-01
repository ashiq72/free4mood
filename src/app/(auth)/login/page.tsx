"use client";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

interface IFormInput {
  identifier: string; // phone or email
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const identifier = data.identifier.trim();

    // Detect if it's an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    // Detect if it's BD phone number (11 digits)
    const isPhone = /^01[0-9]{9}$/.test(identifier);

    if (!isEmail && !isPhone) {
      console.log("Invalid email or phone!");
      return;
    }

    const finalPayload = {
      ...(isEmail && { email: identifier }),
      ...(isPhone && { phone: identifier }),
      password: data.password,
    };

    console.log("Sending this payload:", finalPayload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md backdrop-blur-xl bg-white/40 shadow-2xl border border-white/30 rounded-3xl p-10 space-y-6 transition-all"
      >
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 text-sm">
          Login to continue 🚀
        </p>

        {/* Phone or Email */}
        <div className="space-y-1 flex justify-center items-center">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap pr-2">
            Phone / Email :
          </label>
          <input
            {...register("identifier", {
              required: "Phone or Email is required",
              validate: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^01[0-9]{9}$/;
                return (
                  emailRegex.test(value) ||
                  phoneRegex.test(value) ||
                  "Enter a valid phone (11 digits) or email"
                );
              },
            })}
            placeholder="Enter phone or email"
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 
             focus:ring-4 focus:ring-blue-400/40 transition-all"
          />
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
              minLength: {
                value: 6,
                message: "At least 6 characters",
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                message: "Must include letters & numbers",
              },
            })}
            className="p-3 rounded-xl w-full bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-700 text-sm">
          Not registered yet?{" "}
          <Link
            href="/register"
            className="text-blue-700 font-semibold underline"
          >
            Create an account
          </Link>
        </p>

        {/* Submit Button */}
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
