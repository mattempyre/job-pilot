import { Navbar } from "@/components/layout/Navbar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] border-x border-border px-8 py-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[16px] font-semibold leading-6 text-text-primary">
                Profile
              </h1>
              <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
                Your profile setup form will appear here.
              </p>
            </div>

            <LogoutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
