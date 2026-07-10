import { getSession } from "@/lib/auth/session";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { Card } from "@/components/ui/Card";

export default async function StudentSettingsPage() {
  const user = (await getSession())!;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Settings</h1>
      <Card className="mt-6">
        <SettingsForm user={user} />
      </Card>
    </div>
  );
}
