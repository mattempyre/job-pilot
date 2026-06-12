"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  forwardRef,
  useActionState,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  GraduationCap,
  GripVertical,
  Loader2,
  Plus,
  Save,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";

import {
  saveProfile,
  type SaveProfileState,
} from "@/actions/profile";
import type {
  CompletionFieldKey,
  CompletionItem,
  EducationEntry,
  ExtractedProfileData,
  JobPreferences,
  PersonalInfo,
  ProfessionalInfo,
  WorkRole,
} from "@/lib/profile";

type ProfileFormProps = {
  draftStorageKey: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  workExperience: WorkRole[];
  education: EducationEntry[];
  jobPreferences: JobPreferences;
  missingItems: CompletionItem[];
  onDirtyChange?: (isDirty: boolean) => void;
};

type ArrayFieldKind = "skills" | "industries" | "jobTitles" | "locations";
type ReorderKind = "role" | "education";
type ReorderDirection = "up" | "down";

type ReorderItemData = {
  itemId: string;
  reorderKind: ReorderKind;
};

type DeleteConfirmation = {
  confirmLabel: string;
  description: string;
  itemId: string;
  kind: ReorderKind;
  title: string;
};

type SectionHeaderProps = {
  action?: ReactNode;
  children?: ReactNode;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  isMissing?: boolean;
  showStatus?: boolean;
  title: string;
};

type ProfileDraftFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "location"
  | "linkedinUrl"
  | "portfolioUrl"
  | "workAuthorization"
  | "currentTitle"
  | "experienceLevel"
  | "yearsExperience"
  | "salaryExpectation"
  | "coverLetterTone";

type ProfileFormDraft = {
  version: 1;
  updatedAt: number;
  fields: Partial<Record<ProfileDraftFieldName, string>>;
  skills: string[];
  industries: string[];
  workRoles: WorkRole[];
  educationEntries: EducationEntry[];
  jobTitles: string[];
  locations: string[];
  remotePreferences: string[];
};

type ProfileScalarValues = Record<ProfileDraftFieldName, string>;

export type ProfileFormHandle = {
  applyExtractedProfile: (extractedProfile: ExtractedProfileData) => void;
};

type ReorderableProfileCardProps = {
  actions: ReactNode;
  children: ReactNode;
  isCollapsed: boolean;
  index: number;
  itemId: string;
  itemLabel: string;
  onMove: (itemId: string, direction: ReorderDirection) => void;
  onReorder: (sourceId: string, targetId: string, edge: Edge) => void;
  onToggleCollapsed: (itemId: string) => void;
  reorderKind: ReorderKind;
  status?: ReactNode;
  summary: string;
  title: string;
  total: number;
};

const initialState: SaveProfileState = {
  success: false,
  error: null,
  message: null,
};

const inputClassName =
  "h-11 w-full scroll-mt-24 rounded-md border border-border bg-surface px-3 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted";

const selectClassName =
  "h-11 w-full scroll-mt-24 rounded-md border border-border bg-surface px-3 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-1 focus:ring-accent";

const textareaClassName =
  "min-h-28 w-full scroll-mt-24 resize-y rounded-md border border-border bg-surface px-3 py-2 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const labelClassName =
  "text-[12px] font-medium uppercase leading-4 text-text-secondary";

const fieldGroupClassName = "flex flex-col gap-2";

const cardIconButtonClassName =
  "inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition-[background-color,border-color,color] hover:border-accent hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const requiredHelperClassName =
  "text-[12px] font-medium leading-4 text-accent";

const profileDraftFieldNames: ProfileDraftFieldName[] = [
  "fullName",
  "email",
  "phone",
  "location",
  "linkedinUrl",
  "portfolioUrl",
  "workAuthorization",
  "currentTitle",
  "experienceLevel",
  "yearsExperience",
  "salaryExpectation",
  "coverLetterTone",
];

type RemotePreferenceOption = {
  label: string;
  value: string;
};

const remotePreferenceOptions: RemotePreferenceOption[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Onsite", value: "onsite" },
  { label: "Any", value: "any" },
];

function getInitialScalarValues({
  personalInfo,
  professionalInfo,
  jobPreferences,
}: {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  jobPreferences: JobPreferences;
}): ProfileScalarValues {
  return {
    fullName: personalInfo.fullName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    location: personalInfo.location,
    linkedinUrl: personalInfo.linkedinUrl,
    portfolioUrl: personalInfo.portfolioUrl,
    workAuthorization: personalInfo.workAuthorization,
    currentTitle: professionalInfo.currentTitle,
    experienceLevel: professionalInfo.experienceLevel,
    yearsExperience: professionalInfo.yearsExperience,
    salaryExpectation: jobPreferences.salaryExpectation,
    coverLetterTone: jobPreferences.coverLetterTone,
  };
}

function getFieldClassName(className: string, isMissing: boolean): string {
  return isMissing
    ? `${className} border-accent ring-1 ring-accent/30`
    : className;
}

function getSectionClassName(isMissing: boolean): string {
  return `scroll-mt-24 rounded-xl border bg-surface p-6 shadow-sm ${
    isMissing ? "border-accent ring-1 ring-accent/30" : "border-border"
  }`;
}

function RequiredHelper({ show }: { show: boolean }): JSX.Element | null {
  return show ? (
    <p className={requiredHelperClassName}>Required for profile completion.</p>
  ) : null;
}

function createEmptyRole(index: number): WorkRole {
  return {
    id: `role-${Date.now()}-${index}`,
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
  };
}

function createEmptyEducation(index: number): EducationEntry {
  return {
    id: `education-${Date.now()}-${index}`,
    highestDegree: "",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
  };
}

