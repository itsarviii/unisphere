import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Users, Calendar, PenLine, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    Icon: Sparkles,
    label: "AI-personalised feed",
    desc: "Posts and events are ranked by your interests using semantic embeddings, not just by date.",
  },
  {
    Icon: Users,
    label: "Societies",
    desc: "Create or follow university societies, post updates, and keep members in the loop.",
  },
  {
    Icon: Calendar,
    label: "Events",
    desc: "Societies can host events. Members can RSVP and see what's coming up.",
  },
  {
    Icon: PenLine,
    label: "AI writing assist",
    desc: "A small AI button in the post and event forms that drafts a description for you.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute -top-64 -left-64 h-150 w-150 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-100 w-100 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-20">
          <span className="text-lg font-bold">
            Uni<span className="text-indigo-400">Sphere</span>
          </span>
          <Link to="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400">
              🎓 Final year project · Anglia Ruskin University
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Your campus,{" "}
              <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                connected.
              </span>
            </h1>

            <p className="mb-10 text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              A platform for university student societies — follow communities,
              discover events, and get a feed that actually reflects your interests.
            </p>

            <Link
              to="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold hover:bg-indigo-500 transition active:scale-95"
            >
              Create an account
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {FEATURES.map(({ Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
