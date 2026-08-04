import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Plataforma",
    links: [
      { href: "/teachers", label: "Nuestros profesores" },
      { href: "/apply-teacher", label: "Enseña en Vaony" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/about", label: "Sobre nosotros" },
      { href: "/contact", label: "Contacto" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/login", label: "Iniciar sesión" },
      { href: "/register", label: "Crear cuenta" },
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
              Clases online personalizadas de ciencias exactas, ingeniería y
              matemáticas — impartidas por ingenieros y especialistas cualificados.
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
            © {new Date().getFullYear()} Vaony. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/40">100% online · clases individuales · en todo el mundo</p>
        </div>
      </div>
    </footer>
  );
}
