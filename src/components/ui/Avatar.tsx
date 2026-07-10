import Image from "next/image";
import { cn, initials } from "@/lib/utils";

const sizeMap = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-20 w-20 text-xl", xl: "h-28 w-28 text-2xl" };

export function Avatar({
  src,
  firstName,
  lastName,
  size = "md",
  className,
}: {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "brand-gradient inline-flex items-center justify-center rounded-full font-display font-semibold text-white",
        sizeMap[size],
        className
      )}
    >
      {initials(firstName, lastName)}
    </span>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/vaony_solo_logo.svg"
      alt="Vaony"
      width={32}
      height={27}
      className={className}
    />
  );
}
