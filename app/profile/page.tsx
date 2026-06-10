import type { JSX } from "react";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  calculateCompletion,
  mapProfileRecordToViewModel,
  parseProfileRecord,
} from "@/lib/profile";

export default async function ProfilePage(): Promise<JSX.Element> {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await insforge.database
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

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] space-y-6 border-x border-border px-8 pb-32 pt-8 md:py-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[16px] font-semibold leading-6 text-text-primary">
                Profile
              </h1>
              <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
                Manage the profile JobPilot uses for matching, research, and
                generated resume drafts.
              </p>
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

        <ConnectedAccounts />

        <ResumeUpload
          fileDetails={profile.resume.fileDetails}
          fileName={profile.resume.fileName}
          isMissing={completion.missingItems.some(
            (item) => item.key === "resume",
          )}
        />

        <ProfileForm
          draftStorageKey={`job-pilot:profile-form-draft:${user.id}:v1`}
          education={profile.education}
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
