export default function PageHeader({ title, subtitle, action }){
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>
  
        {action && <div>{action}</div>}
      </div>
    );
  }
  