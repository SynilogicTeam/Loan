import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  export default function FundChart({ data = [] }) {
    // Show chart if we have data, even if all amounts are 0
    const hasData = data && data.length > 0;
  
    if (!hasData) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400">
          No fund data available
        </div>
      );
    }
  
    return (
      <div>
        <h3 className="text-sm font-semibold mb-3 text-slate-600">
          Fund Trend
        </h3>
  
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  