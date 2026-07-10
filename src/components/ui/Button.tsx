import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "amber";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "brand-gradient text-white shadow-lg shadow-[#2924fd]/25 hover:shadow-[#2924fd]/40 hover:-translate-y-0.5",
  secondary:
    "bg-white text-vaony-blue border border-vaony-blue/30 hover:border-vaony-blue hover:bg-vaony-blue/5",
  ghost: "text-vaony-ink/70 hover:text-vaony-blue hover:bg-vaony-blue/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
  amber: "bg-vaony-amber text-vaony-ink font-semibold hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = BaseProps & { href: string };

export function ButtonLink({ href, variant = "primary", size = "md", className, children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
