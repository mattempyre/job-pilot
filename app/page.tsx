import { BottomCta } from "@/components/homepage/BottomCta";
import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Navbar />
      <div className="mx-auto max-w-[1280px] border-x border-border">
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonial />
        <div className="h-20 border-b border-border landing-stripes" />
        <BottomCta />
        <div className="h-20 border-b border-border landing-stripes" />
        <Footer />
      </div>
    </main>
  );
}
