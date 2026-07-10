"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  Bars3Icon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  EnvelopeIcon,
  FolderArrowDownIcon,
  FolderPlusIcon,
  HomeIcon,
  IdentificationIcon,
  PhotoIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

export type PortalKind = "student" | "teacher" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Nav items live client-side: icon components can't cross the RSC boundary.
const NAV: Record<PortalKind, NavItem[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/student/courses", label: "My courses", icon: BookOpenIcon },
    { href: "/student/calendar", label: "Calendar", icon: CalendarDaysIcon },
    { href: "/student/materials", label: "Materials", icon: FolderArrowDownIcon },
    { href: "/student/payments", label: "Payments", icon: CreditCardIcon },
    { href: "/student/messages", label: "Messages", icon: ChatBubbleLeftRightIcon },
    { href: "/student/settings", label: "Settings", icon: Cog6ToothIcon },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/teacher/profile", label: "Public profile", icon: IdentificationIcon },
    { href: "/teacher/schedule", label: "Schedule", icon: CalendarDaysIcon },
    { href: "/teacher/students", label: "Students", icon: UsersIcon },
    { href: "/teacher/resources", label: "Resources", icon: FolderPlusIcon },
    { href: "/teacher/earnings", label: "Earnings", icon: BanknotesIcon },
    { href: "/teacher/messages", label: "Messages", icon: ChatBubbleLeftRightIcon },
    { href: "/teacher/settings", label: "Settings", icon: Cog6ToothIcon },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/admin/users", label: "Users", icon: UsersIcon },
    { href: "/admin/courses", label: "Courses", icon: AcademicCapIcon },
    { href: "/admin/payments", label: "Payments", icon: BanknotesIcon },
    { href: "/admin/applications", label: "Applications", icon: UserPlusIcon },
    { href: "/admin/gallery", label: "Gallery", icon: PhotoIcon },
    { href: "/admin/moderation", label: "Moderation", icon: ShieldExclamationIcon },
    { href: "/admin/inbox", label: "Contact inbox", icon: EnvelopeIcon },
  ],
};

const INACTIVITY_MS = 30 * 60 * 1000;

export function PortalShell({
  user,
  portal,
  children,
  unreadCount = 0,
}: {
  user: SessionUser;
  portal: PortalKind;
  children: React.ReactNode;
  unreadCount?: number;
}) {
  const items = NAV[portal];
  const title = portal;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Auto-logout after 30 min of inactivity (spec §4.1)
  useEffect(() => {
    let timer = setTimeout(logout, INACTIVITY_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent access-token refresh every 10 min while the tab is open
  useEffect(() => {
    const id = setInterval(() => {
      void fetch("/api/auth/refresh", { method: "POST" });
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <Image src="/brand/vaony_solo_logo.svg" alt="Vaony" width={28} height={23} />
        <span className="font-display text-lg font-bold text-white">vaony</span>
        <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white/60">
          {title}
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate font-mono text-[10px] text-white/45">{user.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-vaony-paper">
      {/* Desktop sidebar */}
      <aside className="grid-pattern-dark fixed inset-y-0 left-0 z-30 hidden w-64 bg-vaony-ink lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="grid-pattern-dark absolute inset-y-0 left-0 w-64 bg-vaony-ink">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-vaony-ink/8 bg-vaony-paper/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-vaony-ink lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <Link
            href={`${items[0]?.href.split("/").slice(0, 2).join("/")}/messages`}
            className="relative rounded-lg p-2 text-vaony-ink/60 hover:bg-vaony-blue/5 hover:text-vaony-blue"
            aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vaony-amber px-1 font-mono text-[10px] font-bold text-vaony-ink">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
