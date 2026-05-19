import { useState, type ComponentType, type FC, type PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Play,
  Star,
  ZapOff,
  MoveRight,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/services/useAuth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    subtitle: "Ideal for occasional writers",
    features: [
      "300 words/month humanization",
      "30 AI checks/month",
      "Rate limit: 1 request per minute",
      "Queue delay"
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    subtitle: "Core monetization tier",
    badge: "Most Popular",
    features: [
      "25,000 words/month humanization",
      "1,000 AI checks/month",
      "Faster processing",
      "Input allowed 1,000 words per request"
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$22",
    subtitle: "Power users",
    features: [
      "100,000 words/month",
      "5,000 AI checks/month",
      "Priority queue",
      "Unlimited custom brand tones"
    ],
  },
];

const problems = [
  "Too rigid and mechanical",
  "Repetitive in structure",
  "Overly formal or generic",
  "Easy to detect as machine-generated",
];

const improvements = [
  "Flow and readability",
  "Sentence variation",
  "Tone consistency",
  "Clarity and structure",
];

const howItWorks = [
  {
    step: "01",
    title: "Paste your text",
    description: "Drop in AI-generated content, drafts, or notes into our minimal editor.",
  },
  {
    step: "02",
    title: "Improve structure",
    description: "Supa Write automatically adjusts rhythm, wording, and human-like clarity.",
  },
  {
    step: "03",
    title: "Export final output",
    description: "Get clean, readable text ready to publish or send to your team.",
  },
];

export const SiteShell: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#484848] relative overflow-x-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[800px] bg-gradient-to-b from-[#e8f9ff]/50 via-transparent to-transparent rounded-[100%] blur-3xl opacity-50" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6">
        <nav className="max-w-6xl mx-auto px-6 py-3 rounded-2xl glass border-border-strong flex items-center justify-between shadow-2xl shadow-black/[0.01]">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-[#484848] p-1.5 rounded-xl group-hover:scale-110 transition-all shadow-xl shadow-black/10">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                 </svg>
              </div>
              <span className="font-black text-2xl tracking-tighter text-[#484848]">Aiham Fuck</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/app" className="text-xs font-black uppercase tracking-widest text-[#64748B] hover:text-[#484848] transition-colors">Editor</Link>
            <Link to="/dashboard" className="text-xs font-black uppercase tracking-widest text-[#64748B] hover:text-[#484848] transition-colors">Dashboard</Link>
            <Link to="/pricing" className="text-xs font-black uppercase tracking-widest text-[#64748B] hover:text-[#484848] transition-colors">Pricing</Link>
            <Link to="/app" className="premium-btn-primary !py-2.5 !px-6 !text-xs !rounded-xl !shadow-none">
               {token ? 'Launch App' : 'Try for Free'}
            </Link>
          </div>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-xl bg-white border border-border-strong shadow-sm"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 pt-40">
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-32">{children}</div>
      </main>
    </div>
  );
};

export const LandingPage: FC = () => {
  const navigate = useNavigate();
  return (
    <SiteShell>
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center py-20 max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1ac6ff]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#1ac6ff] bg-[#e8f9ff] mb-10 shadow-sm">
          <Sparkles className="h-3 w-3 fill-current" />
          Powered by human intelligence
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-6xl md:text-[100px] font-black leading-[0.85] tracking-[-0.06em] text-[#484848] font-creative">
          Make <span className="text-[#1ac6ff]">AI drafts</span><br />sound human.
        </motion.h1>
        
        <motion.p variants={itemVariants} className="mt-12 max-w-2xl mx-auto text-xl md:text-2xl text-[#64748B] leading-relaxed font-medium tracking-tight">
          Turn mechanical drafts and notes into high-converting, natural copy. Preserving your message while improving the delivery.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-8">
          <Link to="/app" className="premium-btn-primary !px-12 !py-5 !text-xl flex items-center gap-3 !rounded-[20px] shadow-2xl shadow-black/20">
            Start Writing
            <MoveRight className="h-6 w-6" strokeWidth={3} />
          </Link>
          <button className="flex items-center gap-4 font-black text-[#484848] hover:text-[#1ac6ff] transition-all group">
            <div className="h-14 w-14 rounded-2xl border-2 border-border-strong flex items-center justify-center group-hover:border-[#1ac6ff] group-hover:scale-110 transition-all shadow-sm">
              <Play className="h-5 w-5 fill-current" />
            </div>
            Watch Demo
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div variants={itemVariants} className="mt-32 flex flex-col items-center gap-4 text-[#94A3B8]">
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Features</span>
           <motion.div 
             animate={{ y: [0, 8, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           >
             <ChevronDown size={20} strokeWidth={3} />
           </motion.div>
        </motion.div>
      </motion.section>

      {/* Feature Section with Box Colors */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <motion.div variants={itemVariants} className="premium-card box-2 p-10 !rounded-[32px] border-none shadow-sm group hover:-translate-y-2 transition-all duration-500">
           <div className="bg-white h-14 w-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#1ac6ff]">
              <Sparkles size={28} />
           </div>
           <h3 className="text-2xl font-black mb-4 tracking-tight">Natural sentence variation</h3>
           <p className="text-[#484848]/80 font-medium leading-relaxed">Keeps your writing moving with cleaner rhythm and less repetitive structure.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="premium-card box-1 p-10 !rounded-[32px] border-none shadow-sm group hover:-translate-y-2 transition-all duration-500">
           <div className="bg-white h-14 w-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#b960e2]">
              <Shield size={28} />
           </div>
           <h3 className="text-2xl font-black mb-4 tracking-tight">Meaning intact</h3>
           <p className="text-[#484848]/80 font-medium leading-relaxed">Refines the delivery while preserving the ideas, facts, and intent already on the page.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="premium-card box-3 p-10 !rounded-[32px] border-none shadow-sm group hover:-translate-y-2 transition-all duration-500">
           <div className="bg-white h-14 w-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#f9b239]">
              <Zap size={28} />
           </div>
           <h3 className="text-2xl font-black mb-4 tracking-tight">Fast processing</h3>
           <p className="text-[#484848]/80 font-medium leading-relaxed">Improves text quickly so you can move from rough draft to final copy without friction.</p>
        </motion.div>
      </motion.section>

      {/* Steps Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-48"
      >
        <motion.div variants={itemVariants} className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#484848] font-creative">Your new workflow.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {howItWorks.map((item) => (
            <motion.div key={item.step} variants={itemVariants} className="group relative p-10 rounded-[40px] bg-white shadow-sm border border-border-strong hover:shadow-xl transition-all duration-500">
              <div className="text-6xl font-black text-[#F1F5F9] group-hover:text-[#1ac6ff]/20 transition-colors mb-8">{item.step}</div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-[#484848]">{item.title}</h3>
              <p className="text-[#64748B] font-medium text-lg leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Final */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
        className="mt-60 text-center p-20 md:p-32 rounded-[60px] bg-[#484848] text-[#f7f7f7] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1ac6ff] rounded-full blur-[160px] opacity-10 -mr-96 -mt-96" />
        <div className="relative z-10">
          <h2 className="text-5xl md:text-[90px] font-black leading-[0.9] tracking-tighter mb-12 font-creative text-[#f7f7f7]">Ready to write?</h2>
          <p className="text-[#f7f7f7]/60 text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-16 tracking-tight">
            Join thousands of writers who are making their content sound unmistakably human.
          </p>
          <button 
            onClick={() => navigate('/app')}
            className="bg-[#f7f7f7] text-[#484848] px-16 py-6 text-2xl font-black rounded-[24px] shadow-2xl hover:scale-105 transition-all"
          >
            Start Free
          </button>
        </div>
      </motion.section>
    </SiteShell>
  );
};

export const AboutPage: FC = () => {
  return (
    <SiteShell>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto py-12"
      >
        <motion.div variants={itemVariants} className="text-center mb-20">
           <h1 className="text-7xl md:text-[100px] font-black tracking-[-0.06em] mb-6 text-[#484848] font-creative leading-none">Our Mission.</h1>
           <p className="text-xl md:text-2xl text-[#64748B] font-medium tracking-tight">Why we believe writing should stay human.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="premium-card !rounded-[48px] p-16 space-y-16 bg-white shadow-sm border border-border-strong">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="md:col-span-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-[#484848]">The Mission</h2>
             </div>
             <div className="md:col-span-2">
                <p className="text-[#484848] text-xl leading-relaxed font-medium">
                  We believe that while AI can generate ideas at scale, it often lacks the soul and nuance of human expression. Supa Write was created to bridge that gap and preserve the art of communication.
                </p>
             </div>
          </div>
          
          <div className="h-px bg-border-strong w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="md:col-span-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-red-400">The Problem</h2>
             </div>
             <div className="md:col-span-2">
                <p className="text-[#64748B] text-xl leading-relaxed font-medium">
                  The web is becoming saturated with mechanical, robotic content. This makes it harder for genuine voices to stand out and connect with their audience. Robots writing for robots is a race to the bottom.
                </p>
             </div>
          </div>

          <div className="h-px bg-border-strong w-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="md:col-span-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-[#1ac6ff]">The Solution</h2>
             </div>
             <div className="md:col-span-2">
                <p className="text-[#484848] text-xl leading-relaxed font-medium">
                  We developed proprietary linguistic models that analyze and restructure text to match natural human speech patterns, sentence variability, and emotional resonance.
                </p>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </SiteShell>
  );
};

export const PricingPage: FC = () => {
  const navigate = useNavigate();
  return (
    <SiteShell>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="py-12"
      >
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-7xl md:text-[100px] font-black tracking-[-0.06em] mb-8 leading-[0.9] text-[#484848] font-creative">Simple.<br />Fair.</h1>
          <p className="text-xl md:text-2xl text-[#64748B] font-medium leading-relaxed tracking-tight">Choose the plan that fits your writing volume. No hidden fees, no complexity.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
          {tiers.map((t) => (
            <motion.div 
              key={t.id} 
              variants={itemVariants}
              className={`premium-card !rounded-[40px] p-12 relative flex flex-col group bg-white shadow-sm border border-border-strong ${t.badge ? 'border-[#1ac6ff] ring-[12px] ring-[#1ac6ff]/5 scale-105 z-10' : ''}`}
            >
              {t.badge && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#1ac6ff] text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-2xl">
                  {t.badge}
                </div>
              )}
              
              <div className="mb-12">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#64748B] mb-6">{t.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter text-[#484848]">{t.price}</span>
                  <span className="text-[#94A3B8] font-black text-xl">/mo</span>
                </div>
                <p className="text-[#64748B] font-medium mt-6 text-base leading-snug">{t.subtitle}</p>
              </div>

              <div className="h-px bg-border-strong w-full mb-10" />

              <ul className="space-y-6 mb-12 flex-1">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold text-[#484848]">
                    <div className="h-6 w-6 rounded-full bg-[#1ac6ff]/10 flex items-center justify-center text-[#1ac6ff] flex-shrink-0 shadow-sm">
                      <Check className="h-3.5 w-3.5" strokeWidth={4} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/app')}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                  t.badge ? 'premium-btn-accent shadow-2xl shadow-[#1ac6ff]/30 text-white' : 'bg-[#f7f7f7] border-2 border-border-strong hover:border-[#484848] hover:bg-white text-[#484848]'
                }`}
              >
                Start Writing
                <MoveRight className="h-5 w-5" strokeWidth={3} />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-32 p-16 rounded-[48px] glass border-border-strong text-center relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#1ac6ff]/5 rounded-full blur-[100px] group-hover:bg-[#1ac6ff]/10 transition-all duration-1000" />
          <p className="text-xs font-black text-[#64748B] uppercase tracking-[0.4em] mb-6">Enterprise Scaling</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 leading-tight text-[#484848]">Need a custom plan for<br />your organization?</h2>
          <button className="premium-btn-primary !px-12 !py-5 !text-lg !rounded-2xl">Contact Sales Team</button>
        </motion.div>
      </motion.section>
    </SiteShell>
  );
};
