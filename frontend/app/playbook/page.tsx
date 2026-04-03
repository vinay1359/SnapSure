import Link from "next/link";

const checklist = [
  "Confirm backend health endpoint before opening traffic.",
  "Verify model weight files exist in configured WEIGHTS_DIR.",
  "Check MODEL_NAME aligns with deployment target.",
  "Run sample inference and validate confidence output shape.",
  "Observe logs for malformed uploads and unsupported types.",
  "Escalate borderline cases to human moderation workflow.",
];

const scenarios = [
  {
    title: "On-call false positive spike",
    action: "Switch to fallback model profile, log sample batch, and compare confidence distribution before rollback.",
  },
  {
    title: "Backend unreachable from frontend",
    action: "Validate BACKEND_URL in runtime env and test direct /health from the frontend environment network.",
  },
  {
    title: "Weights missing after deployment",
    action: "Mount or copy checkpoints to WEIGHTS_DIR, then restart backend process to rebuild detector state.",
  },
  {
    title: "High latency during peak traffic",
    action: "Introduce queueing strategy, cap input size, and parallelize backend instances behind a load balancer.",
  },
];

export default function PlaybookPage() {
  return (
    <div className="grid gap-14 pb-10">
      <section>
        <p className="hero-kicker">Operations Playbook</p>
        <h2 className="headline mt-3 max-w-5xl text-5xl leading-[1.06] sm:text-7xl">Run this like an engineering platform, not a one-off tool.</h2>
        <p className="copy-muted mt-6 max-w-3xl text-base leading-relaxed sm:text-lg">Quick guidance for startup checks and incident response.</p>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="flow-panel rounded-[1.8rem] p-5 lg:translate-y-6">
          <p className="hero-kicker">Startup Checklist</p>
          <ul className="copy-muted mt-4 grid gap-2 text-sm sm:text-base">
            {checklist.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>

        <article>
          <p className="hero-kicker">Incident Scenarios</p>
          <div className="mt-4 grid gap-3">
            {scenarios.slice(0, 3).map((scenario) => (
              <div key={scenario.title} className="flow-panel rounded-[1.4rem] px-4 py-3">
                <h3 className="headline text-2xl">{scenario.title}</h3>
                <p className="copy-muted mt-2 text-sm sm:text-base">{scenario.action}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <article>
          <h3 className="headline text-3xl">Deployment focus</h3>
          <p className="copy-muted mt-4 max-w-3xl text-sm leading-relaxed sm:text-base">
            Keep env configuration explicit, pin runtime settings, and monitor latency plus confidence drift in production.
          </p>
        </article>

        <aside className="flow-panel rounded-[1.8rem] p-5 lg:-translate-y-6">
          <p className="hero-kicker">Continue</p>
          <p className="copy-muted mt-3 text-sm leading-relaxed">Use Architecture for system-level design context, then validate behavior in the analyzer.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/architecture" className="line-pill rounded-full px-4 py-2 text-sm font-semibold">
              Architecture
            </Link>
            <Link href="/" className="cta-primary rounded-full px-4 py-2 text-sm font-semibold">
              Home
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