function normalizeList(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isRemotePreferenceOption(value: string): boolean {
  return remotePreferenceOptions.some((option) => option.value === value);
}

function normalizeRemotePreferences(values: string[]): string[] {
  const normalized = Array.from(
    new Set(values.filter((value) => isRemotePreferenceOption(value))),
  );

  return normalized.includes("any")
    ? ["any"]
    : normalized.filter((value) => value !== "any");
}

function applyExtractedValue(current: string, extracted: string): string {
  const extractedValue = extracted.trim();
  return extractedValue || current;
}

function hasCompleteRole(roles: WorkRole[]): boolean {
  return roles.some(
    (role) =>
      Boolean(role.companyName.trim()) &&
      Boolean(role.jobTitle.trim()) &&
      Boolean(role.startDate.trim()) &&
      Boolean(role.responsibilities.trim()),
  );
}

function hasCompleteEducationEntry(entries: EducationEntry[]): boolean {
  return entries.some(
    (entry) =>
      Boolean(entry.highestDegree.trim()) &&
      Boolean(entry.fieldOfStudy.trim()) &&
      Boolean(entry.institutionName.trim()) &&
      Boolean(entry.graduationYear.trim()),
  );
}

function roleHasData(role: WorkRole): boolean {
  return (
    Boolean(role.companyName.trim()) ||
    Boolean(role.jobTitle.trim()) ||
    Boolean(role.startDate.trim()) ||
    Boolean(role.endDate.trim()) ||
    role.current ||
    Boolean(role.responsibilities.trim())
  );
}

function educationEntryHasData(entry: EducationEntry): boolean {
  return (
    Boolean(entry.highestDegree.trim()) ||
    Boolean(entry.fieldOfStudy.trim()) ||
    Boolean(entry.institutionName.trim()) ||
    Boolean(entry.graduationYear.trim())
  );
}

function getEducationDegreeLabel(value: string): string {
  const labels: Record<string, string> = {
    bachelors: "Bachelor's degree",
    bootcamp: "Bootcamp",
    masters: "Master's degree",
    phd: "PhD",
    self_taught: "Self-taught",
  };

  return labels[value] ?? value;
}

function getRoleSummary(role: WorkRole): string {
  const title = role.jobTitle.trim() || "Untitled role";
  const company = role.companyName.trim();
  const timing = role.current ? "Current" : role.startDate || role.endDate;

  return [company, title, timing].filter(Boolean).join(" - ");
}

function getEducationSummary(entry: EducationEntry): string {
  const degree = entry.highestDegree.trim()
    ? getEducationDegreeLabel(entry.highestDegree)
    : "Untitled education";

  return [degree, entry.fieldOfStudy.trim(), entry.institutionName.trim()]
    .filter(Boolean)
    .join(" - ");
}

function createProfileSnapshot({
  educationEntries,
  fieldValues,
  industries,
  jobTitles,
  locations,
  remotePreferences,
  skills,
  workRoles,
}: {
  educationEntries: EducationEntry[];
  fieldValues: ProfileScalarValues;
  industries: string[];
  jobTitles: string[];
  locations: string[];
  remotePreferences: string[];
  skills: string[];
  workRoles: WorkRole[];
}): string {
  return JSON.stringify({
    fields: fieldValues,
    educationEntries,
    industries,
    jobTitles,
    locations,
    remotePreferences,
    skills,
    workRoles,
  });
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    ),
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

function getFirstMissingTargetId(missingKeys: Set<CompletionFieldKey>): string {
  const orderedTargets: Array<[CompletionFieldKey, string]> = [
    ["fullName", "profile-field-full-name"],
    ["email", "profile-field-email"],
    ["phone", "profile-field-phone"],
    ["location", "profile-field-location"],
    ["workAuthorization", "profile-field-work-authorization"],
    ["currentTitle", "profile-field-current-title"],
    ["experience", "profile-field-experience-level"],
    ["skills", "profile-field-skills"],
    ["workExperience", "profile-section-work-experience"],
    ["education", "profile-section-education"],
    ["jobTitlesSeeking", "profile-field-job-titles-seeking"],
    ["remotePreference", "profile-field-remote-preference"],
  ];

  return (
    orderedTargets.find(([key]) => missingKeys.has(key))?.[1] ??
    "profile-form"
  );
}

function CompletionStatusBadge({
  isMissing,
}: {
  isMissing: boolean;
}): JSX.Element {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium leading-4 ${
        isMissing
          ? "bg-accent-muted text-accent"
          : "bg-success-lightest text-success-foreground"
      }`}
    >
      <CheckCircle2 aria-hidden="true" className="size-3.5" strokeWidth={2} />
      {isMissing ? "Missing" : "Complete"}
    </span>
  );
}

function SectionHeader({
  action,
  children,
  description,
  icon,
  iconClassName,
  isMissing = false,
  showStatus = false,
  title,
}: SectionHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${iconClassName}`}
        >
          {icon}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              {title}
            </h2>
            {showStatus ? <CompletionStatusBadge isMissing={isMissing} /> : null}
          </div>
          <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
            {description}
          </p>
          {children}
        </div>
      </div>

      {action}
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readDraftString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeDraftStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeDraftRemotePreferences(
  value: unknown,
  legacyValue: unknown,
): string[] {
  const remotePreferences = normalizeRemotePreferences(
    normalizeDraftStringArray(value),
  );

  if (remotePreferences.length > 0) {
    return remotePreferences;
  }

  const legacyPreference = readDraftString(legacyValue);
  return legacyPreference ? normalizeRemotePreferences([legacyPreference]) : [];
}

function normalizeDraftWorkRoles(value: unknown): WorkRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};

    return {
      id: readDraftString(record.id) || createEmptyRole(index).id,
      companyName: readDraftString(record.companyName),
      jobTitle: readDraftString(record.jobTitle),
      startDate: readDraftString(record.startDate),
      endDate: readDraftString(record.endDate),
      current: record.current === true,
      responsibilities: readDraftString(record.responsibilities),
    };
  });
}

function normalizeDraftEducationEntries(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};

    return {
      id: readDraftString(record.id) || createEmptyEducation(index).id,
      highestDegree: readDraftString(record.highestDegree),
      fieldOfStudy: readDraftString(record.fieldOfStudy),
      institutionName: readDraftString(record.institutionName),
      graduationYear: readDraftString(record.graduationYear),
    };
  });
}

function parseProfileFormDraft(value: string | null): ProfileFormDraft | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isRecord(parsed) || parsed.version !== 1) {
      return null;
    }

    const fieldsRecord = isRecord(parsed.fields) ? parsed.fields : {};
    const fields: ProfileFormDraft["fields"] = {};

    for (const fieldName of profileDraftFieldNames) {
      fields[fieldName] = readDraftString(fieldsRecord[fieldName]);
    }

    return {
      version: 1,
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
      fields,
      skills: normalizeDraftStringArray(parsed.skills),
      industries: normalizeDraftStringArray(parsed.industries),
      workRoles: normalizeDraftWorkRoles(parsed.workRoles),
      educationEntries: normalizeDraftEducationEntries(parsed.educationEntries),
      jobTitles: normalizeDraftStringArray(parsed.jobTitles),
      locations: normalizeDraftStringArray(parsed.locations),
      remotePreferences: normalizeDraftRemotePreferences(
        parsed.remotePreferences,
        fieldsRecord.remotePreference,
      ),
    };
  } catch {
    return null;
  }
}

function isReorderItemData(
  data: Record<string | symbol, unknown>,
  reorderKind: ReorderKind,
): data is ReorderItemData {
  return (
    data.reorderKind === reorderKind &&
    typeof data.itemId === "string" &&
    data.itemId.length > 0
  );
}

function getFinishIndex({
  edge,
  sourceIndex,
  targetIndex,
}: {
  edge: Edge;
  sourceIndex: number;
  targetIndex: number;
}): number {
  if (targetIndex === sourceIndex + 1 || targetIndex === sourceIndex - 1) {
    return targetIndex;
  }

  const targetIndexAfterRemoval =
    targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

  return edge === "bottom"
    ? targetIndexAfterRemoval + 1
    : targetIndexAfterRemoval;
}

