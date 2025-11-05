"use client";

import { motion } from "framer-motion";

interface DataPoint {
  date: string;
  revenue: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
}

export default function SimpleBarChart({ data, height = 200 }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const barWidth = Math.max(20, Math.floor((100 / data.length) - 2));

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-around h-full gap-1 px-4">
        {data.map((point, index) => {
          const barHeight = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
          const date = new Date(point.date);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;

          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group cursor-pointer"
                style={{ minHeight: point.revenue > 0 ? "4px" : "0" }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                    ₹{point.revenue.toLocaleString()}
                    <div className="text-gray-400 text-[10px] mt-0.5">{point.date}</div>
                  </div>
                </div>
              </motion.div>
              <span className="text-gray-500 text-[10px] mt-2 truncate w-full text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
