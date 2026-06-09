"use client";

import { GitBranch, Globe2 } from "lucide-react";
import { useState } from "react";

import {
  getInsforgePublicConfigError,
  getInsforgeBrowserClient,
} from "@/lib/insforge-client";

type OAuthProvider = "google" | "github";

type OAuthRedirectData = {
  codeVerifier?: string;
  url?: string;
};

const providers: Array<{
  Icon: typeof Globe2;
  label: string;
  provider: OAuthProvider;
}> = [
  { Icon: Globe2, label: "Continue with Google", provider: "google" },
  { Icon: GitBranch, label: "Continue with GitHub", provider: "github" },
];

export function OAuthButtons() {
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (provider: OAuthProvider): Promise<void> => {
    setPendingProvider(provider);
    setErrorMessage(null);

    const configError = getInsforgePublicConfigError();
    if (configError) {
      setErrorMessage(configError);
      setPendingProvider(null);
      return;
    }

    const redirectTo = `${window.location.origin}/callback`;
    let data: OAuthRedirectData | null = null;
    let error: unknown = null;

    try {
      const insforge = getInsforgeBrowserClient();
      const result = await insforge.auth.signInWithOAuth(provider, {
        redirectTo,
        additionalParams:
          provider === "google" ? { prompt: "select_account" } : undefined,
        skipBrowserRedirect: true,
      });

      data = result.data;
      error = result.error;
    } catch (caughtError) {
      error = caughtError;
    }

    if (error) {
      console.error("[auth/oauth]", error);
      setErrorMessage("Could not start sign in. Please try again.");
      setPendingProvider(null);
      return;
    }

    if (!data?.url || !data.codeVerifier) {
      setErrorMessage("Could not start sign in. Please try again.");
      setPendingProvider(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/oauth/start", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codeVerifier: data.codeVerifier,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error("OAuth start route failed.");
      }
    } catch (caughtError) {
      console.error("[auth/oauth]", caughtError);
      setErrorMessage("Could not start sign in. Please try again.");
      setPendingProvider(null);
      return;
    }

    window.location.assign(data.url);
  };

  return (
    <div className="flex flex-col gap-3">
      {providers.map((item) => (
        <button
          key={item.provider}
          type="button"
          onClick={() => void handleSignIn(item.provider)}
          disabled={pendingProvider !== null}
          className="grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-md border border-border bg-surface px-5 text-[15px] font-semibold leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-60 active:translate-y-0 active:duration-75"
        >
          <span />
          <span className="flex items-center gap-4">
            <item.Icon
              aria-hidden="true"
              className={
                item.provider === "google"
                  ? "size-5 text-accent"
                  : "size-5 text-text-primary"
              }
              strokeWidth={2.2}
            />
            {pendingProvider === item.provider ? "Redirecting..." : item.label}
          </span>
          <span />
        </button>
      ))}

      {errorMessage ? (
        <p className="text-center text-[12px] font-normal leading-4 text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
