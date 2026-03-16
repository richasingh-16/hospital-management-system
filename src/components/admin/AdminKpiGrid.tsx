import { motion } from 'framer-motion';
import {
  Users,
  CalendarDays,
  BedDouble,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardKpi } from '@/lib/types';

interface AdminKpiGridProps {
  kpis: DashboardKpi[];
}

const styleByLabel: Record<
  string,
  {
    icon: JSX.Element;
    color: string;
    bg: string;
    border: string;
  }
> = {
  'Patients Today': {
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  'Appointments Today': {
    icon: <CalendarDays className="h-5 w-5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  'Beds Available': {
    icon: <BedDouble className="h-5 w-5" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  'Doctors On Duty': {
    icon: <Stethoscope className="h-5 w-5" />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
};

export function AdminKpiGrid({ kpis }: AdminKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => {
        const style = styleByLabel[kpi.label] ?? {
          icon: <Users className="h-5 w-5" />,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-100',
        };
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <Card
              className={`shadow-sm hover:shadow-md transition-shadow border ${style.border}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-slate-400">{kpi.context}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${style.bg}`}>
                    <span className={style.color}>{style.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

