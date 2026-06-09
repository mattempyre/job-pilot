"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getInsforgePublicConfigError } from "@/lib/insforge-client";

async function completeOAuthCallback(code: string): Promise<void> {
  const response = await fetch("/api/auth/oauth/callback", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error("Could not complete OAuth callback.");
  }
}

export default function CallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function completeSignIn(): Promise<void> {
      const configError = getInsforgePublicConfigError();
      if (configError) {
        setErrorMessage(configError);
        return;
      }

      const code = new URLSearchParams(window.location.search).get(
        "insforge_code",
      );

      if (!code) {
        setErrorMessage("Sign in could not be completed. Please try again.");
        return;
      }

      let callbackError: unknown = null;

      try {
        await completeOAuthCallback(code);
      } catch (caughtError) {
        callbackError = caughtError;
      }

      if (!isActive) {
        return;
      }

      if (callbackError) {
        console.error("[auth/callback]", callbackError);
        setErrorMessage("Sign in could not be completed. Please try again.");
        return;
      }

      router.replace("/profile");
    }

    void completeSignIn();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <section className="mx-auto my-8 grid min-h-[680px] max-w-[1280px] overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:my-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="landing-gradient flex flex-col justify-between border-b border-border px-8 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14 xl:px-16">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface/70 px-4 py-2 text-[14px] font-medium leading-5 text-text-secondary shadow-sm">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-accent"
                strokeWidth={2}
              />
              OAuth secured by InsForge
            </div>

            <h1 className="mt-14 max-w-[680px] text-[56px] font-bold leading-[1.02] tracking-normal text-text-slate md:text-[72px] lg:text-[76px]">
              Sign in and let the agent prep your next application.
            </h1>
            <p className="mt-8 max-w-[610px] text-[22px] font-normal leading-9 text-text-slate-medium">
              We are verifying your provider session and preparing your
              workspace.
            </p>
          </div>

          <p className="mt-12 text-[16px] font-semibold leading-6 text-text-secondary">
            New users are routed to profile setup after sign-in.
          </p>
        </div>

        <div className="flex items-center justify-center px-8 py-12 md:px-12 lg:px-14">
          <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
            <p className="text-[16px] font-semibold leading-6 text-text-primary">
              Completing sign in
            </p>
            <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
              We are checking your session and redirecting you.
            </p>

            {errorMessage ? (
              <div className="mt-6">
                <p className="text-[12px] font-normal leading-4 text-error">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="mt-4 rounded-md bg-accent px-4 py-2 text-[14px] font-medium leading-5 text-accent-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:duration-75"
                >
                  Back to sign in
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] border-x border-t border-border">
        <Footer />
      </div>
    </main>
  );
}
