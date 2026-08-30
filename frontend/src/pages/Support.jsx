import { useState } from "react";

import {
  Headphones,
  Server,
  ClipboardList,
  CalendarCheck,
  AlertTriangle,
  CircleHelp,
  Send,
  CheckCircle2,
  Activity,
  Mail,
  MessageSquare,
} from "lucide-react";

const supportTopics = [
  {
    title: "Backend / API Connection",
    description: "Problems connecting OptimTrack to the FastAPI backend.",
    icon: Server,
  },
  {
    title: "Maintenance Tasks",
    description: "Help with creating, viewing, or deleting maintenance tasks.",
    icon: ClipboardList,
  },
  {
    title: "Schedule Confirmation",
    description: "Help with confirming and viewing scheduled maintenance.",
    icon: CalendarCheck,
  },
  {
    title: "System Error",
    description: "Report unexpected errors or application problems.",
    icon: AlertTriangle,
  },
];

export default function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Backend / API Connection",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      topic: "Backend / API Connection",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div
              className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl
                bg-blue-600
                text-white
                shadow-lg
                shadow-blue-600/20
              "
            >
              <Headphones size={28} />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Support Center
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Get help with OptimTrack and railway maintenance operations.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            SYSTEM STATUS
        ====================================================== */}

        <div
          className="
            mb-8
            flex flex-col gap-4
            rounded-3xl
            border border-emerald-100
            bg-white
            p-6
            shadow-sm
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <Activity size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">System Status</h2>

              <p className="text-sm text-slate-500">
                OptimTrack services are ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="
                h-2.5
                w-2.5
                animate-pulse
                rounded-full
                bg-emerald-500
              "
            />

            <span className="text-sm font-semibold text-emerald-600">
              System Online
            </span>
          </div>
        </div>

        {/* =====================================================
            SUPPORT TOPICS
        ====================================================== */}

        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              How can we help?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a topic to find help with a specific part of OptimTrack.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <button
                  key={topic.title}
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      topic: topic.title,
                    }))
                  }
                  className="
                    group
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    p-5
                    text-left
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-blue-200
                    hover:shadow-lg
                  "
                >
                  <div
                    className="
                      mb-4
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                      transition
                      group-hover:bg-blue-600
                      group-hover:text-white
                    "
                  >
                    <Icon size={22} />
                  </div>

                  <h3
                    className="
                      font-semibold
                      text-slate-800
                    "
                  >
                    {topic.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    {topic.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            MAIN SUPPORT AREA
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===================================================
              CONTACT OPTIONS
          ==================================================== */}

          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Support Options
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you would like to get assistance.
              </p>
            </div>

            {/* FAQ */}

            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:shadow-md
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-purple-50
                    text-purple-600
                  "
                >
                  <CircleHelp size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">FAQs</h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Find answers to common OptimTrack questions.
                  </p>

                  <a
                    href="/faqs"
                    className="
                      mt-3
                      inline-block
                      text-sm
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    "
                  >
                    View FAQs →
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}

            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:shadow-md
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Mail size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Email Support
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Contact the OptimTrack support team.
                  </p>

                  <a
                    href="mailto:support@optimtrack.com"
                    className="
                      mt-3
                      inline-block
                      text-sm
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    "
                  >
                    support@optimtrack.com
                  </a>
                </div>
              </div>
            </div>

            {/* Status */}

            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Backend Health
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Check whether the FastAPI backend is available.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-emerald-600">
                    ● Backend Ready
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              CONTACT FORM
          ==================================================== */}

          <div className="lg:col-span-2">
            <div
              className="
                rounded-3xl
                border border-slate-200
                bg-white
                p-6
                shadow-sm
                md:p-8
              "
            >
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <MessageSquare size={21} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Contact Support
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Describe your problem and our support team can investigate it.
                </p>
              </div>

              {submitted && (
                <div
                  className="
                    mb-6
                    flex items-center gap-3
                    rounded-2xl
                    border border-emerald-200
                    bg-emerald-50
                    px-4 py-4
                    text-sm
                    text-emerald-700
                  "
                >
                  <CheckCircle2 size={20} />

                  <span>
                    Your support request has been submitted successfully.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Your Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      px-4 py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      px-4 py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Topic */}

                <div>
                  <label
                    htmlFor="topic"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Support Topic
                  </label>

                  <select
                    id="topic"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      px-4 py-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  >
                    {supportTopics.map((topic) => (
                      <option key={topic.title} value={topic.title}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}

                <div>
                  <label
                    htmlFor="message"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Describe the Problem
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe what happened..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      px-4 py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-6 py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-blue-700
                    hover:shadow-xl
                    active:translate-y-0
                  "
                >
                  <Send size={18} />
                  Submit Support Request
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400">
            OptimTrack • Intelligent Block Planning
          </p>
        </div>
      </div>
    </div>
  );
}
