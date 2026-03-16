import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdmissionsRange } from '@/services/adminDashboardService';

interface AdmissionsOverviewCardProps {
  range: AdmissionsRange;
  onRangeChange: (range: AdmissionsRange) => void;
  data: { day: string; admissions: number }[];
}

export function AdmissionsOverviewCard({
  range,
  onRangeChange,
  data,
}: AdmissionsOverviewCardProps) {
  return (
    <motion.div
      className="lg:col-span-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.28 }}
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Admissions Overview
            </CardTitle>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              {(['7', '30'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onRangeChange(r)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    range === r
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r === '7' ? 'Last 7 days' : 'Last 30 days'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data}
              barSize={range === '7' ? 28 : 48}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  fontSize: 12,
                }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar
                dataKey="admissions"
                fill="#3b82f6"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

