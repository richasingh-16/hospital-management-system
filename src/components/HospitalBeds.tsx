import { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Plus, Map } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------
interface Ward {
  id: string;
  name: string;
  type: string;
  total: number;
  occupied: number;
  color: string;
  bg: string;
  borderColor: string;
}

const initialWards: Ward[] = [
  { id: 'W-ICU', name: 'ICU', type: 'ICU', total: 20, occupied: 14, color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-red-100' },
  { id: 'W-GEN', name: 'General Ward', type: 'General', total: 80, occupied: 52, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: 'W-EMR', name: 'Emergency', type: 'Emergency', total: 15, occupied: 10, color: 'text-orange-600', bg: 'bg-orange-50', borderColor: 'border-orange-100' },
  { id: 'W-MAT', name: 'Maternity', type: 'Maternity', total: 25, occupied: 16, color: 'text-pink-600', bg: 'bg-pink-50', borderColor: 'border-pink-100' },
  { id: 'W-PED', name: 'Pediatrics', type: 'Pediatrics', total: 20, occupied: 9, color: 'text-green-600', bg: 'bg-green-50', borderColor: 'border-green-100' },
  { id: 'W-ORT', name: 'Orthopedics', type: 'Orthopedics', total: 18, occupied: 11, color: 'text-purple-600', bg: 'bg-purple-50', borderColor: 'border-purple-100' },
];

function getOccupancyBar(pct: number) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 65) return 'bg-yellow-400';
  return 'bg-green-500';
}

function getOccupancyBadge(pct: number) {
  if (pct >= 90) return 'bg-red-100 text-red-700';
  if (pct >= 65) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HospitalBeds() {
  const [wards, setWards] = useState<Ward[]>(initialWards);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedWard, setSelected] = useState<Ward | null>(null);
  const [patientName, setPatient] = useState('');

  const totalBeds = wards.reduce((a, w) => a + w.total, 0);
  const totalOccupied = wards.reduce((a, w) => a + w.occupied, 0);
  const totalFree = totalBeds - totalOccupied;

  const handleAssign = () => {
    if (!selectedWard || !patientName.trim()) return;
    setWards((p) => p.map((w) =>
      w.id === selectedWard.id && w.occupied < w.total ? { ...w, occupied: w.occupied + 1 } : w
    ));
    toast.success(`Bed assigned to ${patientName} in ${selectedWard.name}`);
    setPatient('');
    setShowAssign(false);
  };

  const handleVacate = (wardId: string, wardName: string) => {
    setWards((p) => p.map((w) =>
      w.id === wardId && w.occupied > 0 ? { ...w, occupied: w.occupied - 1 } : w
    ));
    toast.success(`Bed vacated in ${wardName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bed Management</h1>
        <p className="text-sm text-slate-500">Real-time bed availability across all wards</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Beds', value: totalBeds, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Occupied', value: totalOccupied, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Available', value: totalFree, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${s.bg} border-0 shadow-sm`}>
              <CardContent className="flex items-center gap-3 p-4">
                <BedDouble className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs: Overview / Floor Map */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-1.5">
            <BedDouble className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="floormap" className="gap-1.5">
            <Map className="h-3.5 w-3.5" /> Floor Bed Map
          </TabsTrigger>
        </TabsList>

        {/* ── Overview tab ── */}
        <TabsContent value="overview">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {wards.map((ward) => {
              const free = ward.total - ward.occupied;
              const pct = Math.round((ward.occupied / ward.total) * 100);
              return (
                <motion.div
                  key={ward.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22 }}
                >
                  <Card className={`shadow-sm hover:shadow-md transition-shadow border ${ward.borderColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center gap-2 text-sm ${ward.color}`}>
                          <BedDouble className="h-4 w-4" /> {ward.name}
                        </CardTitle>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getOccupancyBadge(pct)}`}>
                          {pct}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                          <span>{ward.occupied} occupied</span>
                          <span>{free} free</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${getOccupancyBar(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[['Total', ward.total, 'text-slate-800'], ['Occupied', ward.occupied, 'text-slate-800'], ['Free', free, 'text-green-600']].map(([lbl, val, cls]) => (
                          <div key={String(lbl)} className="rounded-lg bg-slate-50 p-1.5">
                            <p className={`text-lg font-bold ${cls}`}>{val}</p>
                            <p className="text-[10px] text-slate-400">{lbl}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 text-xs hover:bg-blue-700"
                          disabled={free === 0}
                          onClick={() => { setSelected(ward); setShowAssign(true); }}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Assign Bed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          disabled={ward.occupied === 0}
                          onClick={() => handleVacate(ward.id, ward.name)}
                        >
                          Vacate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Floor Bed Map tab ── */}
        <TabsContent value="floormap">
          <div className="space-y-5">
            {wards.map((ward) => {
              const beds = Array.from({ length: ward.total }, (_, i) => ({
                num: i + 1,
                occupied: i < ward.occupied,
              }));
              return (
                <Card key={ward.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`flex items-center gap-2 text-sm ${ward.color}`}>
                        <BedDouble className="h-4 w-4" />
                        {ward.name}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-3 w-3 rounded-sm bg-slate-700" /> Occupied
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-white" /> Available
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {beds.map((bed) => (
                        <div
                          key={bed.num}
                          title={`Bed ${bed.num} — ${bed.occupied ? 'Occupied' : 'Available'}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-md border text-[10px] font-semibold transition-colors cursor-default
                            ${bed.occupied
                              ? 'bg-slate-700 border-slate-600 text-slate-200'
                              : 'border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                        >
                          {bed.num}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Bed — {selectedWard?.name}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Patient Name *"
            value={patientName}
            onChange={(e) => setPatient(e.target.value)}
            className="my-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
