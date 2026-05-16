import { useState, type ComponentType, type FC, type PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  Zap,
  Shield,
  PenTool,
  Menu,
  X,
} from "lucide-react";

type Feature = {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<any>;
};

const features: Feature[] = [
  {
    id: "natural-flow",
    title: "Natural sentence variation",
    description: "Keeps your writing moving with cleaner rhythm and less repetitive structure.",
    Icon: Sparkles,
  },
  {
    id: "meaning-intact",
    title: "Keeps original meaning intact",
    description: "Refines the delivery while preserving the ideas, facts, and intent already on the page.",
    Icon: Shield,
  },
  {
    id: "fast-processing",
    title: "Fast processing",
    description: "Improves text quickly so you can move from rough draft to final copy without friction.",
    Icon: Zap,
  },
];

const problems: string[] = [
  "Too rigid",
  "Repetitive in structure",
  "Overly formal or generic",
  "Easy to detect as machine-generated",
];

const improvements: string[] = [
  "Flow and readability",
  "Sentence variation",
  "Tone consistency",
  "Clarity and structure",
];

const howItWorks = [
  {
    step: "1",
    title: "Paste your text",
    description: "Drop in AI-generated content, drafts, or notes.",
  },
  {
    step: "2",
    title: "Improve structure",
    description: "Supa Write adjusts rhythm, wording, and clarity.",
  },
  {
    step: "3",
    title: "Copy final output",
    description: "Clean, readable text ready to publish or send.",
  },
];

const useCases: string[] = [
  "Blog posts",
  "Academic assignments",
  "Business emails",
  "Marketing copy",
  "Social media content",
  "Reports and documentation",
];

const valuePoints: string[] = [
  "Most tools rewrite everything.",
  "Supa Write only improves how it reads.",
  "No idea loss. No content distortion. No unnecessary rewriting.",
];

type Tier = {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  badge?: string;
};

const tiers: Tier[] = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    subtitle: "Forever",
    features: ["Core generation", "Basic templates", "Community support"],
  },
  {
    id: "plus",
    name: "PLUS",
    price: "$9",
    subtitle: "Popular",
    badge: "Popular",
    features: ["Everything in Free", "Priority queue", "More styles"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "$22",
    subtitle: "Stand out",
    features: ["Advanced controls", "Team sharing", "Commercial license"],
  },
];

export const SiteShell: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] relative overflow-hidden">
      {/* Dot grid background */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#2F2F2F" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <header className="relative z-10 border-b border-gray-100 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <PenTool className="h-6 w-6 text-[#33C3FF]" />
                <span className="font-semibold">Supa Write</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/about" className="hover:underline">
                About
              </Link>
              <Link to="/pricing" className="hover:underline">
                Pricing
              </Link>
              <Link to="/app" className="px-3 py-2 rounded bg-[#2F2F2F] text-white">
                Try Supa Write
              </Link>
            </nav>

            <div className="md:hidden">
              <button
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded bg-white border"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t ${
            open ? "max-h-64" : "max-h-0"
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <Link to="/about" onClick={() => setOpen(false)} className="block">
              About
            </Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block">
              Pricing
            </Link>
            <Link to="/app" onClick={() => setOpen(false)} className="block px-3 py-2 rounded bg-[#2F2F2F] text-white">
              Try Supa Write
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">{children}</div>
      </main>
    </div>
  );
};

