import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid-pattern flex min-h-screen flex-col items-center justify-center bg-vaony-paper px-4 py-10">
      <Link href="/" aria-label="Back to Vaony home">
        <Image
          src="/brand/vaony_con_letra.svg"
          alt="Vaony"
          width={168}
          height={45}
          priority
        />
      </Link>
      <div className="glass-card mt-8 w-full max-w-md rounded-3xl p-8 shadow-xl shadow-vaony-blue/10">
        {children}
      </div>
      <p className="mt-6 text-xs text-vaony-ink/40">
        secure session · JWT + refresh rotation
      </p>
    </div>
  );
}
