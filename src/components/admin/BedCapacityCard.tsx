import { motion } from 'framer-motion';
import { BedDouble } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WardCapacity } from '@/lib/types';

interface BedCapacityCardProps {
  wards: WardCapacity[];
}

function getCapacityColor(pct: number) {
  if (pct >= 90)
    return {
      bar: 'bg-red-500',
      badge: 'bg-red-100 text-red-700',
    };
  if (pct >= 65)
    return {
      bar: 'bg-yellow-400',
      badge: 'bg-yellow-100 text-yellow-700',
    };
  return {
    bar: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
  };
}

export function BedCapacityCard({ wards }: BedCapacityCardProps) {
  return (
    <motion.div
      className="lg:col-span-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.34 }}
    >
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <BedDouble className="h-4 w-4 text-blue-500" /> Bed Capacity Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {wards.map((ward) => {
            const pct = Math.round((ward.occupied / ward.total) * 100);
            const cols = getCapacityColor(pct);
            return (
              <div key={ward.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {ward.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">
                      {ward.occupied}/{ward.total}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cols.badge}`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${cols.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

