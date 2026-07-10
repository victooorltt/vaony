import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-xl border border-vaony-ink/15 bg-white px-4 py-2.5 text-sm text-vaony-ink placeholder:text-vaony-ink/35 focus:border-vaony-blue focus:ring-2 focus:ring-vaony-blue/20 outline-none transition";

interface FieldWrapProps {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FieldWrap({ label, error, hint, htmlFor, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-vaony-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-vaony-ink/50">{hint}</p>}
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, "min-h-28", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "cursor-pointer", className)} {...rest}>
      {children}
    </select>
  );
}
