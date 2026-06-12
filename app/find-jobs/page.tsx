import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FindJobsExperience } from "@/components/find-jobs/FindJobsExperience";

export default function FindJobsPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] border-x border-border px-4 pb-32 pt-6 md:px-8 md:py-8">
        <FindJobsExperience />
      </div>
      <MobileBottomNav />
    </main>
  );
}
