import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { hasInsforgePublicConfig } from "@/lib/insforge-client";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function LoginPage() {
  if (hasInsforgePublicConfig()) {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();

    if (user) {
      redirect("/profile");
    }
  }

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
              Connect with Google or GitHub to start building your profile,
              matching jobs, and researching companies.
            </p>
          </div>

          <p className="mt-12 text-[16px] font-semibold leading-6 text-text-secondary">
            New users are routed to profile setup after sign-in.
          </p>
        </div>

        <div className="flex items-center px-8 py-12 md:px-12 lg:px-14">
          <div className="w-full max-w-[520px]">
            <p className="text-[18px] font-semibold leading-7 text-text-secondary">
              Welcome to
            </p>
            <h2 className="mt-2 text-[34px] font-bold leading-10 text-text-slate">
              JobPilot
            </h2>
            <p className="mt-6 text-[17px] font-normal leading-7 text-text-secondary">
              Choose your preferred provider to continue.
            </p>

            <div className="mt-10">
              <OAuthButtons />
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] border-x border-t border-border">
        <Footer />
      </div>
    </main>
  );
}
