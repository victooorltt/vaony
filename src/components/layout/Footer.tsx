import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/courses", label: "Course catalog" },
      { href: "/teachers", label: "Our teachers" },
      { href: "/apply-teacher", label: "Teach on Vaony" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="grid-pattern-dark bg-vaony-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Image
              src="/brand/vaony_con_letra.svg"
              alt="Vaony"
              width={140}
              height={38}
              className="brightness-0 invert"
            />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              One-on-one online tutoring in exact sciences, engineering and
              mathematics — taught by qualified engineers and specialists.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/75 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Vaony. All rights reserved.
          </p>
          <p className="text-xs text-white/40">100% online · one-on-one · worldwide</p>
        </div>
      </div>
    </footer>
  );
}
