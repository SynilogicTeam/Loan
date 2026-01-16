export default function StatCard({ title, value, icon: Icon }){
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  }
  