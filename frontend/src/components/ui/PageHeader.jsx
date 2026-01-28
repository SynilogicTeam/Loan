export default function PageHeader({ title, subtitle, action, icon: Icon }){
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8 text-indigo-600" />}
            <h1 className="text-2xl font-semibold text-slate-800">
              {title}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>
  
        {action && <div>{action}</div>}
      </div>
    );
  }
  