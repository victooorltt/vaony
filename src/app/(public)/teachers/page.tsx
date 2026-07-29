import type { Metadata } from "next";
import { db } from "@/lib/db";
import TeachersDirectoryClient from "@/components/teachers/TeachersDirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profesores — Vaony",
  description:
    "Aprende con profesores expertos, en vivo y a tu ritmo. Encuentra el mentor ideal según tu nivel, objetivos y disponibilidad.",
};

export default async function TeachersPage() {
  const teachers = await db.teacherProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      softwareTags: {
        include: {
          tag: true,
        },
      },
      courses: {
        include: {
          course: true,
        },
      },
      // Certified badge = the teacher has credentials verified by Vaony
      _count: { select: { credentials: true } },
    },
    orderBy: { ratingAvg: "desc" },
  });

  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <TeachersDirectoryClient
      initialTeachers={teachers as any}
      categories={categories}
    />
  );
}