export const LandingPage: FC = () => {
  return (
    <SiteShell>
      <section className="text-center py-12 max-w-4xl mx-auto">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 text-sm text-[#2F2F2F] bg-white">
          Supa Write copy editor
        </p>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          <span className="hero-highlight text-[#33C3FF]">Supa Write</span>
          <br />
          Make rough drafts sound natural.
        </h1>
        <p className="mt-5 max-w-3xl mx-auto text-lg md:text-xl text-[#2F2F2F] leading-relaxed">
          Turn rough notes, AI drafts, and plain text into clean, on-brand copy without losing the message.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/app" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#33C3FF] text-white hover:opacity-90">
            Try Supa Write
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border bg-white">
          <h2 className="text-2xl font-bold">Why writers use it</h2>
          <p className="mt-3 text-[#2F2F2F]">AI writing often feels:</p>
          <ul className="mt-4 space-y-3">
            {problems.map((problem) => (
              <li key={problem} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#33C3FF] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#2F2F2F]">{problem}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-lg font-medium">You don’t need new ideas.</p>
          <p className="text-lg font-medium">You need better expression.</p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <h2 className="text-2xl font-bold">What Supa Write fixes</h2>
          <p className="mt-3 text-[#2F2F2F]">
            Supa Write refines your writing, not replaces it.
          </p>
          <p className="mt-4 text-[#2F2F2F]">It takes existing text and improves:</p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {improvements.map((improvement) => (
              <li key={improvement} className="flex items-start gap-3 p-4 rounded border bg-[#FBFDFF]">
                <Check className="h-5 w-5 text-[#33C3FF] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#2F2F2F]">{improvement}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[#2F2F2F]">Your message stays the same. The delivery improves.</p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((item) => (
            <div key={item.step} className="p-6 rounded-lg border bg-white hover:shadow-md transition">
              <div className="text-sm font-semibold text-[#33C3FF]">{item.step}</div>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[#2F2F2F]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.id} className="p-6 rounded-lg border bg-white hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <feature.Icon className="h-8 w-8 text-[#33C3FF]" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
            </div>
            <p className="mt-3 text-sm text-[#2F2F2F]">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Key Features</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Natural sentence variation",
            "Removes mechanical phrasing",
            "Keeps original meaning intact",
            "Fast processing",
            "Works with any type of text",
            "Simple copy-paste workflow",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3 p-4 rounded border bg-white">
              <Check className="h-5 w-5 text-[#33C3FF] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[#2F2F2F]">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Use Cases</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {useCases.map((useCase) => (
            <div key={useCase} className="p-4 rounded border bg-white">
              <span className="text-sm font-medium text-[#2F2F2F]">{useCase}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 p-6 md:p-8 rounded-lg border bg-white">
        <h2 className="text-2xl font-bold">Why Supa Write</h2>
        <div className="mt-4 space-y-2 text-[#2F2F2F]">
          {valuePoints.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </section>

      <section className="mt-16 text-center p-8 rounded-lg border bg-[#F8FCFF]">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to rewrite?</h2>
        <p className="mt-3 text-lg text-[#2F2F2F]">Stop sanding down every sentence by hand.</p>
        <p className="text-lg text-[#2F2F2F]">Make your copy sound natural in seconds.</p>
        <div className="mt-6">
          <Link to="/app" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#33C3FF] text-white hover:opacity-90">
            Try Supa Write
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
};

export const AboutPage: FC = () => {
  return (
    <SiteShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">About Supa Write</h2>
          <p className="mt-4 text-[#2F2F2F] max-w-2xl">
            Supa Write helps writers turn rough or AI-generated text into natural, publish-ready copy.
            The focus is simple: preserve meaning, improve clarity, and make the final result sound human.
          </p>
        </div>
        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-[#33C3FF] mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Our Mission</h3>
              <p className="mt-2 text-sm text-[#2F2F2F]">
                We believe good writing should sound clear, confident, and unmistakably human.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
};

export const PricingPage: FC = () => {
  return (
    <SiteShell>
      <section>
        <h2 className="text-3xl font-bold">Pricing</h2>
        <p className="text-[#2F2F2F] mt-2">Simple plans that scale with your writing workflow.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.id} className={`p-6 rounded-lg border bg-white flex flex-col ${t.badge ? 'ring-2 ring-[#33C3FF]' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  <p className="text-sm text-[#2F2F2F]">{t.subtitle}</p>
                </div>
                {t.badge && <span className="px-2 py-1 text-xs bg-[#33C3FF] text-white rounded-full">{t.badge}</span>}
              </div>

              <div className="mt-4">
                <div className="text-3xl font-bold">{t.price}</div>
                <ul className="mt-4 space-y-2">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#2F2F2F]">
                      <Check className="h-4 w-4 text-[#33C3FF]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Link to="/app" className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded bg-[#2F2F2F] text-white hover:bg-[#1f1f1f]">
                  Try Supa Write
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
};
