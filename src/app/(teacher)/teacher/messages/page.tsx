import { getSession } from "@/lib/auth/session";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default async function TeacherMessagesPage() {
  const user = (await getSession())!;
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Messages</h1>
      <p className="mt-1 text-sm text-vaony-ink/60">
        Chat with your enrolled students — history is saved automatically.
      </p>
      <div className="mt-6">
        <ChatPanel meId={user.id} />
      </div>
    </div>
  );
}
