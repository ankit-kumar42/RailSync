import SectionCard from "../common/SectionCard";

export default function CriticalSections({ sections = [] }) {
  return (
    <SectionCard
      title="Critical Sections"
      subtitle="Based on defects, block requests and operational impact"
    >
      {sections.length === 0 ? (
        <p className="text-sm text-slate-500">
          No critical sections available.
        </p>
      ) : (
        <div className="space-y-5">
          {sections.map((section, index) => (
            <div key={section.id || index}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-bold text-slate-800">{section.id}</p>

                    <p className="text-xs text-slate-500">
                      {section.defects} defects • {section.blocks} block
                      requests
                    </p>
                  </div>
                </div>

                <RiskBadge risk={section.risk} />
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all"
                  style={{
                    width: `${Math.min(section.score || 0, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-1 flex justify-end">
                <span className="text-xs font-semibold text-slate-500">
                  Risk Score: {section.score}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function RiskBadge({ risk = "MEDIUM" }) {
  const styles = {
    CRITICAL: "border-red-100 bg-red-50 text-red-600",
    HIGH: "border-orange-100 bg-orange-50 text-orange-600",
    MEDIUM: "border-amber-100 bg-amber-50 text-amber-600",
    LOW: "border-emerald-100 bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        styles[risk] || styles.MEDIUM
      }`}
    >
      {risk}
    </span>
  );
}
