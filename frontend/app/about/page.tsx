import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="grid gap-14 pb-10">
      <section>
        <p className="hero-kicker">About SnapSure</p>
        <h2 className="headline mt-3 max-w-5xl text-5xl leading-[1.06] sm:text-7xl">Built for teams that need trust signals fast.</h2>
        <p className="copy-muted mt-6 max-w-3xl text-base leading-relaxed sm:text-lg">
          SnapSure is focused on clear authenticity output, reliable behavior, and straightforward integration.
        </p>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="flow-panel rounded-[1.8rem] p-5 lg:translate-y-6">
          <h3 className="headline text-3xl">Principles</h3>
          <ul className="copy-muted mt-4 grid gap-3 text-sm sm:text-base">
            <li>Evidence-first outputs over noise.</li>
            <li>Integration paths that stay simple.</li>
            <li>Transparent limits and human-in-the-loop decisions.</li>
          </ul>
        </article>

        <article>
          <h3 className="headline text-3xl">Reliability mindset</h3>
          <p className="copy-muted mt-4 max-w-3xl text-sm leading-relaxed sm:text-base">
            Deterministic model loading, explicit environment settings, and stable API contracts keep operations predictable.
          </p>
        </article>
      </section>

      <section className="flow-panel rounded-[1.8rem] p-5">
        <p className="hero-kicker">Next</p>
        <p className="copy-muted mt-3 text-sm leading-relaxed">Run a sample in Analyzer, then review Architecture for deployment strategy.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/" className="cta-primary rounded-full px-4 py-2 text-sm font-semibold">
            Analyzer
          </Link>
          <Link href="/architecture" className="line-pill rounded-full px-4 py-2 text-sm font-semibold">
            Architecture
          </Link>
        </div>
      </section>
    </div>
  );
}
