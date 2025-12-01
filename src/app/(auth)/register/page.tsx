"use client";
import { createUser } from "@/lib/api/user/user";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

enum GenderEnum {
  male = "male",
  female = "female",
  other = "other",
}

interface IFormInput {
  firstName: string;
  lastName: string;
  gender: GenderEnum;
  phone: number;
  password: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  // const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      phone: data.phone,
      gender: data.gender,
    };

    try {
      const response = await createUser(payload);
      console.log("User Created:", response);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md backdrop-blur-xl bg-white/40 shadow-2xl border border-white/30 rounded-3xl p-10 space-y-6 transition-all'
      >
        {/* Header */}
        <h2 className='text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Create an Account
        </h2>
        <p className='text-center text-gray-600 text-sm'>
          Join our platform in just a minute ✨
        </p>

        {/* Input group */}
        {/** First Name */}
        <div className='space-y-1 flex justify-center items-center'>
          <label className='text-sm font-semibold text-gray-700 whitespace-nowrap pr-2'>
            First Name :{" "}
          </label>
          <input
            {...register("firstName", {
              required: "First name is required",
              minLength: { value: 2, message: "Minimum 2 characters required" },
            })}
            className='p-3 rounded-xl bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all w-full'
            placeholder='Enter first name'
          />
          {errors.firstName && (
            <p className='text-red-500 text-xs'>{errors.firstName.message}</p>
          )}
        </div>

        {/** Last Name */}
        <div className='space-y-1 flex justify-center items-center'>
          <label className='text-sm font-semibold text-gray-700 whitespace-nowrap pr-2'>
            Last Name :{" "}
          </label>
          <input
            {...register("lastName", { required: "Last name is required" })}
            className='p-3 rounded-xl bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all w-full'
            placeholder='Enter last name'
          />
          {errors.lastName && (
            <p className='text-red-500 text-xs'>{errors.lastName.message}</p>
          )}
        </div>

        {/** Gender */}
        <div className='space-y-1 flex justify-center items-center'>
          <label className='text-sm font-semibold text-gray-700 whitespace-nowrap pr-2'>
            Gender :{" "}
          </label>
          <select
            {...register("gender", { required: "Gender is required" })}
            className='p-3 rounded-xl bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all w-full'
          >
            <option value=''>Choose gender...</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='other'>Other</option>
          </select>
          {errors.gender && (
            <p className='text-red-500 text-xs'>{errors.gender.message}</p>
          )}
        </div>

        {/** Phone */}
        <div className='space-y-1 flex justify-center items-center'>
          <label className='text-sm font-semibold text-gray-700 whitespace-nowrap pr-2 '>
            Phone :{" "}
          </label>
          <input
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{11}$/,
                message: "Phone must be 11 digits",
              },
            })}
            className='p-3 rounded-xl bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all w-full'
            placeholder='01XXXXXXXXX'
          />
          {errors.phone && (
            <p className='text-red-500 text-xs'>{errors.phone.message}</p>
          )}
        </div>

        {/** Password */}
        <div className='space-y-1 flex justify-center items-center'>
          <label className='text-sm font-semibold text-gray-700 whitespace-nowrap pr-2'>
            Password :{" "}
          </label>
          <input
            type='password'
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
            className='p-3 rounded-xl bg-white/40 border border-gray-300 focus:ring-4 focus:ring-blue-400/40 focus:outline-none transition-all w-full'
            placeholder='Enter password'
          />
          {errors.password && (
            <p className='text-red-500 text-xs'>{errors.password.message}</p>
          )}
        </div>

        {/* Login link */}
        <p className='text-center text-gray-700 text-sm'>
          Already have an account?{" "}
          <Link href='/login' className='text-blue-700 font-semibold underline'>
            Login
          </Link>
        </p>

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold shadow-lg transition-all'
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
