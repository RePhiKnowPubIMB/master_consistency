import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';

const ConsistencyGraph = ({ data }) => {
  // Transform data for the chart
  const chartData = data.map(log => ({
    date: new Date(log.date).getTime(), // Use timestamp for X-axis scaling
    score: log.consistencyScore || 0,
    dateStr: new Date(log.date).toLocaleDateString()
  })).sort((a, b) => a.date - b.date);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded shadow-xl z-50">
          <p className="text-slate-300 text-xs mb-1">{new Date(label).toDateString()}</p>
          <p className="text-yellow-400 font-bold text-lg">Score: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative">
        {/* Background Bands mimicking Codeforces Rating Graph style but for 0-100 score */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="h-[25%] bg-purple-600 w-full absolute top-0"></div> {/* 75-100 */}
            <div className="h-[25%] bg-blue-600 w-full absolute top-[25%]"></div> {/* 50-75 */}
            <div className="h-[25%] bg-emerald-600 w-full absolute top-[50%]"></div> {/* 25-50 */}
            <div className="h-[25%] bg-slate-600 w-full absolute top-[75%]"></div> {/* 0-25 */}
        </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            domain={['dataMin', 'dataMax']}
            name="Time"
            tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM d')}
            type="number"
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            minTickGap={40}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#facc15" // Yellow-400
            strokeWidth={3}
            dot={{ fill: '#facc15', stroke: '#1e293b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#facc15', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsistencyGraph;
