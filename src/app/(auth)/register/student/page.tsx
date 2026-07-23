import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Crear cuenta de estudiante" };

export default function RegisterStudentPage() {
  return <RegisterForm />;
}