function ReorderableProfileCard({
  actions,
  children,
  isCollapsed,
  index,
  itemId,
  itemLabel,
  onMove,
  onReorder,
  onToggleCollapsed,
  reorderKind,
  status,
  summary,
  title,
  total,
}: ReorderableProfileCardProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canReorder = total > 1;
  const canCollapse = total > 1;
  const isCardCollapsed = canCollapse && isCollapsed;

  useEffect(() => {
    const element = cardRef.current;
    const dragHandle = dragHandleRef.current;

    if (!element || !dragHandle || !canReorder) {
      return undefined;
    }

    return combine(
      draggable({
        element,
        dragHandle,
        getInitialData: () => ({ itemId, reorderKind }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          isReorderItemData(source.data, reorderKind) &&
          source.data.itemId !== itemId,
        getData: ({ input }) =>
          attachClosestEdge(
            { itemId, reorderKind },
            { element, input, allowedEdges: ["top", "bottom"] },
          ),
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragEnter: ({ self }) =>
          setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: ({ source, self }) => {
          if (!isReorderItemData(source.data, reorderKind)) {
            return;
          }

          const edge = extractClosestEdge(self.data) ?? "bottom";
          setClosestEdge(null);
          onReorder(source.data.itemId, itemId, edge);
        },
      }),
    );
  }, [canReorder, itemId, onReorder, reorderKind]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl border border-border bg-surface-secondary p-5 transition-[border-color,box-shadow,opacity] ${
        isDragging ? "opacity-70 shadow-md" : ""
      }`}
    >
      {closestEdge ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-5 right-5 z-10 h-1 rounded-full bg-accent ${
            closestEdge === "top" ? "top-0" : "bottom-0"
          }`}
        />
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          {canReorder ? (
            <button
              ref={dragHandleRef}
              type="button"
              className={`${cardIconButtonClassName} cursor-grab active:cursor-grabbing`}
              aria-label={`Drag ${itemLabel} ${index + 1}`}
            >
              <GripVertical
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />
            </button>
          ) : null}

          {canCollapse ? (
            <button
              type="button"
              className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => onToggleCollapsed(itemId)}
              aria-expanded={!isCardCollapsed}
              aria-controls={`${itemId}-fields`}
            >
              <span className="block truncate text-[14px] font-semibold leading-5 text-text-primary">
                {title}
              </span>
              <span className="mt-0.5 block truncate text-[12px] font-normal leading-4 text-text-muted">
                {summary}
              </span>
            </button>
          ) : (
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold leading-5 text-text-primary">
                {title}
              </h3>
              <p className="mt-0.5 truncate text-[12px] font-normal leading-4 text-text-muted">
                {summary}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {status}

          {canReorder ? (
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              <button
                type="button"
                className={cardIconButtonClassName}
                disabled={index === 0}
                onClick={() => onMove(itemId, "up")}
                aria-label={`Move ${itemLabel} ${index + 1} up`}
              >
                <ArrowUp aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={cardIconButtonClassName}
                disabled={index === total - 1}
                onClick={() => onMove(itemId, "down")}
                aria-label={`Move ${itemLabel} ${index + 1} down`}
              >
                <ArrowDown
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              </button>
            </div>
          ) : null}

          {canCollapse ? (
            <button
              type="button"
              className={cardIconButtonClassName}
              onClick={() => onToggleCollapsed(itemId)}
              aria-label={`${isCardCollapsed ? "Expand" : "Collapse"} ${itemLabel} ${index + 1}`}
              aria-expanded={!isCardCollapsed}
              aria-controls={`${itemId}-fields`}
            >
              {isCardCollapsed ? (
                <ChevronDown
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              ) : (
                <ChevronUp
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              )}
            </button>
          ) : null}

          {actions}
        </div>
      </div>

      {isCardCollapsed ? null : (
        <div id={`${itemId}-fields`}>
          {children}
        </div>
      )}
    </div>
  );
}

export const ProfileForm = forwardRef<ProfileFormHandle, ProfileFormProps>(
function ProfileForm(
  {
    draftStorageKey,
    personalInfo,
    professionalInfo,
    workExperience,
    education,
    jobPreferences,
    missingItems,
    onDirtyChange,
  },
  ref,
): JSX.Element {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );
  const [fieldValues, setFieldValues] = useState<ProfileScalarValues>(() =>
    getInitialScalarValues({ personalInfo, professionalInfo, jobPreferences }),
  );
  const [skills, setSkills] = useState<string[]>(professionalInfo.skills);
  const [industries, setIndustries] = useState<string[]>(
    professionalInfo.industries,
  );
  const [jobTitles, setJobTitles] = useState<string[]>(
    jobPreferences.jobTitlesSeeking,
  );
  const [locations, setLocations] = useState<string[]>(
    jobPreferences.preferredLocations,
  );
  const [remotePreferences, setRemotePreferences] = useState<string[]>(
    normalizeRemotePreferences(jobPreferences.remotePreferences),
  );
  const [workRoles, setWorkRoles] = useState<WorkRole[]>(
    workExperience.length > 0 ? workExperience : [createEmptyRole(0)],
  );
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    education.length > 0 ? education : [createEmptyEducation(0)],
  );
  const [drafts, setDrafts] = useState<Record<ArrayFieldKind, string>>({
    skills: "",
    industries: "",
    jobTitles: "",
    locations: "",
  });
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");
  const [draftStatus, setDraftStatus] = useState<
    "idle" | "restored" | "saved"
  >("idle");
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);
  const [collapsedRoleIds, setCollapsedRoleIds] = useState<string[]>([]);
  const [collapsedEducationIds, setCollapsedEducationIds] = useState<string[]>(
    [],
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const cancelDeleteButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteDialogRef = useRef<HTMLDivElement | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedAutosaveRef = useRef(false);
  const hasInitialMissingItems = missingItems.length > 0;

  const currentProfileSnapshot = useMemo(
    () =>
      createProfileSnapshot({
        educationEntries,
        fieldValues,
        industries,
        jobTitles,
        locations,
        remotePreferences,
        skills,
        workRoles,
      }),
    [
      educationEntries,
      fieldValues,
      industries,
      jobTitles,
      locations,
      remotePreferences,
      skills,
      workRoles,
    ],
  );
  const [savedProfileSnapshot, setSavedProfileSnapshot] =
    useState(currentProfileSnapshot);
  const isDirty = currentProfileSnapshot !== savedProfileSnapshot;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const missingKeys = useMemo(() => {
    const next = new Set<CompletionFieldKey>();

    if (!fieldValues.fullName.trim()) {
      next.add("fullName");
    }
    if (!fieldValues.email.trim()) {
      next.add("email");
    }
    if (!fieldValues.phone.trim()) {
      next.add("phone");
    }
    if (!fieldValues.location.trim()) {
      next.add("location");
    }
    if (!fieldValues.currentTitle.trim()) {
      next.add("currentTitle");
    }
    if (
      !fieldValues.experienceLevel.trim() ||
      !fieldValues.yearsExperience.trim()
    ) {
      next.add("experience");
    }
    if (skills.length === 0) {
      next.add("skills");
    }
    if (!hasCompleteRole(workRoles)) {
      next.add("workExperience");
    }
    if (!hasCompleteEducationEntry(educationEntries)) {
      next.add("education");
    }
    if (jobTitles.length === 0) {
      next.add("jobTitlesSeeking");
    }
    if (remotePreferences.length === 0) {
      next.add("remotePreference");
    }
    if (!fieldValues.workAuthorization.trim()) {
      next.add("workAuthorization");
    }

    return next;
  }, [
    educationEntries,
    fieldValues,
    jobTitles,
    remotePreferences,
    skills,
    workRoles,
  ]);

  function isMissing(key: CompletionFieldKey): boolean {
    return missingKeys.has(key);
  }

  const firstMissingTargetId = useMemo(
    () => getFirstMissingTargetId(missingKeys),
    [missingKeys],
  );

  function updateFieldValue(
    fieldName: ProfileDraftFieldName,
    value: string,
  ): void {
    setFieldValues((current) => ({ ...current, [fieldName]: value }));
  }

  function toggleRemotePreference(value: string): void {
    setRemotePreferences((current) => {
      if (value === "any") {
        return current.includes("any") ? [] : ["any"];
      }

      const withoutAny = current.filter((preference) => preference !== "any");
      return withoutAny.includes(value)
        ? withoutAny.filter((preference) => preference !== value)
        : normalizeRemotePreferences([...withoutAny, value]);
    });
  }

  const collectProfileDraft = useCallback((): ProfileFormDraft => {
    return {
      version: 1,
      updatedAt: Date.now(),
      fields: fieldValues,
      skills,
      industries,
      workRoles,
      educationEntries,
      jobTitles,
      locations,
      remotePreferences,
    };
  }, [
    educationEntries,
    fieldValues,
    industries,
    jobTitles,
    locations,
    remotePreferences,
    skills,
    workRoles,
  ]);

  const saveDraftToLocalStorage = useCallback((): void => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify(collectProfileDraft()),
      );
      setDraftStatus("saved");
    } catch (error) {
      console.error("[profile/form] save local draft", error);
    }
  }, [collectProfileDraft, draftStorageKey]);

  const scheduleDraftSave = useCallback((): void => {
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(() => {
      saveDraftToLocalStorage();
      draftSaveTimeoutRef.current = null;
    }, 700);
  }, [saveDraftToLocalStorage]);

  useEffect(() => {
    let draft: ProfileFormDraft | null = null;

    try {
      draft = parseProfileFormDraft(localStorage.getItem(draftStorageKey));
    } catch (error) {
      console.error("[profile/form] restore local draft", error);
      return;
    }

    if (!draft) {
      return;
    }

    const restoreTimer = setTimeout(() => {
      setFieldValues((current) => ({ ...current, ...draft.fields }));
      setSkills(draft.skills);
      setIndustries(draft.industries);
      setJobTitles(draft.jobTitles);
      setLocations(draft.locations);
      setRemotePreferences(draft.remotePreferences);
      setWorkRoles(
        draft.workRoles.length > 0 ? draft.workRoles : [createEmptyRole(0)],
      );
      setEducationEntries(
        draft.educationEntries.length > 0
          ? draft.educationEntries
          : [createEmptyEducation(0)],
      );
      setDraftStatus("restored");
    }, 0);

    return () => clearTimeout(restoreTimer);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!hasInitializedAutosaveRef.current) {
      hasInitializedAutosaveRef.current = true;
      return;
    }

    scheduleDraftSave();
  }, [
    educationEntries,
    fieldValues,
    industries,
    jobTitles,
    locations,
    remotePreferences,
    scheduleDraftSave,
    skills,
    workRoles,
  ]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }

    try {
      localStorage.removeItem(draftStorageKey);
    } catch (error) {
      console.error("[profile/form] clear local draft", error);
    }

    const clearStatusTimer = setTimeout(() => {
      setSavedProfileSnapshot(currentProfileSnapshot);
      setDraftStatus("idle");
    }, 0);

    return () => clearTimeout(clearStatusTimer);
  }, [currentProfileSnapshot, draftStorageKey, state.success]);

  useEffect(() => {
    if (!state.error) {
      return;
    }

    const focusTimer = setTimeout(() => {
      const target = document.getElementById(firstMissingTargetId);
      if (!target) {
        return;
      }

      target.scrollIntoView({ block: "center", behavior: "smooth" });
      target.focus({ preventScroll: true });
    }, 0);

    return () => clearTimeout(focusTimer);
  }, [firstMissingTargetId, state.error]);

  useEffect(
    () => () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!deleteConfirmation) {
      return undefined;
    }

    cancelDeleteButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        const trigger = deleteTriggerRef.current;
        setDeleteConfirmation(null);
        setTimeout(() => trigger?.focus(), 0);
        return;
      }

      if (event.key !== "Tab" || !deleteDialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(deleteDialogRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteConfirmation]);

  const applyExtractedProfile = useCallback(
    (extractedProfile: ExtractedProfileData): void => {
      setFieldValues((current) => ({
        ...current,
        fullName: applyExtractedValue(
          current.fullName,
          extractedProfile.personalInfo.fullName,
        ),
        email: applyExtractedValue(
          current.email,
          extractedProfile.personalInfo.email,
        ),
        phone: applyExtractedValue(
          current.phone,
          extractedProfile.personalInfo.phone,
        ),
        location: applyExtractedValue(
          current.location,
          extractedProfile.personalInfo.location,
        ),
        linkedinUrl: applyExtractedValue(
          current.linkedinUrl,
          extractedProfile.personalInfo.linkedinUrl,
        ),
        portfolioUrl: applyExtractedValue(
          current.portfolioUrl,
          extractedProfile.personalInfo.portfolioUrl,
        ),
        workAuthorization: applyExtractedValue(
          current.workAuthorization,
          extractedProfile.personalInfo.workAuthorization,
        ),
        currentTitle: applyExtractedValue(
          current.currentTitle,
          extractedProfile.professionalInfo.currentTitle,
        ),
        experienceLevel: applyExtractedValue(
          current.experienceLevel,
          extractedProfile.professionalInfo.experienceLevel,
        ),
        yearsExperience: applyExtractedValue(
          current.yearsExperience,
          extractedProfile.professionalInfo.yearsExperience,
        ),
        salaryExpectation: applyExtractedValue(
          current.salaryExpectation,
          extractedProfile.jobPreferences.salaryExpectation,
        ),
        coverLetterTone: applyExtractedValue(
          current.coverLetterTone,
          extractedProfile.jobPreferences.coverLetterTone,
        ),
      }));
      setSkills((current) => {
        const extractedSkills = normalizeList(
          extractedProfile.professionalInfo.skills,
        );
        return extractedSkills.length > 0 ? extractedSkills : current;
      });
      setIndustries((current) => {
        const extractedIndustries = normalizeList(
          extractedProfile.professionalInfo.industries,
        );
        return extractedIndustries.length > 0 ? extractedIndustries : current;
      });
      setJobTitles((current) => {
        const extractedJobTitles = normalizeList(
          extractedProfile.jobPreferences.jobTitlesSeeking,
        );
        return extractedJobTitles.length > 0 ? extractedJobTitles : current;
      });
      setLocations((current) => {
        const extractedLocations = normalizeList(
          extractedProfile.jobPreferences.preferredLocations,
        );
        return extractedLocations.length > 0 ? extractedLocations : current;
      });
      setRemotePreferences((current) => {
        const extractedRemotePreferences = normalizeRemotePreferences(
          extractedProfile.jobPreferences.remotePreferences,
        );
        return extractedRemotePreferences.length > 0
          ? extractedRemotePreferences
          : current;
      });

      const extractedRoles = extractedProfile.workExperience
        .filter(roleHasData)
        .map((role) => ({
          ...role,
          endDate: role.current ? "" : role.endDate,
        }));
      const extractedEducation = extractedProfile.education.filter(
        educationEntryHasData,
      );
      if (extractedRoles.length > 0) {
        setCollapsedRoleIds([]);
        setWorkRoles(extractedRoles);
      }

      if (extractedEducation.length > 0) {
        setCollapsedEducationIds([]);
        setEducationEntries(extractedEducation);
      }
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      applyExtractedProfile,
    }),
    [applyExtractedProfile],
  );

  function updateDraft(kind: ArrayFieldKind, value: string): void {
    setDrafts((current) => ({ ...current, [kind]: value }));
  }

  function addListValue(
    kind: ArrayFieldKind,
    setter: (updater: (current: string[]) => string[]) => void,
  ): void {
    const nextValue = drafts[kind].trim();
    if (!nextValue) {
      return;
    }

    setter((current) => normalizeList([...current, nextValue]));
    updateDraft(kind, "");
  }

  function removeListValue(
    value: string,
    setter: (updater: (current: string[]) => string[]) => void,
  ): void {
    setter((current) => current.filter((item) => item !== value));
  }

  function updateRole(
    roleId: string,
    field: keyof WorkRole,
    value: string | boolean,
  ): void {
    setCollapsedRoleIds((current) => current.filter((id) => id !== roleId));
    setWorkRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              [field]: value,
              ...(field === "current" && value === true ? { endDate: "" } : {}),
            }
          : role,
      ),
    );
  }

  function addRole(): void {
    setWorkRoles((current) => {
      if (current.length >= 3) {
        return current;
      }

      const nextRole = createEmptyRole(current.length);
      setCollapsedRoleIds((collapsed) =>
        collapsed.filter((id) => id !== nextRole.id),
      );
      return [...current, nextRole];
    });
  }

  function deleteRole(roleId: string): void {
    setCollapsedRoleIds((current) => current.filter((id) => id !== roleId));
    setWorkRoles((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== roleId),
    );
  }

  function removeRole(roleId: string, trigger: HTMLButtonElement): void {
    const role = workRoles.find((currentRole) => currentRole.id === roleId);

    if (!role) {
      return;
    }

    if (roleHasData(role)) {
      deleteTriggerRef.current = trigger;
      setDeleteConfirmation({
        confirmLabel: "Delete role",
        description:
          "This role contains entered information. Deleting it will remove those unsaved details from the form.",
        itemId: roleId,
        kind: "role",
        title: "Delete this role?",
      });
      return;
    }

    deleteRole(roleId);
  }

  const reorderRoles = useCallback(
    (sourceId: string, targetId: string, edge: Edge): void => {
      setWorkRoles((current) => {
        const sourceIndex = current.findIndex((role) => role.id === sourceId);
        const targetIndex = current.findIndex((role) => role.id === targetId);

        if (
          sourceIndex === -1 ||
          targetIndex === -1 ||
          sourceIndex === targetIndex
        ) {
          return current;
        }

        const finishIndex = getFinishIndex({ edge, sourceIndex, targetIndex });

        if (finishIndex === sourceIndex) {
          return current;
        }

        const next = reorder({
          list: current,
          startIndex: sourceIndex,
          finishIndex,
        });
        const nextIndex = next.findIndex((role) => role.id === sourceId);
        setReorderAnnouncement(
          `Role moved to position ${nextIndex + 1} of ${next.length}.`,
        );
        return next;
      });
    },
    [],
  );

  const moveRole = useCallback(
    (roleId: string, direction: ReorderDirection): void => {
      setWorkRoles((current) => {
        const sourceIndex = current.findIndex((role) => role.id === roleId);
        const finishIndex =
          direction === "up" ? sourceIndex - 1 : sourceIndex + 1;

        if (
          sourceIndex === -1 ||
          finishIndex < 0 ||
          finishIndex >= current.length
        ) {
          return current;
        }

        const next = reorder({
          list: current,
          startIndex: sourceIndex,
          finishIndex,
        });
        setReorderAnnouncement(
          `Role moved to position ${finishIndex + 1} of ${next.length}.`,
        );
        return next;
      });
    },
    [],
  );

  function updateEducation(
    educationId: string,
    field: keyof EducationEntry,
    value: string,
  ): void {
    setCollapsedEducationIds((current) =>
      current.filter((id) => id !== educationId),
    );
    setEducationEntries((current) =>
      current.map((entry) =>
        entry.id === educationId ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  function addEducation(): void {
    setEducationEntries((current) => {
      const nextEntry = createEmptyEducation(current.length);
      setCollapsedEducationIds((collapsed) =>
        collapsed.filter((id) => id !== nextEntry.id),
      );
      return [...current, nextEntry];
    });
  }

  function deleteEducation(educationId: string): void {
    setCollapsedEducationIds((current) =>
      current.filter((id) => id !== educationId),
    );
    setEducationEntries((current) =>
      current.length === 1
        ? current
        : current.filter((entry) => entry.id !== educationId),
    );
  }

  function removeEducation(
    educationId: string,
    trigger: HTMLButtonElement,
  ): void {
    const entry = educationEntries.find((item) => item.id === educationId);

    if (!entry) {
      return;
    }

    if (educationEntryHasData(entry)) {
      deleteTriggerRef.current = trigger;
      setDeleteConfirmation({
        confirmLabel: "Delete education",
        description:
          "This education entry contains entered information. Deleting it will remove those unsaved details from the form.",
        itemId: educationId,
        kind: "education",
        title: "Delete this education entry?",
      });
      return;
    }

    deleteEducation(educationId);
  }

  function closeDeleteConfirmation(): void {
    const trigger = deleteTriggerRef.current;
    setDeleteConfirmation(null);
    setTimeout(() => trigger?.focus(), 0);
  }

  function confirmDelete(): void {
    if (!deleteConfirmation) {
      return;
    }

    if (deleteConfirmation.kind === "role") {
      deleteRole(deleteConfirmation.itemId);
    } else {
      deleteEducation(deleteConfirmation.itemId);
    }

    closeDeleteConfirmation();
  }

  function toggleRoleCollapsed(roleId: string): void {
    setCollapsedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  }

  function toggleEducationCollapsed(educationId: string): void {
    setCollapsedEducationIds((current) =>
      current.includes(educationId)
        ? current.filter((id) => id !== educationId)
        : [...current, educationId],
    );
  }

  const reorderEducation = useCallback(
    (sourceId: string, targetId: string, edge: Edge): void => {
      setEducationEntries((current) => {
        const sourceIndex = current.findIndex((entry) => entry.id === sourceId);
        const targetIndex = current.findIndex((entry) => entry.id === targetId);

        if (
          sourceIndex === -1 ||
          targetIndex === -1 ||
          sourceIndex === targetIndex
        ) {
          return current;
        }

        const finishIndex = getFinishIndex({ edge, sourceIndex, targetIndex });

        if (finishIndex === sourceIndex) {
          return current;
        }

        const next = reorder({
          list: current,
          startIndex: sourceIndex,
          finishIndex,
        });
        const nextIndex = next.findIndex((entry) => entry.id === sourceId);
        setReorderAnnouncement(
          `Education moved to position ${nextIndex + 1} of ${next.length}.`,
        );
        return next;
      });
    },
    [],
  );

  const moveEducation = useCallback(
    (educationId: string, direction: ReorderDirection): void => {
      setEducationEntries((current) => {
        const sourceIndex = current.findIndex(
          (entry) => entry.id === educationId,
        );
        const finishIndex =
          direction === "up" ? sourceIndex - 1 : sourceIndex + 1;

        if (
          sourceIndex === -1 ||
          finishIndex < 0 ||
          finishIndex >= current.length
        ) {
          return current;
        }

        const next = reorder({
          list: current,
          startIndex: sourceIndex,
          finishIndex,
        });
        setReorderAnnouncement(
          `Education moved to position ${finishIndex + 1} of ${next.length}.`,
        );
        return next;
      });
    },
    [],
  );

  const isPersonalSectionMissing =
    isMissing("fullName") ||
    isMissing("email") ||
    isMissing("phone") ||
    isMissing("location") ||
    isMissing("workAuthorization");
  const isProfessionalSectionMissing =
    isMissing("currentTitle") ||
    isMissing("experience") ||
    isMissing("skills");
  const isJobPreferencesSectionMissing =
    isMissing("jobTitlesSeeking") || isMissing("remotePreference");
  const saveBarTitle = pending
    ? "Saving profile"
    : state.error
      ? "Save needs attention"
      : isDirty
        ? "Unsaved changes"
        : "Profile saved";
  const saveBarDescription = pending
    ? "Writing your latest profile changes."
    : state.error
      ? state.error
      : state.message && !isDirty
        ? state.message
        : draftStatus === "restored"
          ? "Unsaved draft restored from this browser."
          : draftStatus === "saved" && isDirty
            ? "Unsaved changes saved locally in this browser."
            : isDirty
              ? "Changes are saved locally until you save your profile."
              : "All profile changes are saved.";

  return (
    <form
      id="profile-form"
      ref={formRef}
      className="space-y-6 pb-72 md:pb-36"
      action={formAction}
      aria-label="Profile information"
      aria-describedby={
        hasInitialMissingItems ? "profile-initial-missing-status" : undefined
      }
      onChange={scheduleDraftSave}
      onInput={scheduleDraftSave}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {reorderAnnouncement}
      </p>
      {hasInitialMissingItems ? (
        <p id="profile-initial-missing-status" className="sr-only">
          Some profile completion requirements are missing.
        </p>
      ) : null}
      <input name="skills" type="hidden" value={JSON.stringify(skills)} />
      <input name="industries" type="hidden" value={JSON.stringify(industries)} />
      <input
        name="workExperience"
        type="hidden"
        value={JSON.stringify(workRoles)}
      />
      <input
        name="education"
        type="hidden"
        value={JSON.stringify(educationEntries)}
      />
      <input
        name="jobTitlesSeeking"
        type="hidden"
        value={JSON.stringify(jobTitles)}
      />
      <input
        name="preferredLocations"
        type="hidden"
        value={JSON.stringify(locations)}
      />
      <input
        name="remotePreferences"
        type="hidden"
        value={JSON.stringify(remotePreferences)}
      />

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <SectionHeader
          description="Contact details used across matching and generated resumes."
          icon={
            <User aria-hidden="true" className="size-5" strokeWidth={2} />
          }
          iconClassName="bg-accent-muted text-accent"
          isMissing={isPersonalSectionMissing}
          showStatus
          title="Personal Info"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="profile-field-full-name">
              Full Name
            </label>
            <input
              className={getFieldClassName(inputClassName, isMissing("fullName"))}
              id="profile-field-full-name"
              name="fullName"
              onChange={(event) =>
                updateFieldValue("fullName", event.target.value)
              }
              type="text"
              value={fieldValues.fullName}
            />
            <RequiredHelper show={isMissing("fullName")} />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="profile-field-email">
              Application Email
            </label>
            <input
              className={getFieldClassName(inputClassName, isMissing("email"))}
              id="profile-field-email"
              name="email"
              onChange={(event) =>
                updateFieldValue("email", event.target.value)
              }
              placeholder="Email for job applications"
              type="email"
              value={fieldValues.email}
            />
            <RequiredHelper show={isMissing("email")} />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="profile-field-phone">
              Phone Number
            </label>
            <input
              className={getFieldClassName(inputClassName, isMissing("phone"))}
              id="profile-field-phone"
              name="phone"
              onChange={(event) =>
                updateFieldValue("phone", event.target.value)
              }
              placeholder="Add phone number"
              type="tel"
              value={fieldValues.phone}
            />
            <RequiredHelper show={isMissing("phone")} />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="profile-field-location">
              Location
            </label>
            <input
              className={getFieldClassName(inputClassName, isMissing("location"))}
              id="profile-field-location"
              name="location"
              onChange={(event) =>
                updateFieldValue("location", event.target.value)
              }
              placeholder="City, country"
              type="text"
              value={fieldValues.location}
            />
            <RequiredHelper show={isMissing("location")} />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="linkedin-url">
              LinkedIn URL
            </label>
            <input
              className={inputClassName}
              id="linkedin-url"
              name="linkedinUrl"
              onChange={(event) =>
                updateFieldValue("linkedinUrl", event.target.value)
              }
              type="url"
              value={fieldValues.linkedinUrl}
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="portfolio-url">
              Portfolio/GitHub
            </label>
            <input
              className={inputClassName}
              id="portfolio-url"
              name="portfolioUrl"
              onChange={(event) =>
                updateFieldValue("portfolioUrl", event.target.value)
              }
              type="url"
              value={fieldValues.portfolioUrl}
            />
          </div>

          <div className={fieldGroupClassName}>
            <label
              className={labelClassName}
              htmlFor="profile-field-work-authorization"
            >
              Work Authorization
            </label>
            <select
              className={getFieldClassName(
                selectClassName,
                isMissing("workAuthorization"),
              )}
              id="profile-field-work-authorization"
              name="workAuthorization"
              onChange={(event) =>
                updateFieldValue("workAuthorization", event.target.value)
              }
              value={fieldValues.workAuthorization}
            >
              <option value="">Select authorization</option>
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent resident</option>
              <option value="visa_required">Visa required</option>
            </select>
            <RequiredHelper show={isMissing("workAuthorization")} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <SectionHeader
          description="Experience, skills, and industries used for job scoring."
          icon={
            <BriefcaseBusiness
              aria-hidden="true"
              className="size-5"
              strokeWidth={2}
            />
          }
          iconClassName="bg-info-lightest text-info-foreground"
          isMissing={isProfessionalSectionMissing}
          showStatus
          title="Professional Info"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={fieldGroupClassName}>
            <label
              className={labelClassName}
              htmlFor="profile-field-current-title"
            >
              Current Job Title
            </label>
            <input
              className={getFieldClassName(
                inputClassName,
                isMissing("currentTitle"),
              )}
              id="profile-field-current-title"
              name="currentTitle"
              onChange={(event) =>
                updateFieldValue("currentTitle", event.target.value)
              }
              type="text"
              value={fieldValues.currentTitle}
            />
            <RequiredHelper show={isMissing("currentTitle")} />
          </div>

          <div className={fieldGroupClassName}>
            <label
              className={labelClassName}
              htmlFor="profile-field-experience-level"
            >
              Experience Level
            </label>
            <select
              className={getFieldClassName(
                selectClassName,
                isMissing("experience") && !fieldValues.experienceLevel.trim(),
              )}
              id="profile-field-experience-level"
              name="experienceLevel"
              onChange={(event) =>
                updateFieldValue("experienceLevel", event.target.value)
              }
              value={fieldValues.experienceLevel}
            >
              <option value="">Select level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
            <RequiredHelper
              show={isMissing("experience") && !fieldValues.experienceLevel.trim()}
            />
          </div>

          <div className={fieldGroupClassName}>
            <label
              className={labelClassName}
              htmlFor="profile-field-years-experience"
            >
              Years of Experience
            </label>
            <input
              className={getFieldClassName(
                inputClassName,
                isMissing("experience") && !fieldValues.yearsExperience.trim(),
              )}
              id="profile-field-years-experience"
              min="0"
              name="yearsExperience"
              onChange={(event) =>
                updateFieldValue("yearsExperience", event.target.value)
              }
              type="number"
              value={fieldValues.yearsExperience}
            />
            <RequiredHelper
              show={isMissing("experience") && !fieldValues.yearsExperience.trim()}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TagInput
            addLabel="Add"
            draft={drafts.skills}
            inputId="profile-field-skills"
            inputLabel="Skills"
            inputPlaceholder="Add a skill"
            isMissing={isMissing("skills")}
            kind="skills"
            onAdd={() => addListValue("skills", setSkills)}
            onDraftChange={updateDraft}
            onRemove={(value) => removeListValue(value, setSkills)}
            tagClassName="bg-success-lightest text-success-foreground"
            values={skills}
          />

          <TagInput
            addLabel="Add"
            draft={drafts.industries}
            inputId="industries-entry"
            inputLabel="Industries"
            inputPlaceholder="Add an industry"
            isMissing={false}
            kind="industries"
            onAdd={() => addListValue("industries", setIndustries)}
            onDraftChange={updateDraft}
            onRemove={(value) => removeListValue(value, setIndustries)}
            tagClassName="bg-info-lightest text-info-foreground"
            values={industries}
          />
        </div>
      </section>

      <section
        id="profile-section-work-experience"
        className={getSectionClassName(isMissing("workExperience"))}
        tabIndex={-1}
      >
        <SectionHeader
          action={
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={workRoles.length >= 3}
              onClick={addRole}
            >
              <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
              Add role
            </button>
          }
          description="Add up to three recent roles for matching context."
          icon={
            <ClipboardList
              aria-hidden="true"
              className="size-5"
              strokeWidth={2}
            />
          }
          iconClassName="bg-accent-muted text-accent"
          isMissing={isMissing("workExperience")}
          showStatus
          title="Work Experience"
        >
            <RequiredHelper show={isMissing("workExperience")} />
        </SectionHeader>

        <div className="mt-6 space-y-5">
          {workRoles.map((role, index) => (
            <ReorderableProfileCard
              key={role.id}
              actions={
                <button
                  type="button"
                  className={cardIconButtonClassName}
                  disabled={workRoles.length === 1}
                  onClick={(event) => removeRole(role.id, event.currentTarget)}
                  aria-label={`Remove role ${index + 1}`}
                >
                  <X aria-hidden="true" className="size-4" strokeWidth={2} />
                </button>
              }
              isCollapsed={collapsedRoleIds.includes(role.id)}
              index={index}
              itemId={role.id}
              itemLabel="role"
              onMove={moveRole}
              onReorder={reorderRoles}
              onToggleCollapsed={toggleRoleCollapsed}
              reorderKind="role"
              status={
                <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium leading-4 text-text-secondary">
                  {role.current ? "Current" : "Previous"}
                </span>
              }
              summary={getRoleSummary(role)}
              title={`Role ${index + 1}`}
              total={workRoles.length}
            >
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-company`}>
                    Company Name
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("workExperience") &&
                        index === 0 &&
                        !role.companyName.trim(),
                    )}
                    id={`${role.id}-company`}
                    onChange={(event) =>
                      updateRole(role.id, "companyName", event.target.value)
                    }
                    type="text"
                    value={role.companyName}
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-title`}>
                    Job Title
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("workExperience") &&
                        index === 0 &&
                        !role.jobTitle.trim(),
                    )}
                    id={`${role.id}-title`}
                    onChange={(event) =>
                      updateRole(role.id, "jobTitle", event.target.value)
                    }
                    type="text"
                    value={role.jobTitle}
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-start`}>
                    Start Date
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("workExperience") &&
                        index === 0 &&
                        !role.startDate.trim(),
                    )}
                    id={`${role.id}-start`}
                    onChange={(event) =>
                      updateRole(role.id, "startDate", event.target.value)
                    }
                    type="month"
                    value={role.startDate}
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <label className={labelClassName} htmlFor={`${role.id}-end`}>
                      End Date
                    </label>

                    <label className="flex shrink-0 items-center gap-2 text-[14px] font-medium leading-5 text-text-primary">
                      <input
                        checked={role.current}
                        className="size-4 rounded border-border text-accent focus:ring-accent"
                        onChange={(event) =>
                          updateRole(role.id, "current", event.target.checked)
                        }
                        type="checkbox"
                      />
                      Currently working here
                    </label>
                  </div>

                  <input
                    className={inputClassName}
                    disabled={role.current}
                    id={`${role.id}-end`}
                    onChange={(event) =>
                      updateRole(role.id, "endDate", event.target.value)
                    }
                    placeholder="Present"
                    type="month"
                    value={role.endDate}
                  />
                </div>
              </div>

              <div className={`${fieldGroupClassName} mt-4`}>
                <label
                  className={labelClassName}
                  htmlFor={`${role.id}-responsibilities`}
                >
                  Key Responsibilities
                </label>
                <textarea
                  className={getFieldClassName(
                    textareaClassName,
                    isMissing("workExperience") &&
                      index === 0 &&
                      !role.responsibilities.trim(),
                  )}
                  id={`${role.id}-responsibilities`}
                  onChange={(event) =>
                    updateRole(role.id, "responsibilities", event.target.value)
                  }
                  value={role.responsibilities}
                />
                <RequiredHelper
                  show={
                    isMissing("workExperience") &&
                    index === 0 &&
                    !role.responsibilities.trim()
                  }
                />
              </div>
            </ReorderableProfileCard>
          ))}
        </div>
      </section>

      <section
        id="profile-section-education"
        className={getSectionClassName(isMissing("education"))}
        tabIndex={-1}
      >
        <SectionHeader
          action={
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
              onClick={addEducation}
            >
              <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
              Add education
            </button>
          }
          description="Add degrees, programs, bootcamps, or other relevant training."
          icon={
              <GraduationCap
                aria-hidden="true"
                className="size-5"
                strokeWidth={2}
              />
          }
          iconClassName="bg-success-lightest text-success-foreground"
          isMissing={isMissing("education")}
          showStatus
          title="Education"
        >
          <RequiredHelper show={isMissing("education")} />
        </SectionHeader>

        <div className="mt-6 space-y-5">
          {educationEntries.map((entry, index) => (
            <ReorderableProfileCard
              key={entry.id}
              actions={
                <button
                  type="button"
                  className={cardIconButtonClassName}
                  disabled={educationEntries.length === 1}
                  onClick={(event) =>
                    removeEducation(entry.id, event.currentTarget)
                  }
                  aria-label={`Remove education ${index + 1}`}
                >
                  <X aria-hidden="true" className="size-4" strokeWidth={2} />
                </button>
              }
              isCollapsed={collapsedEducationIds.includes(entry.id)}
              index={index}
              itemId={entry.id}
              itemLabel="education"
              onMove={moveEducation}
              onReorder={reorderEducation}
              onToggleCollapsed={toggleEducationCollapsed}
              reorderKind="education"
              summary={getEducationSummary(entry)}
              title={`Education ${index + 1}`}
              total={educationEntries.length}
            >
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className={fieldGroupClassName}>
                  <label
                    className={labelClassName}
                    htmlFor={`${entry.id}-degree`}
                  >
                    Highest Degree
                  </label>
                  <select
                    className={getFieldClassName(
                      selectClassName,
                      isMissing("education") &&
                        index === 0 &&
                        !entry.highestDegree.trim(),
                    )}
                    id={`${entry.id}-degree`}
                    onChange={(event) =>
                      updateEducation(
                        entry.id,
                        "highestDegree",
                        event.target.value,
                      )
                    }
                    value={entry.highestDegree}
                  >
                    <option value="">Select degree</option>
                    <option value="bachelors">Bachelor&apos;s degree</option>
                    <option value="masters">Master&apos;s degree</option>
                    <option value="phd">PhD</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="self_taught">Self-taught</option>
                  </select>
                </div>

                <div className={fieldGroupClassName}>
                  <label
                    className={labelClassName}
                    htmlFor={`${entry.id}-field`}
                  >
                    Field of Study
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("education") &&
                        index === 0 &&
                        !entry.fieldOfStudy.trim(),
                    )}
                    id={`${entry.id}-field`}
                    onChange={(event) =>
                      updateEducation(
                        entry.id,
                        "fieldOfStudy",
                        event.target.value,
                      )
                    }
                    placeholder="Computer Science"
                    type="text"
                    value={entry.fieldOfStudy}
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label
                    className={labelClassName}
                    htmlFor={`${entry.id}-institution`}
                  >
                    Institution Name
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("education") &&
                        index === 0 &&
                        !entry.institutionName.trim(),
                    )}
                    id={`${entry.id}-institution`}
                    onChange={(event) =>
                      updateEducation(
                        entry.id,
                        "institutionName",
                        event.target.value,
                      )
                    }
                    placeholder="University or program"
                    type="text"
                    value={entry.institutionName}
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label
                    className={labelClassName}
                    htmlFor={`${entry.id}-graduation-year`}
                  >
                    Graduation Year
                  </label>
                  <input
                    className={getFieldClassName(
                      inputClassName,
                      isMissing("education") &&
                        index === 0 &&
                        !entry.graduationYear.trim(),
                    )}
                    id={`${entry.id}-graduation-year`}
                    onChange={(event) =>
                      updateEducation(
                        entry.id,
                        "graduationYear",
                        event.target.value,
                      )
                    }
                    placeholder="2020"
                    type="text"
                    value={entry.graduationYear}
                  />
                </div>
              </div>
            </ReorderableProfileCard>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <SectionHeader
          description="Search preferences used when discovering and ranking roles."
          icon={
            <SlidersHorizontal
              aria-hidden="true"
              className="size-5"
              strokeWidth={2}
            />
          }
          iconClassName="bg-info-lightest text-info-foreground"
          isMissing={isJobPreferencesSectionMissing}
          showStatus
          title="Job Preferences"
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <TagInput
            addLabel="Add"
            draft={drafts.jobTitles}
            inputId="profile-field-job-titles-seeking"
            inputLabel="Job Titles Seeking"
            inputPlaceholder="Add title"
            isMissing={isMissing("jobTitlesSeeking")}
            kind="jobTitles"
            onAdd={() => addListValue("jobTitles", setJobTitles)}
            onDraftChange={updateDraft}
            onRemove={(value) => removeListValue(value, setJobTitles)}
            tagClassName="bg-accent-muted text-accent"
            values={jobTitles}
          />

          <fieldset className={fieldGroupClassName}>
            <legend className={labelClassName}>Remote Preference</legend>
            <div
              id="profile-field-remote-preference"
              className={`scroll-mt-24 rounded-md border bg-surface p-2 shadow-sm ${
                isMissing("remotePreference")
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-border"
              }`}
              tabIndex={-1}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {remotePreferenceOptions.map((option) => {
                  const inputId = `profile-field-remote-preference-${option.value}`;
                  const isChecked = remotePreferences.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-[14px] font-medium leading-5 transition-[background-color,border-color,color] ${
                        isChecked
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border bg-surface text-text-primary hover:border-accent hover:bg-surface-secondary"
                      }`}
                      htmlFor={inputId}
                    >
                      <input
                        checked={isChecked}
                        className="size-4 rounded-sm border-border text-accent focus:ring-accent"
                        id={inputId}
                        name="remotePreference"
                        onChange={() => toggleRemotePreference(option.value)}
                        type="checkbox"
                        value={option.value}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
            <RequiredHelper show={isMissing("remotePreference")} />
          </fieldset>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="salary-expectation">
              Salary Expectation
            </label>
            <input
              className={inputClassName}
              id="salary-expectation"
              name="salaryExpectation"
              onChange={(event) =>
                updateFieldValue("salaryExpectation", event.target.value)
              }
              type="text"
              value={fieldValues.salaryExpectation}
            />
          </div>

          <TagInput
            addLabel="Add"
            draft={drafts.locations}
            inputId="preferred-locations-entry"
            inputLabel="Preferred Locations"
            inputPlaceholder="Add location"
            isMissing={false}
            kind="locations"
            onAdd={() => addListValue("locations", setLocations)}
            onDraftChange={updateDraft}
            onRemove={(value) => removeListValue(value, setLocations)}
            tagClassName="bg-surface-secondary text-text-secondary"
            values={locations}
          />

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="cover-letter-tone">
              Cover Letter Tone
            </label>
            <select
              className={selectClassName}
              id="cover-letter-tone"
              name="coverLetterTone"
              onChange={(event) =>
                updateFieldValue("coverLetterTone", event.target.value)
              }
              value={fieldValues.coverLetterTone}
            >
              <option value="">Select tone</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
        </div>
      </section>

      {deleteConfirmation ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-overlay/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteConfirmation();
            }
          }}
        >
          <div
            ref={deleteDialogRef}
            aria-describedby="delete-profile-card-description"
            aria-labelledby="delete-profile-card-title"
            aria-modal="true"
            className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--color-overlay)_22%,transparent)]"
            role="alertdialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-[16px] font-semibold leading-6 text-text-primary"
                  id="delete-profile-card-title"
                >
                  {deleteConfirmation.title}
                </h2>
                <p
                  className="mt-2 text-[14px] font-normal leading-5 text-text-secondary"
                  id="delete-profile-card-description"
                >
                  {deleteConfirmation.description}
                </p>
              </div>

              <button
                type="button"
                className={cardIconButtonClassName}
                onClick={closeDeleteConfirmation}
                aria-label="Close delete confirmation"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelDeleteButtonRef}
                type="button"
                className={secondaryButtonClassName}
                onClick={closeDeleteConfirmation}
              >
                Keep item
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-error px-4 text-[14px] font-medium leading-5 text-error-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
                onClick={confirmDelete}
              >
                {deleteConfirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[60] mx-auto max-w-[1216px] overflow-hidden rounded-xl border border-border/70 bg-surface/55 p-4 shadow-[0_28px_90px_color-mix(in_srgb,var(--color-overlay)_20%,transparent),0_12px_36px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_2px_10px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)] backdrop-blur-2xl backdrop-saturate-150 md:inset-x-8 md:bottom-6 md:p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface/50 via-accent-muted/35 to-info-lightest/35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-surface/70"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              {saveBarTitle}
            </h2>
            <p
              className={`mt-1 text-[12px] font-medium leading-4 ${
                state.error
                  ? "text-error"
                  : !isDirty && state.message
                    ? "text-success-foreground"
                    : "text-text-secondary"
              }`}
            >
              {saveBarDescription}
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin"
                strokeWidth={2}
              />
            ) : (
              <Save aria-hidden="true" className="size-4" strokeWidth={2} />
            )}
            {pending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>
    </form>
  );
});

