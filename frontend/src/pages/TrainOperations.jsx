import { Train, Calendar, TrendingUp } from "lucide-react";

export default function TrainOperations() {
  const trains = [
    {
      train: "Rajdhani Express",
      number: "12301",
      section: "SEC-0002",
      time: "00:30",
      type: "Passenger",
    },
    {
      train: "Goods Special",
      number: "G-7821",
      section: "SEC-0002",
      time: "01:15",
      type: "Goods",
    },
    {
      train: "Superfast Express",
      number: "12951",
      section: "SEC-0015",
      time: "03:45",
      type: "Passenger",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Train Operations</h1>

        <p className="mt-2 text-slate-500">
          Train timetable and goods train forecast used for block optimization.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card icon={<Train />} title="Scheduled Trains" value="186" />

        <Card icon={<Calendar />} title="Today's Services" value="248" />

        <Card icon={<TrendingUp />} title="Goods Forecast" value="+12%" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Train Movement Schedule
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-slate-400">
                <th className="pb-4">Train</th>
                <th className="pb-4">Number</th>
                <th className="pb-4">Section</th>
                <th className="pb-4">Time</th>
                <th className="pb-4">Type</th>
              </tr>
            </thead>

            <tbody>
              {trains.map((item) => (
                <tr key={item.number} className="border-b border-slate-100">
                  <td className="py-5 font-semibold text-slate-800">
                    {item.train}
                  </td>

                  <td className="py-5 text-slate-600">{item.number}</td>

                  <td className="py-5 text-slate-600">{item.section}</td>

                  <td className="py-5 text-slate-600">{item.time}</td>

                  <td className="py-5">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {item.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-blue-600">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
