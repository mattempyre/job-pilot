"use client";

import { useRef, useState, type JSX } from "react";

import {
  ProfileForm,
  type ProfileFormHandle,
} from "@/components/profile/ProfileForm";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import type {
  CompletionItem,
  EducationEntry,
  ExtractedProfileData,
  JobPreferences,
  PersonalInfo,
  ProfessionalInfo,
  WorkRole,
} from "@/lib/profile";

type ProfileEditorProps = {
  canGenerateResume: boolean;
  draftStorageKey: string;
  education: EducationEntry[];
  fileDetails: string;
  fileName: string;
  hasExtractedProfile: boolean;
  isResumeMissing: boolean;
  jobPreferences: JobPreferences;
  missingItems: CompletionItem[];
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  workExperience: WorkRole[];
};

export function ProfileEditor({
  canGenerateResume,
  draftStorageKey,
  education,
  fileDetails,
  fileName,
  hasExtractedProfile,
  isResumeMissing,
  jobPreferences,
  missingItems,
  personalInfo,
  professionalInfo,
  workExperience,
}: ProfileEditorProps): JSX.Element {
  const formRef = useRef<ProfileFormHandle | null>(null);
  const [isProfileDirty, setIsProfileDirty] = useState(false);

  function applyExtractedProfile(
    extractedProfile: ExtractedProfileData,
  ): void {
    formRef.current?.applyExtractedProfile(extractedProfile);
  }

  return (
    <>
      <ResumeUpload
        canGenerateResume={canGenerateResume}
        fileDetails={fileDetails}
        fileName={fileName}
        hasExtractedProfile={hasExtractedProfile}
        isProfileDirty={isProfileDirty}
        isMissing={isResumeMissing}
        onApplyExtraction={applyExtractedProfile}
      />

      <ProfileForm
        ref={formRef}
        draftStorageKey={draftStorageKey}
        education={education}
        jobPreferences={jobPreferences}
        missingItems={missingItems}
        onDirtyChange={setIsProfileDirty}
        personalInfo={personalInfo}
        professionalInfo={professionalInfo}
        workExperience={workExperience}
      />
    </>
  );
}
