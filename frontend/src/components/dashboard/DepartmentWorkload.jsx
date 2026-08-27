import SectionCard from "../common/SectionCard";

export default function DepartmentWorkload({ departments = [] }) {
  return (
    <SectionCard
      title="Department Workload"
      subtitle="Active maintenance load by department"
    >
      {departments.length === 0 ? (
        <p className="text-sm text-slate-500">
          No department workload data available.
        </p>
      ) : (
        <div className="space-y-6">
          {departments.map((department) => (
            <div key={department.name}>
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {department.name}
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {department.tasks}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(department.percentage || 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
