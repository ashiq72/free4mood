import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="inline-flex items-center justify-center rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          404
        </div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          This page does not exist or has been moved. Head back to the feed or
          explore trending posts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
