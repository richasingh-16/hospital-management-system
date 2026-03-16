import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecentActivityItem } from '@/lib/types';

interface RecentActivityCardProps {
  items: RecentActivityItem[];
}

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <motion.div
      className="lg:col-span-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.52 }}
    >
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <TrendingUp className="h-4 w-4 text-blue-500" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5"
            >
              <span
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.color}`}
              />
              <div>
                <p className="text-xs leading-snug text-slate-700">
                  {item.text}
                </p>
                <p className="text-[10px] text-slate-400">{item.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

