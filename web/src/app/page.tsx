import Link from "next/link";
import { RESOURCE_TYPES } from "@/lib/resources";

const STEPS = [
  {
    title: "Plan your series",
    body: "Enter each week's text, title, and big idea — or paste the planning doc you already have and we'll pull out the details.",
  },
  {
    title: "Choose your resources",
    body: "Pick what your church needs: group guides, devotionals, kids lessons, slides, emails, social posts, and more.",
  },
  {
    title: "Review and share",
    body: "Everything is drafted in your church's voice. Edit, copy, or download, then hand it to your teams.",
  },
];

const PLANS = [
  {
    name: "Church Plant",
    price: "$29",
    blurb: "For one pastor getting started.",
    features: ["1 active series", "All week-by-week resources", "Download as Markdown"],
  },
  {
    name: "Church",
    price: "$79",
    blurb: "For staff teams sharing the load.",
    features: ["Unlimited series", "Series-wide resources", "Up to 5 staff seats", "Custom church voice"],
    featured: true,
  },
  {
    name: "Network",
    price: "Let's talk",
    blurb: "For multi-site churches and networks.",
    features: ["Multiple campuses", "Shared series across churches", "Priority support"],
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-clay">
          For pastors and church staff
        </p>
        <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
          One sermon series. A whole church&apos;s worth of resources.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
          Disciple turns your preaching plan into small group guides, daily devotionals, kids lessons,
          family discussion cards, and communications — so the message keeps working all week long.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/series/new" className="btn-primary px-6 py-3 text-base">
            Start a series
          </Link>
          <Link href="#how-it-works" className="btn-secondary px-6 py-3 text-base">
            See how it works
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-semibold">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-clay/10 font-serif text-lg font-semibold text-clay">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-stone-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-serif text-3xl font-semibold">What you get</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-stone-600">
          Every resource is grounded in your text, your thesis, and your application.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_TYPES.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{r.name}</h3>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  {r.scope === "week" ? "Every week" : "Whole series"}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-olive">{r.audience}</p>
              <p className="mt-2 text-sm text-stone-600">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-semibold">Simple pricing</h2>
          <p className="mt-3 text-center text-stone-600">Per month. Cancel anytime.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card flex flex-col p-6 ${plan.featured ? "border-clay ring-2 ring-clay/30" : ""}`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{plan.blurb}</p>
                <p className="mt-6 font-serif text-4xl font-semibold">{plan.price}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-olive">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/series/new"
                  className={`mt-8 ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
