import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Payment complete" };

export default function CheckoutSuccessPage() {
  return (
    <div className="grid-pattern flex min-h-screen flex-col items-center justify-center bg-vaony-paper px-4 text-center">
      <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
      <h1 className="mt-4 font-display text-3xl font-bold text-vaony-ink">
        Payment received
      </h1>
      <p className="mt-2 max-w-md text-vaony-ink/60">
        Your class is confirmed. A receipt was sent to your email, and reminders
        will arrive 24 hours and 1 hour before the session.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/student/dashboard">Go to my dashboard</ButtonLink>
        <ButtonLink href="/student/calendar" variant="secondary">Book another class</ButtonLink>
      </div>
      <Link href="/student/payments" className="mt-4 text-sm text-vaony-blue hover:underline">
        View payment history
      </Link>
    </div>
  );
}
