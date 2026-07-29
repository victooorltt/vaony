import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { TeacherProfileEditor } from "@/components/forms/TeacherProfileEditor";

export default async function TeacherProfilePage() {
  const user = (await getSession())!;
  const profile = await db.teacherProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    include: {
      softwareTags: { include: { tag: true } },
      credentials: true,
      portfolioItems: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Public profile</h1>
      <p className="mt-1 text-sm text-vaony-ink/60">
        This is your showcase page — what students see before booking you.
      </p>
      <div className="mt-6">
        <TeacherProfileEditor
          profile={{
            userId: user.id,
            title: profile.title ?? "",
            specialization: profile.specialization ?? "",
            bio: profile.bio ?? "",
            languages: profile.languages,
            linkedinUrl: profile.linkedinUrl ?? "",
            githubUrl: profile.githubUrl ?? "",
            websiteUrl: profile.websiteUrl ?? "",
            youtubeUrl: profile.youtubeUrl ?? "",
            extraSubjects: profile.extraSubjects ?? "",
            yearsExperience:
              profile.yearsExperience === null ? "" : String(profile.yearsExperience),
            softwareTags: profile.softwareTags.map((st) => st.tag.name),
            credentials: profile.credentials,
            portfolioItems: profile.portfolioItems,
          }}
        />
      </div>
    </div>
  );
}
