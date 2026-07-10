import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; package?: string; cancelled?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=/checkout");
  const { booking: bookingId, package: packageId, cancelled } = await searchParams;

  let summary: { title: string; detail: string; amount: number; currency: string } | null = null;

  if (bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { course: true, teacher: true },
    });
    if (!booking || booking.studentId !== user.id) redirect("/student/calendar");
    summary = {
      title: booking.course.title,
      detail: `1 session · ${booking.teacher.firstName} ${booking.teacher.lastName} · ${formatInTz(booking.startsAt, user.timezone)}`,
      amount: booking.course.price,
      currency: booking.course.currency,
    };
  } else if (packageId) {
    const pkg = await db.sessionPackage.findUnique({ where: { id: packageId } });
    if (!pkg) redirect("/student/dashboard");
    summary = {
      title: pkg.name,
      detail: `${pkg.sessions} sessions${pkg.discountPct ? ` · ${pkg.discountPct}% off` : ""}`,
      amount: pkg.price,
      currency: pkg.currency,
    };
  }

  if (!summary) redirect("/student/dashboard");

  const devMode = process.env.NODE_ENV !== "production";

  return (
    <div className="grid-pattern flex min-h-screen flex-col items-center bg-vaony-paper px-4 py-12">
      <Link href="/student/dashboard">
        <Image src="/brand/vaony_con_letra.svg" alt="Vaony" width={140} height={38} />
      </Link>
      <div className="mt-8 w-full max-w-md space-y-5">
        {cancelled && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Payment was cancelled — you can try again below.
          </p>
        )}
        <div className="glass-card rounded-3xl p-6">
          <p className="font-mono text-xs text-vaony-ink/50">order summary</p>
          <h1 className="mt-1 font-display text-xl font-bold text-vaony-ink">{summary.title}</h1>
          <p className="mt-1 text-sm text-vaony-ink/60">{summary.detail}</p>
          <p className="mt-4 border-t border-vaony-ink/8 pt-4 font-display text-3xl font-bold text-vaony-ink">
            {formatMoney(summary.amount, summary.currency)}
          </p>
        </div>
        <div className="rounded-3xl border border-vaony-ink/8 bg-white p-6 shadow-sm">
          <CheckoutForm bookingId={bookingId} packageId={packageId} devMode={devMode} />
        </div>
      </div>
    </div>
  );
}
