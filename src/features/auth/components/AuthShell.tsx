import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register" | "verify";
};

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Your people are still here.",
    description:
      "Return to the conversations, shared moments, and familiar voices that make your circle yours.",
  },
  register: {
    eyebrow: "Make your space",
    title: "Come as you are.",
    description:
      "Build a circle around real moments, honest thoughts, and the people who understand your mood.",
  },
  verify: {
    eyebrow: "One quick check",
    title: "Make sure it is really you.",
    description:
      "Verify your email to protect your account and keep your circle connected to the right person.",
  },
};

export const AuthShell = ({ children, mode }: AuthShellProps) => {
  const content = copy[mode];

  return (
    <div className="min-h-screen bg-[var(--mood-canvas)] lg:grid lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
      <aside className="relative min-h-48 overflow-hidden lg:m-4 lg:min-h-[calc(100vh-2rem)] lg:rounded-lg">
        <Image
          src="/free4mood-auth-community.png"
          alt="Friends sharing a moment together"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover object-[center_68%] lg:object-center"
        />
        <div className="absolute inset-0 bg-black/35" />

        <Link
          href="/"
          className="absolute left-5 top-5 flex items-center gap-2.5 text-white lg:left-8 lg:top-8"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-white text-lg font-black text-[#171b19]">
            F
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#171b19] bg-[#e85d4a]" />
          </span>
          <span className="text-lg font-bold">Free4Mood</span>
        </Link>

        <div className="absolute bottom-5 left-5 right-5 text-white lg:bottom-10 lg:left-10 lg:max-w-md">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase text-[#ff8b7b]">
            <Sparkles className="h-3.5 w-3.5" />
            {content.eyebrow}
          </p>
          <h1 className="text-2xl font-bold leading-tight lg:text-4xl">
            {content.title}
          </h1>
          <p className="mt-3 hidden max-w-sm text-sm leading-6 text-white/80 sm:block">
            {content.description}
          </p>
        </div>

        <div className="absolute right-6 top-6 hidden items-center gap-2 text-xs font-semibold text-white/80 lg:flex">
          <ShieldCheck className="h-4 w-4 text-[#71d0b8]" />
          Private by design
        </div>
      </aside>

      <main className="flex min-h-[calc(100vh-12rem)] items-center px-5 py-9 sm:px-10 lg:min-h-screen lg:px-16 lg:py-12 xl:px-24">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};
