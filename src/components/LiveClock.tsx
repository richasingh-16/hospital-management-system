import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update the time every minute
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="hidden md:flex items-center gap-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full">
      <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-green-600 font-semibold tracking-wide">LIVE</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <span>
          {dateStr} — {timeStr}
        </span>
      </div>
    </div>
  );
}
