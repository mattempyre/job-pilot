import Image from "next/image";

export function Testimonial() {
  return (
    <section className="border-b border-border bg-surface px-6 py-20 text-center md:px-16 md:py-24">
      <p className="text-[14px] font-medium uppercase leading-5 tracking-[0.18em] text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[880px] text-[32px] font-semibold leading-[1.35] tracking-normal text-text-slate md:text-[40px]">
        “I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.”
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={48}
          height={48}
          loading="eager"
          className="rounded-md"
        />
        <div className="text-left">
          <p className="text-[16px] font-bold leading-6 text-text-primary">
            Tom Wilson
          </p>
          <p className="text-[15px] font-normal leading-6 text-text-secondary">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}
