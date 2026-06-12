"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserSession } from "@/lib/auth-session";
import { saveE2EProfileValues } from "@/lib/e2e-profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import { captureProfileCompletedEvent } from "@/lib/posthog-server";
import {
  calculateCompletion,
  parseProfileFormData,
  parseProfileRecord,
  toProfileDatabasePayload,
} from "@/lib/profile";

export type SaveProfileState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export async function saveProfile(
  _prevState: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  try {
    const session = await getCurrentUserSession();
    const user = session.user;

    if (session.error || !user) {
      return {
        success: false,
        error: "Please sign in again before saving your profile.",
        message: null,
      };
    }

    if (session.isE2E) {
      const values = parseProfileFormData(formData);
      const email = values.email || user.email || "";
      const profile = saveE2EProfileValues(session, { ...values, email });
      const completion = calculateCompletion(
        { ...values, email },
        Boolean(profile.resume_pdf_key),
      );

      revalidatePath("/profile");

      return {
        success: true,
        error: null,
        message: completion.isComplete
          ? "Profile saved and ready for matching."
          : "Profile saved. Complete the missing profile items when you are ready.",
      };
    }

    const insforge = await createInsforgeServer();
    const { data: existingData, error: existingError } =
      await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error("[actions/profile] load existing profile", existingError);
      return {
        success: false,
        error: "Could not load your current profile. Please try again.",
        message: null,
      };
    }

    const existingProfile = parseProfileRecord(existingData);
    const values = parseProfileFormData(formData);
    const email = values.email || user.email || "";
    const hasResume = Boolean(existingProfile?.resume_pdf_key);
    const payload = toProfileDatabasePayload(
      user.id,
      { ...values, email },
      hasResume,
    );

    const { error: saveError } = await insforge.database
      .from("profiles")
      .upsert(payload)
      .select()
      .single();

    if (saveError) {
      console.error("[actions/profile] save profile", saveError);
      return {
        success: false,
        error: "Could not save your profile. Please try again.",
        message: null,
      };
    }

    if (!existingProfile?.is_complete && payload.is_complete) {
      await captureProfileCompletedEvent({ userId: user.id });
    }

    revalidatePath("/profile");

    const completion = calculateCompletion({ ...values, email }, hasResume);

    return {
      success: true,
      error: null,
      message: completion.isComplete
        ? "Profile saved and ready for matching."
        : "Profile saved. Complete the missing profile items when you are ready.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Please review the required profile fields and try again.",
        message: null,
      };
    }

    console.error("[actions/profile]", error);
    return {
      success: false,
      error: "Could not save your profile. Please try again.",
      message: null,
    };
  }
}
