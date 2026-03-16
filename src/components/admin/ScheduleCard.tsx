import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Appointment } from '@/lib/types';

interface ScheduleCardProps {
  title: string;
  appointments: Appointment[];
}

export function ScheduleCard({ title, appointments }: ScheduleCardProps) {
  return (
    <motion.div
      className="lg:col-span-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.48 }}
    >
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-blue-500" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-slate-50 p-3 mb-3">
                <CalendarDays className="h-6 w-6 text-slate-400/70" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No appointments
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Your schedule is clear today
              </p>
            </div>
          ) : (
            appointments.map((appt) => {
              const done = appt.status === 'Completed';
              return (
                <div
                  key={appt.id}
                  className={`flex items-start gap-2.5 rounded-lg p-2 transition-colors ${
                    done ? 'opacity-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`mt-0.5 text-[10px] font-bold tabular-nums ${
                      done ? 'text-slate-400' : 'text-blue-600'
                    }`}
                  >
                    {appt.time}
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/patients/${appt.patientId}`}
                      className={`text-xs font-medium leading-tight ${
                        done
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 hover:text-blue-600'
                      }`}
                    >
                      {appt.patientName}
                    </Link>
                    <p className="text-[10px] text-slate-400 truncate">
                      {appt.doctor} · {appt.type}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold flex-shrink-0 ${
                      done
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

