export default function TableWrapper({ children }){
    return (
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    );
  }
  