type TagInputProps = {
  addLabel: string;
  draft: string;
  inputId: string;
  inputLabel: string;
  inputPlaceholder: string;
  isMissing: boolean;
  kind: ArrayFieldKind;
  onAdd: () => void;
  onDraftChange: (kind: ArrayFieldKind, value: string) => void;
  onRemove: (value: string) => void;
  tagClassName: string;
  values: string[];
};

function TagInput({
  addLabel,
  draft,
  inputId,
  inputLabel,
  inputPlaceholder,
  isMissing,
  kind,
  onAdd,
  onDraftChange,
  onRemove,
  tagClassName,
  values,
}: TagInputProps): JSX.Element {
  return (
    <div className={fieldGroupClassName}>
      <label className={labelClassName} htmlFor={inputId}>
        {inputLabel}
      </label>
      <div
        className={`flex flex-wrap gap-2 rounded-md border bg-surface px-3 py-3 shadow-sm ${
          isMissing ? "border-accent ring-1 ring-accent/30" : "border-border"
        }`}
      >
        {values.map((value) => (
          <span
            key={value}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium leading-4 ${tagClassName}`}
          >
            {value}
            <button
              type="button"
              className="inline-flex size-4 items-center justify-center rounded-full text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => onRemove(value)}
              aria-label={`Remove ${value}`}
            >
              <X aria-hidden="true" className="size-3" strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[160px] flex-1 scroll-mt-24 bg-surface text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
          id={inputId}
          onChange={(event) => onDraftChange(kind, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={inputPlaceholder}
          type="text"
          value={draft}
        />
        <button
          type="button"
          className="inline-flex min-h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary transition-[background-color,border-color,color] hover:border-accent hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={onAdd}
        >
          <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
          {addLabel}
        </button>
      </div>
      <RequiredHelper show={isMissing} />
    </div>
  );
}
