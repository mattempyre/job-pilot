import { Navbar } from "@/components/layout/Navbar";

export default function FindJobsPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] border-x border-border px-8 py-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-[16px] font-semibold leading-6 text-text-primary">
            Find Jobs
          </h1>
          <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">
            Job search controls and matches will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}
