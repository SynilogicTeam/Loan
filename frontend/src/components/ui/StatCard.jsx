export default function StatCard({ title, value, sub }){
    return (
      <div className="bg-white border rounded-xl p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <h2 className="text-2xl font-bold text-slate-800 mt-2">
          {value}
        </h2>
        {sub && (
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        )}
      </div>
    );
  }
  