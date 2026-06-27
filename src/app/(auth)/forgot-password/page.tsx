import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <ShieldCheck className="mx-auto size-8 text-blue-600" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Password recovery unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Recovery will return after secure phone verification is configured.
          Contact an administrator if you need access restored.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </section>
    </main>
  );
}
