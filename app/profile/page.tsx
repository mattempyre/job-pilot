import type { JSX } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResumeUpload } from "@/components/profile/ResumeUpload";

const mockProfile = {
  completion: 72,
  missingFields: ["PHONE", "LOCATION", "EDUCATION"],
  completedFields: ["Resume attached", "Skills added", "Preferences started"],
  resume: {
    fileName: "mara-jensen-resume.pdf",
    fileDetails: "248 KB - Uploaded today",
  },
  personalInfo: {
    fullName: "Mara Jensen",
    email: "mara.jensen@example.com",
    phone: "",
    location: "",
    linkedinUrl: "https://linkedin.com/in/marajensen",
    portfolioUrl: "https://github.com/marajensen",
    workAuthorization: "permanent_resident",
  },
  professionalInfo: {
    currentTitle: "Senior Frontend Engineer",
    experienceLevel: "senior",
    yearsExperience: "7",
    skills: ["React", "TypeScript", "Next.js", "Accessibility", "Design Systems"],
    industries: ["SaaS", "Developer Tools"],
  },
  workExperience: [
    {
      id: "role-one",
      companyName: "Northstar Labs",
      jobTitle: "Senior Frontend Engineer",
      startDate: "2021-02",
      endDate: "",
      current: true,
      responsibilities:
        "Led the migration to Next.js App Router, built reusable design-system components, and improved Core Web Vitals across the customer dashboard.",
    },
    {
      id: "role-two",
      companyName: "Brightbyte",
      jobTitle: "Frontend Engineer",
      startDate: "2018-05",
      endDate: "2021-01",
      current: false,
      responsibilities:
        "Built TypeScript React workflows for onboarding, billing, and reporting while partnering closely with product design and backend teams.",
    },
  ],
  education: {
    highestDegree: "",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
  },
  jobPreferences: {
    jobTitlesSeeking: ["Frontend Engineer", "Design Systems Engineer"],
    remotePreference: "remote",
    salaryExpectation: "$145k - $170k",
    preferredLocations: ["Remote", "New York", "Stockholm"],
    coverLetterTone: "enthusiastic",
  },
};

export default function ProfilePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] space-y-6 border-x border-border px-8 py-8">
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

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <CompletionIndicator
            completedFields={mockProfile.completedFields}
            completion={mockProfile.completion}
            missingFields={mockProfile.missingFields}
          />
          <ResumeUpload
            fileDetails={mockProfile.resume.fileDetails}
            fileName={mockProfile.resume.fileName}
          />
        </div>

        <ProfileForm
          education={mockProfile.education}
          jobPreferences={mockProfile.jobPreferences}
          personalInfo={mockProfile.personalInfo}
          professionalInfo={mockProfile.professionalInfo}
          workExperience={mockProfile.workExperience}
        />
      </div>
    </main>
  );
}
