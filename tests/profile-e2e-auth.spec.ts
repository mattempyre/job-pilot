import { expect, test, type BrowserContext } from "playwright/test";

type ProfileScenario = "blank" | "ready" | "resume" | "populated";

async function addE2EAuthCookies(
  context: BrowserContext,
  baseURL: string,
  scenario: ProfileScenario,
): Promise<void> {
  await context.addCookies([
    {
      name: "jobpilot_e2e_auth",
      value: "1",
      url: baseURL,
    },
    {
      name: "jobpilot_e2e_profile",
      value: scenario,
      url: baseURL,
    },
  ]);
}

test("opens profile with mocked auth and no resume", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "blank");
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("heading", { exact: true, name: "Profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Extract from Resume" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Upload a PDF resume before extracting profile details."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate Resume from Profile" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Review Current Resume" }),
  ).toHaveCount(0);

  const noResumeResponse = await page.request.get("/api/resume/current");
  expect(noResumeResponse.status()).toBe(404);
});

test("extracts fixture resume data into the profile form", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "resume");
  await page.goto("/profile");

  await page.getByRole("button", { name: "Extract from Resume" }).click();
  await expect(
    page.getByText("Profile fields filled in. Review and save below."),
  ).toBeVisible();

  await expect(page.getByLabel("Full Name")).toHaveValue("Alex Rivera");
  await expect(page.getByLabel("Current Job Title")).toHaveValue(
    "Senior Frontend Engineer",
  );
  await expect(
    page
      .getByRole("form", { name: "Profile information" })
      .getByText("TypeScript"),
  ).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Remote" })).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Already Extracted" }),
  ).toBeDisabled();

  const duplicateResponse = await page.request.post("/api/resume/extract");
  const duplicatePayload: unknown = await duplicateResponse.json();

  expect(duplicateResponse.status()).toBe(409);
  expect(duplicatePayload).toMatchObject({
    success: false,
    error: "This resume has already been extracted. Upload a new PDF to extract again.",
  });
});

test("overwrites populated fields after extracting resume data", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "populated");
  await page.goto("/profile");

  await expect(page.getByLabel("Current Job Title")).toHaveValue(
    "Product Engineer",
  );

  await page.getByRole("button", { name: "Extract from Resume" }).click();
  await expect(
    page.getByText("Profile fields filled in. Review and save below."),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Replace profile sections?" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Current Job Title")).toHaveValue(
    "Senior Frontend Engineer",
  );
});

test("generates a first resume from a saved ready profile", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "ready");
  await page.goto("/profile");

  await expect(
    page.getByRole("link", { name: "Review Current Resume" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Generate Resume from Profile" }).click();
  await expect(
    page.getByText("Generated resume saved. Review it in a new tab."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Review Current Resume" }),
  ).toHaveAttribute("href", "/api/resume/current");

  const reviewResponse = await page.request.get("/api/resume/current");
  expect(reviewResponse.status()).toBe(200);
  expect(reviewResponse.headers()["content-type"]).toContain("application/pdf");
  expect(reviewResponse.headers()["content-disposition"]).toContain("inline");
});

test("asks before replacing an existing resume with a generated resume", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "populated");
  await page.goto("/profile");

  await expect(
    page.getByRole("link", { name: "Review Current Resume" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Generate Resume from Profile" }).click();
  await expect(
    page.getByRole("heading", { name: "Replace current resume?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Generate new resume" }).click();
  await expect(
    page.getByText("Generated resume saved. Review it in a new tab."),
  ).toBeVisible();
});

test("blocks resume generation while profile edits are unsaved", async ({
  baseURL,
  context,
  page,
}) => {
  if (!baseURL) {
    throw new Error("Missing Playwright baseURL.");
  }

  await addE2EAuthCookies(context, baseURL, "ready");
  await page.goto("/profile");

  await page.getByLabel("Full Name").fill("Jordan Unsaved");
  await expect(
    page.getByRole("button", { name: "Generate Resume from Profile" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Save your profile changes before generating a resume."),
  ).toBeVisible();
});
