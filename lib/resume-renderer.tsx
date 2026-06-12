import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement, type ComponentProps, type ReactElement } from "react";

import type { GeneratedResumeContent } from "@/agent/resume-generation";
import type { ProfileViewModel } from "@/lib/profile";
import { getColorTokenValue } from "@/lib/ui-token-values";

const pdfColors = {
  textDark: getColorTokenValue("text-dark"),
  textDarkest: getColorTokenValue("text-darkest"),
  textPrimary: getColorTokenValue("text-primary"),
  textSecondary: getColorTokenValue("text-secondary"),
};

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.35,
    color: pdfColors.textDarkest,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  headline: {
    fontSize: 11,
    color: pdfColors.textDark,
    marginBottom: 7,
  },
  contactLine: {
    fontSize: 8,
    color: pdfColors.textDark,
    marginBottom: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: pdfColors.textPrimary,
    marginBottom: 5,
  },
  summary: {
    fontSize: 9,
  },
  skillsText: {
    fontSize: 9,
  },
  role: {
    marginBottom: 9,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  roleCompany: {
    fontSize: 9,
    color: pdfColors.textDark,
    marginBottom: 3,
  },
  roleDate: {
    fontSize: 8,
    color: pdfColors.textSecondary,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 4,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
  },
  educationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  educationText: {
    fontSize: 9,
  },
  educationYear: {
    fontSize: 8,
    color: pdfColors.textSecondary,
  },
});

function joinNonEmpty(values: string[], separator = " | "): string {
  return values.map((value) => value.trim()).filter(Boolean).join(separator);
}

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) {
    return "";
  }

  return `${startDate || "Present"} - ${endDate || "Present"}`;
}

function ResumeDocument({
  generatedResume,
  profile,
}: {
  generatedResume: GeneratedResumeContent;
  profile: ProfileViewModel;
}): ReactElement<ComponentProps<typeof Document>> {
  const contactItems = [
    profile.personalInfo.email,
    profile.personalInfo.phone,
    profile.personalInfo.location,
    profile.personalInfo.linkedinUrl ? "LinkedIn" : "",
    profile.personalInfo.portfolioUrl ? "Portfolio" : "",
  ].filter(Boolean);

  return createElement(
    Document,
    {
      author: profile.personalInfo.fullName,
      creator: "JobPilot",
      producer: "JobPilot",
      title: `${profile.personalInfo.fullName} Resume`,
    },
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },
      createElement(Text, { style: styles.name }, profile.personalInfo.fullName),
      createElement(
        Text,
        { style: styles.headline },
        generatedResume.headline || profile.professionalInfo.currentTitle,
      ),
      createElement(Text, { style: styles.contactLine }, contactItems.join(" | ")),
      generatedResume.summary
        ? createElement(
            View,
            { style: styles.section },
            createElement(
              Text,
              { style: styles.sectionTitle },
              "Professional Summary",
            ),
            createElement(Text, { style: styles.summary }, generatedResume.summary),
          )
        : null,
      generatedResume.skills.length > 0
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionTitle }, "Skills"),
            createElement(
              Text,
              { style: styles.skillsText },
              generatedResume.skills.join(" | "),
            ),
          )
        : null,
      generatedResume.roles.length > 0
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionTitle }, "Experience"),
            generatedResume.roles.map((role) =>
              createElement(
                View,
                {
                  key: `${role.companyName}-${role.jobTitle}-${role.startDate}`,
                  style: styles.role,
                  wrap: false,
                },
                createElement(
                  View,
                  { style: styles.roleHeader },
                  createElement(Text, { style: styles.roleTitle }, role.jobTitle),
                  createElement(
                    Text,
                    { style: styles.roleDate },
                    formatDateRange(role.startDate, role.endDate),
                  ),
                ),
                createElement(
                  Text,
                  { style: styles.roleCompany },
                  joinNonEmpty([role.companyName, role.location], " - "),
                ),
                role.bullets.map((bullet) =>
                  createElement(
                    View,
                    { key: bullet, style: styles.bulletRow },
                    createElement(Text, { style: styles.bulletDot }, "-"),
                    createElement(Text, { style: styles.bulletText }, bullet),
                  ),
                ),
              ),
            ),
          )
        : null,
      generatedResume.education.length > 0
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionTitle }, "Education"),
            generatedResume.education.map((entry) =>
              createElement(
                View,
                {
                  key: `${entry.institutionName}-${entry.degree}-${entry.graduationYear}`,
                  style: styles.educationRow,
                },
                createElement(
                  Text,
                  { style: styles.educationText },
                  joinNonEmpty([
                    joinNonEmpty([entry.degree, entry.fieldOfStudy], ", "),
                    entry.institutionName,
                  ]),
                ),
                createElement(
                  Text,
                  { style: styles.educationYear },
                  entry.graduationYear,
                ),
              ),
            ),
          )
        : null,
    ),
  );
}

export async function renderResumePdfBuffer({
  generatedResume,
  profile,
}: {
  generatedResume: GeneratedResumeContent;
  profile: ProfileViewModel;
}): Promise<Buffer> {
  return renderToBuffer(ResumeDocument({ generatedResume, profile }));
}
