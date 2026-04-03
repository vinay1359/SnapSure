import Link from "next/link";

const stack = [
  {
    layer: "Client Surface",
    detail: "Next.js App Router UI handles upload intent, result visibility, and operator workflow links.",
  },
  {
    layer: "Proxy Boundary",
    detail: "A server route in Next.js forwards multipart payloads to the backend and normalizes response handling.",
  },
  {
    layer: "Inference Service",
    detail: "Flask endpoint validates inputs, runs deepfake detection model inference, and returns deterministic JSON output.",
  },
  {
    layer: "Model Runtime",
    detail: "Xception and EfficientNet-B4 are mapped through a registry with explicit weights and runtime device control.",
  },
];

const controls = [
  "Environment-driven model selection",
  "Health endpoint for startup validation",
  "Fallback model strategy for continuity",
  "Docker and local workflow parity",
  "Simple, contract-based API responses",
];

export default function ArchitecturePage() {
  return (
    <div className="grid gap-14 pb-10">
      <section>
        <p className="hero-kicker">Architecture</p>
        <h2 className="headline mt-3 max-w-5xl text-5xl leading-[1.06] sm:text-7xl">Clear boundaries from UI to model runtime.</h2>
        <p className="copy-muted mt-6 max-w-3xl text-base leading-relaxed sm:text-lg">Interaction, transport, and inference are separated to keep scaling and debugging simple.</p>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <article>
          <p className="hero-kicker">Stack Walkthrough</p>
          <div className="mt-4 grid gap-3">
            {stack.slice(0, 3).map((item, idx) => (
              <div key={item.layer} className="flow-panel rounded-[1.4rem] px-4 py-3">
                <p className="copy-muted text-xs uppercase tracking-[0.15em]">Layer {String(idx + 1).padStart(2, "0")}</p>
                <h3 className="headline mt-1 text-2xl">{item.layer}</h3>
                <p className="copy-muted mt-2 text-sm sm:text-base">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="flow-panel rounded-[1.8rem] p-5 lg:translate-y-8">
          <p className="hero-kicker">Operational Controls</p>
          <ul className="copy-muted mt-4 grid gap-2 text-sm sm:text-base">
            {controls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="flow-panel rounded-[1.8rem] p-5 lg:-translate-y-6">
          <p className="hero-kicker">API Flow</p>
          <pre className="copy-muted mt-3 overflow-x-auto text-xs sm:text-sm">
{`POST /api/predict
  -> forwards to backend /predict
  -> validates file type
  -> runs selected model
  -> returns { result, confidence }`}
          </pre>
        </article>

        <article>
          <h3 className="headline text-3xl">Why this structure holds up in production</h3>
          <div className="copy-muted mt-4 grid gap-2 text-sm leading-relaxed sm:text-base">
            <p>Frontend and backend evolve independently without collapsing the contract between them.</p>
            <p>Rollouts are safer because model version behavior is tied to environment and weights, not rushed code edits.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/playbook" className="cta-primary rounded-full px-4 py-2 text-sm font-semibold">
              Playbook
            </Link>
            <Link href="/" className="line-pill rounded-full px-4 py-2 text-sm font-semibold">
              Analyzer
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
