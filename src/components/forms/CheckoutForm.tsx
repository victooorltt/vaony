"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { PaymentProvider } from "@/types";

const providers: { id: PaymentProvider; label: string; note: string }[] = [
  { id: "STRIPE", label: "Card (Stripe)", note: "Visa, Mastercard, Amex" },
  { id: "PAYPAL", label: "PayPal", note: "PayPal balance or linked card" },
  { id: "MERCADOPAGO", label: "Mercado Pago", note: "OXXO, transfer, cards (MX)" },
];

export function CheckoutForm({
  bookingId,
  packageId,
  devMode,
}: {
  bookingId?: string;
  packageId?: string;
  devMode: boolean;
}) {
  const [provider, setProvider] = useState<PaymentProvider>("STRIPE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function pay() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, bookingId, packageId }),
    });
    const json = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string };
    if (res.ok && json.redirectUrl) {
      window.location.href = json.redirectUrl;
    } else {
      setBusy(false);
      setError(json.error ?? "Could not start the payment.");
    }
  }

  async function simulate() {
    setBusy(true);
    const res = await fetch("/api/payments/dev-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, packageId }),
    });
    if (res.ok) router.push("/checkout/success");
    else setBusy(false);
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="sr-only">Payment method</legend>
        {providers.map((p) => (
          <label
            key={p.id}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition",
              provider === p.id
                ? "border-vaony-blue bg-vaony-blue/5 ring-2 ring-vaony-blue/20"
                : "border-vaony-ink/10 bg-white hover:border-vaony-blue/40"
            )}
          >
            <span>
              <span className="block font-medium text-vaony-ink">{p.label}</span>
              <span className="block text-xs text-vaony-ink/55">{p.note}</span>
            </span>
            <input
              type="radio"
              name="provider"
              value={p.id}
              checked={provider === p.id}
              onChange={() => setProvider(p.id)}
              className="accent-vaony-blue"
            />
          </label>
        ))}
      </fieldset>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <Button onClick={pay} size="lg" className="w-full" disabled={busy}>
        {busy ? "Redirecting…" : "Continue to payment"}
      </Button>

      {devMode && (
        <Button onClick={simulate} variant="secondary" size="sm" className="w-full" disabled={busy}>
          Simulate successful payment (dev only)
        </Button>
      )}

      <p className="text-center font-mono text-[11px] text-vaony-ink/45">
        🔒 payments are processed over HTTPS by certified providers
      </p>
    </div>
  );
}
