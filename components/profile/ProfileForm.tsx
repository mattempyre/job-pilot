import type { JSX } from "react";
import { BriefcaseBusiness, GraduationCap, Plus, Save, User } from "lucide-react";

type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
};

type ProfessionalInfo = {
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
};

type WorkRole = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

type EducationInfo = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

type JobPreferences = {
  jobTitlesSeeking: string[];
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string[];
  coverLetterTone: string;
};

type ProfileFormProps = {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  workExperience: WorkRole[];
  education: EducationInfo;
  jobPreferences: JobPreferences;
};

const inputClassName =
  "h-11 w-full rounded-md border border-border bg-surface px-3 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const readOnlyInputClassName =
  "h-11 w-full rounded-md border border-border bg-surface-secondary px-3 text-[14px] font-medium leading-5 text-text-secondary shadow-sm outline-none";

const selectClassName =
  "h-11 w-full rounded-md border border-border bg-surface px-3 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-1 focus:ring-accent";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const labelClassName =
  "text-[12px] font-medium uppercase leading-4 text-text-secondary";

const fieldGroupClassName = "flex flex-col gap-2";

export function ProfileForm({
  personalInfo,
  professionalInfo,
  workExperience,
  education,
  jobPreferences,
}: ProfileFormProps): JSX.Element {
  return (
    <form className="space-y-6" aria-label="Profile information">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
            <User aria-hidden="true" className="size-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              Personal Info
            </h2>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              Contact details used across matching and generated resumes.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="full-name">
              Full Name
            </label>
            <input
              className={inputClassName}
              defaultValue={personalInfo.fullName}
              id="full-name"
              name="fullName"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="email">
              Email
            </label>
            <input
              aria-readonly="true"
              className={readOnlyInputClassName}
              defaultValue={personalInfo.email}
              id="email"
              name="email"
              readOnly
              type="email"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="phone">
              Phone Number
            </label>
            <input
              className={inputClassName}
              defaultValue={personalInfo.phone}
              id="phone"
              name="phone"
              placeholder="Add phone number"
              type="tel"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="location">
              Location
            </label>
            <input
              className={inputClassName}
              defaultValue={personalInfo.location}
              id="location"
              name="location"
              placeholder="City, country"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="linkedin-url">
              LinkedIn URL
            </label>
            <input
              className={inputClassName}
              defaultValue={personalInfo.linkedinUrl}
              id="linkedin-url"
              name="linkedinUrl"
              type="url"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="portfolio-url">
              Portfolio/GitHub
            </label>
            <input
              className={inputClassName}
              defaultValue={personalInfo.portfolioUrl}
              id="portfolio-url"
              name="portfolioUrl"
              type="url"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="work-authorization">
              Work Authorization
            </label>
            <select
              className={selectClassName}
              defaultValue={personalInfo.workAuthorization}
              id="work-authorization"
              name="workAuthorization"
            >
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent resident</option>
              <option value="visa_required">Visa required</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info-lightest text-info-foreground">
            <BriefcaseBusiness
              aria-hidden="true"
              className="size-5"
              strokeWidth={2}
            />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              Professional Info
            </h2>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              Experience, skills, and industries used for job scoring.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="current-title">
              Current Job Title
            </label>
            <input
              className={inputClassName}
              defaultValue={professionalInfo.currentTitle}
              id="current-title"
              name="currentTitle"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="experience-level">
              Experience Level
            </label>
            <select
              className={selectClassName}
              defaultValue={professionalInfo.experienceLevel}
              id="experience-level"
              name="experienceLevel"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="years-experience">
              Years of Experience
            </label>
            <input
              className={inputClassName}
              defaultValue={professionalInfo.yearsExperience}
              id="years-experience"
              min="0"
              name="yearsExperience"
              type="number"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="skills">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface px-3 py-3 shadow-sm">
              {professionalInfo.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium leading-4 text-success-foreground"
                >
                  {skill}
                </span>
              ))}
              <input
                className="min-w-[160px] flex-1 bg-surface text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
                id="skills"
                name="skills"
                placeholder="Add a skill"
                type="text"
              />
              <button
                type="button"
                className="inline-flex min-h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary transition-[background-color,border-color,color] hover:border-accent hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
                Add
              </button>
            </div>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="industries">
              Industries
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface px-3 py-3 shadow-sm">
              {professionalInfo.industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full bg-info-lightest px-3 py-1 text-[12px] font-medium leading-4 text-info-foreground"
                >
                  {industry}
                </span>
              ))}
              <input
                className="min-w-[160px] flex-1 bg-surface text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
                id="industries"
                name="industries"
                placeholder="Add an industry"
                type="text"
              />
              <button
                type="button"
                className="inline-flex min-h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-[12px] font-medium leading-4 text-text-primary transition-[background-color,border-color,color] hover:border-accent hover:bg-surface-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              Work Experience
            </h2>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              Add up to three recent roles for matching context.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
          >
            <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
            Add role
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {workExperience.map((role, index) => (
            <div
              key={role.id}
              className="rounded-xl border border-border bg-surface-secondary p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                  Role {index + 1}
                </h3>
                <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium leading-4 text-text-secondary">
                  {role.current ? "Current" : "Previous"}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-company`}>
                    Company Name
                  </label>
                  <input
                    className={inputClassName}
                    defaultValue={role.companyName}
                    id={`${role.id}-company`}
                    name={`${role.id}Company`}
                    type="text"
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-title`}>
                    Job Title
                  </label>
                  <input
                    className={inputClassName}
                    defaultValue={role.jobTitle}
                    id={`${role.id}-title`}
                    name={`${role.id}Title`}
                    type="text"
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-start`}>
                    Start Date
                  </label>
                  <input
                    className={inputClassName}
                    defaultValue={role.startDate}
                    id={`${role.id}-start`}
                    name={`${role.id}StartDate`}
                    type="month"
                  />
                </div>

                <div className={fieldGroupClassName}>
                  <label className={labelClassName} htmlFor={`${role.id}-end`}>
                    End Date
                  </label>
                  <input
                    className={inputClassName}
                    defaultValue={role.endDate}
                    id={`${role.id}-end`}
                    name={`${role.id}EndDate`}
                    placeholder="Present"
                    type="month"
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 text-[14px] font-medium leading-5 text-text-primary">
                <input
                  className="size-4 rounded border-border text-accent focus:ring-accent"
                  defaultChecked={role.current}
                  name={`${role.id}Current`}
                  type="checkbox"
                />
                Currently working here
              </label>

              <div className={`${fieldGroupClassName} mt-4`}>
                <label
                  className={labelClassName}
                  htmlFor={`${role.id}-responsibilities`}
                >
                  Key Responsibilities
                </label>
                <textarea
                  className={textareaClassName}
                  defaultValue={role.responsibilities}
                  id={`${role.id}-responsibilities`}
                  name={`${role.id}Responsibilities`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success-lightest text-success-foreground">
            <GraduationCap aria-hidden="true" className="size-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
              Education
            </h2>
            <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
              Highest relevant education for resume generation.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="highest-degree">
              Highest Degree
            </label>
            <select
              className={selectClassName}
              defaultValue={education.highestDegree}
              id="highest-degree"
              name="highestDegree"
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
            <label className={labelClassName} htmlFor="field-of-study">
              Field of Study
            </label>
            <input
              className={inputClassName}
              defaultValue={education.fieldOfStudy}
              id="field-of-study"
              name="fieldOfStudy"
              placeholder="Computer Science"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="institution-name">
              Institution Name
            </label>
            <input
              className={inputClassName}
              defaultValue={education.institutionName}
              id="institution-name"
              name="institutionName"
              placeholder="University or program"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="graduation-year">
              Graduation Year
            </label>
            <input
              className={inputClassName}
              defaultValue={education.graduationYear}
              id="graduation-year"
              name="graduationYear"
              placeholder="2020"
              type="text"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          Job Preferences
        </h2>
        <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
          Search preferences used when discovering and ranking roles.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="job-titles-seeking">
              Job Titles Seeking
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface px-3 py-3 shadow-sm">
              {jobPreferences.jobTitlesSeeking.map((title) => (
                <span
                  key={title}
                  className="rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium leading-4 text-accent"
                >
                  {title}
                </span>
              ))}
              <input
                className="min-w-[160px] flex-1 bg-surface text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
                id="job-titles-seeking"
                name="jobTitlesSeeking"
                placeholder="Add title"
                type="text"
              />
            </div>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="remote-preference">
              Remote Preference
            </label>
            <select
              className={selectClassName}
              defaultValue={jobPreferences.remotePreference}
              id="remote-preference"
              name="remotePreference"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="salary-expectation">
              Salary Expectation
            </label>
            <input
              className={inputClassName}
              defaultValue={jobPreferences.salaryExpectation}
              id="salary-expectation"
              name="salaryExpectation"
              type="text"
            />
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="preferred-locations">
              Preferred Locations
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface px-3 py-3 shadow-sm">
              {jobPreferences.preferredLocations.map((location) => (
                <span
                  key={location}
                  className="rounded-full bg-surface-secondary px-3 py-1 text-[12px] font-medium leading-4 text-text-secondary"
                >
                  {location}
                </span>
              ))}
              <input
                className="min-w-[160px] flex-1 bg-surface text-[14px] font-medium leading-5 text-text-primary outline-none placeholder:text-text-muted"
                id="preferred-locations"
                name="preferredLocations"
                placeholder="Add location"
                type="text"
              />
            </div>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="cover-letter-tone">
              Cover Letter Tone
            </label>
            <select
              className={selectClassName}
              defaultValue={jobPreferences.coverLetterTone}
              id="cover-letter-tone"
              name="coverLetterTone"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
            Ready to save?
          </h2>
          <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
            Keep your profile current before starting a new job search.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
        >
          <Save aria-hidden="true" className="size-4" strokeWidth={2} />
          Save Profile
        </button>
      </section>
    </form>
  );
}
