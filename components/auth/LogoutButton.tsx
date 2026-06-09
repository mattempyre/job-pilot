"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getInsforgeBrowserClient } from "@/lib/insforge-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async (): Promise<void> => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const insforge = getInsforgeBrowserClient();
      const { error } = await insforge.auth.signOut();

      if (error) {
        throw error;
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Logout route failed.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("[auth/logout]", error);
      setErrorMessage("Could not sign out. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isPending}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-60 active:translate-y-0 active:duration-75"
      >
        <LogOut aria-hidden="true" className="size-4" strokeWidth={2} />
        {isPending ? "Signing out..." : "Log out"}
      </button>

      {errorMessage ? (
        <p className="text-[12px] font-normal leading-4 text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
