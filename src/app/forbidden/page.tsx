import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="grid-pattern flex min-h-screen flex-col items-center justify-center bg-vaony-paper px-4 text-center">
      <p className="text-sm text-vaony-blue">HTTP 403</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-vaony-ink">
        This area belongs to a different role
      </h1>
      <p className="mt-2 max-w-md text-vaony-ink/60">
        Your account doesn&apos;t have access to this portal. If you think this is a
        mistake, contact support.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-vaony-blue hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
