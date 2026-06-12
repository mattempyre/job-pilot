import type { JSX } from "react";
import { redirect } from "next/navigation";
import { User } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { getCurrentUserSession } from "@/lib/auth-session";
import { getE2EProfileRecord } from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  calculateCompletion,
  mapProfileRecordToViewModel,
  parseProfileRecord,
} from "@/lib/profile";

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await getCurrentUserSession();
  const user = session.user;

  if (!user) {
    redirect("/login");
  }

  const { data, error } = session.isE2E
    ? { data: getE2EProfileRecord(session), error: null }
    : await (await createInsforgeServer()).database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

  if (error) {
    console.error("[profile/page] load profile", error);
  }

  const profileRecord = error ? null : parseProfileRecord(data);
  const profile = mapProfileRecordToViewModel(
    profileRecord,
    user.email ?? "",
  );
  const completion = calculateCompletion(profile, Boolean(profile.resume.key));
  const resumeReadyCompletion = calculateCompletion(profile, true);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] space-y-6 border-x border-border px-8 pb-32 pt-8 md:py-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                <User aria-hidden="true" className="size-5" strokeWidth={2} />
              </div>

              <div>
                <h1 className="text-[16px] font-semibold leading-6 text-text-primary">
                  Profile
                </h1>
                <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
                  Manage the profile JobPilot uses for matching, research, and
                  generated resume drafts.
                </p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </section>

        <CompletionIndicator
          completedFields={completion.completedFields}
          completion={completion.completion}
          missingFields={completion.missingFields}
          missingItems={completion.missingItems}
        />

        <ProfileEditor
          canGenerateResume={resumeReadyCompletion.isComplete}
          draftStorageKey={`job-pilot:profile-form-draft:${user.id}:v1`}
          education={profile.education}
          fileDetails={profile.resume.fileDetails}
          fileName={profile.resume.fileName}
          hasExtractedProfile={profile.resume.hasExtractedProfile}
          isResumeMissing={completion.missingItems.some(
            (item) => item.key === "resume",
          )}
          jobPreferences={profile.jobPreferences}
          missingItems={completion.missingItems}
          personalInfo={profile.personalInfo}
          professionalInfo={profile.professionalInfo}
          workExperience={profile.workExperience}
        />
      </div>
      <MobileBottomNav />
    </main>
  );
}
