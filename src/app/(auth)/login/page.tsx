import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
