import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }> | { email?: string };
}) {
  const params = await Promise.resolve(searchParams);
  return <VerifyEmailForm initialEmail={params.email || ""} />;
}

