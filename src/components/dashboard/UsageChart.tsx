import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { day: 'Mon', requests: 2100 },
  { day: 'Tue', requests: 2400 },
  { day: 'Wed', requests: 1800 },
  { day: 'Thu', requests: 2800 },
  { day: 'Fri', requests: 3200 },
  { day: 'Sat', requests: 2600 },
  { day: 'Sun', requests: 2847 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="font-display font-semibold text-foreground text-sm">{label}</p>
        <p className="font-mono text-primary text-lg">
          {payload[0].value.toLocaleString()} requests
        </p>
      </div>
    );
  }
  return null;
};

const UsageChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-5 lg:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Requests Over Time
          </h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">API Requests</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(263 70% 66%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(263 70% 66%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(222 30% 15%)" 
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="hsl(263 70% 66%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default UsageChart;
