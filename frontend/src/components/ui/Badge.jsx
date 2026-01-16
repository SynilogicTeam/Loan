export default function Badge({ text, type = "default" }){
    const styles = {
      active: "bg-emerald-100 text-emerald-700",
      pending: "bg-yellow-100 text-yellow-700",
      danger: "bg-red-100 text-red-700",
      default: "bg-slate-100 text-slate-700",
    };
  
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}
      >
        {text}
      </span>
    );
  }
  