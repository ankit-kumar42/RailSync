import { useState } from "react";
import {
  CircleHelp,
  ChevronDown,
  Search,
  MessageCircleQuestion,
} from "lucide-react";

const faqs = [
  {
    question: "What is RailSync?",
    answer:
      "RailSync is an intelligent railway maintenance and block planning application. It helps users manage maintenance tasks, evaluate maintenance priorities, generate schedules, and monitor scheduled and unscheduled maintenance activities.",
  },
  {
    question: "What are Maintenance Tasks?",
    answer:
      "Maintenance Tasks are individual railway maintenance activities stored in the system. Each task can contain information such as task ID, asset, corridor, defect type, severity, overdue days, location, estimated duration, and maintenance system.",
  },
  {
    question: "How do I create a maintenance task?",
    answer:
      "Open the Maintenance Tasks section and use the Create Task option. Enter the required task information and submit the form. The task is then sent to the backend and stored in the database.",
  },
  {
    question: "What is Schedule Confirmation?",
    answer:
      "Schedule Confirmation is used to review the generated maintenance schedule before it is permanently confirmed. It allows users to review which tasks are scheduled and which tasks remain unscheduled.",
  },
  {
    question: "What happens when I confirm a schedule?",
    answer:
      "When a schedule is confirmed, the scheduled and unscheduled task information is sent to the backend. The backend saves the information in the corresponding scheduled and unscheduled maintenance database tables.",
  },
  {
    question: "Where can I see confirmed tasks?",
    answer:
      "After confirmation, the confirmed scheduled and unscheduled tasks can be viewed from the confirmed schedule section of the application.",
  },
  {
    question: "What is the difference between scheduled and unscheduled tasks?",
    answer:
      "Scheduled tasks have been assigned a maintenance window, including information such as date, start time, end time, and block window. Unscheduled tasks are maintenance tasks that could not be assigned to a suitable schedule and include a reason explaining why they remain unscheduled.",
  },
  {
    question: "What task statuses are supported?",
    answer:
      "Scheduled and unscheduled maintenance tasks can use statuses such as PENDING, IN_PROGRESS, DONE, and NOT_DONE.",
  },
  {
    question: "Can I change the status of a maintenance task?",
    answer:
      "Yes. The application can update the status of scheduled and unscheduled maintenance tasks through the backend status endpoints.",
  },
  {
    question: "What is Asset Risk Prediction?",
    answer:
      "Asset Risk Prediction is designed to help identify railway assets that may require attention by evaluating their maintenance and failure-risk information.",
  },
  {
    question: "What is Maintenance Priority?",
    answer:
      "Maintenance Priority helps users understand which maintenance tasks should receive higher priority based on factors such as severity, overdue duration, failure risk, and other available task information.",
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div
      className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        transition-all duration-300
        hover:border-blue-200
        hover:shadow-md
      "
    >
      <button
        type="button"
        onClick={onClick}
        className="
          flex w-full items-center justify-between
          gap-4 px-5 py-5
          text-left
          transition-colors
          hover:bg-slate-50
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl bg-blue-50 text-blue-600
            "
          >
            <CircleHelp size={20} />
          </div>

          <span className="text-sm font-semibold text-slate-800 md:text-base">
            {faq.question}
          </span>
        </div>

        <ChevronDown
          size={20}
          className={`
            shrink-0 text-slate-400
            transition-transform duration-300
            ${isOpen ? "rotate-180 text-blue-600" : ""}
          `}
        />
      </button>

      <div
        className={`
          grid transition-all duration-300
          ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 pb-5 pt-4 pl-[76px]">
            <p className="text-sm leading-7 text-slate-500">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const filteredFAQs = faqs.filter((faq) => {
    const text = `${faq.question} ${faq.answer}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-2xl bg-blue-600
                text-white shadow-lg shadow-blue-600/20
              "
            >
              <MessageCircleQuestion size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Frequently Asked Questions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Learn how to use RailSync and manage railway maintenance.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={20}
              className="
                pointer-events-none absolute
                left-4 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="
                w-full rounded-2xl
                border border-slate-200
                bg-white
                py-4 pl-12 pr-4
                text-sm text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))
          ) : (
            <div
              className="
                rounded-2xl
                border border-dashed border-slate-300
                bg-white
                px-6 py-16
                text-center
              "
            >
              <CircleHelp size={42} className="mx-auto mb-4 text-slate-300" />

              <h3 className="text-lg font-semibold text-slate-700">
                No FAQs found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Try searching with a different keyword.
              </p>
            </div>
          )}
        </div>

        {/* Bottom help card */}
        <div
          className="
            mt-10 overflow-hidden rounded-3xl
            bg-gradient-to-r from-blue-600 to-indigo-700
            p-7 text-white shadow-xl
          "
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Need more help?</h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Check the relevant RailSync section or verify that the FastAPI
                backend is running correctly.
              </p>
            </div>

            <div
              className="
                flex h-12 w-12 shrink-0
                items-center justify-center
                rounded-2xl bg-white/10
              "
            >
              <CircleHelp size={25} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
