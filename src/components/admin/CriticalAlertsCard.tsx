import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Alert } from '@/lib/types';

interface CriticalAlertsCardProps {
  alerts: Alert[];
}

export function CriticalAlertsCard({ alerts }: CriticalAlertsCardProps) {
  return (
    <motion.div
      className="lg:col-span-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.4 }}
    >
      <Card className="shadow-sm border-red-100 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4" /> Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-slate-50 p-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-slate-400/70" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No critical alerts
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hospital operations normal
              </p>
            </div>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-2"
              >
                <span
                  className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                    alert.level === 'high' ? 'bg-red-500' : 'bg-yellow-400'
                  }`}
                />
                <p className="text-xs leading-snug text-slate-700">
                  {alert.text}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

