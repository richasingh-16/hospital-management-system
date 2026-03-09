import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Hospital, Building2, Bell, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useHospital } from '@/contexts/HospitalContext';


// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
const departments = [
  { id: 1, name: 'Cardiology',       head: 'Dr. Neha Singh',   beds: 20, doctors: 4 },
  { id: 2, name: 'General Medicine', head: 'Dr. Ananya Bose',  beds: 80, doctors: 6 },
  { id: 3, name: 'Orthopedics',      head: 'Dr. Rohan Mehta',  beds: 18, doctors: 3 },
  { id: 4, name: 'Neurology',        head: 'Dr. Priya Kapoor', beds: 15, doctors: 3 },
  { id: 5, name: 'Emergency',        head: 'Dr. Kiran Rao',    beds: 10, doctors: 5 },
  { id: 6, name: 'Maternity',        head: 'Dr. Ananya Bose',  beds: 25, doctors: 4 },
  { id: 7, name: 'Pediatrics',       head: 'Dr. Neha Singh',   beds: 20, doctors: 3 },
  { id: 8, name: 'ICU',              head: 'Dr. Kiran Rao',    beds: 20, doctors: 4 },
];

const roles = [
  { role: 'Admin',        permission: 'Full access to all modules', count: 2 },
  { role: 'Doctor',       permission: 'Patients, Appointments, Lab Reports', count: 8 },
  { role: 'Receptionist', permission: 'Patients, Appointments, Billing, Admissions', count: 4 },
  { role: 'Lab Staff',    permission: 'Lab Reports only', count: 3 },
];

export default function Settings() {
  // Read initial values from the global HospitalContext (backed by localStorage)
  const { hospitalInfo: savedInfo, setHospitalInfo: persistInfo } = useHospital();

  // Local state while the admin is editing — only flushed to context on Save
  const [hospitalInfo, setHospitalInfo] = useState(savedInfo);

  const handleSave = (section: string) => {
    // Persist to HospitalContext → updates localStorage + all reading components
    persistInfo(hospitalInfo);
    toast.success(`${section} settings saved`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">Manage hospital configuration, departments, and system preferences</p>
      </div>

      <Tabs defaultValue="hospital">
        <TabsList className="mb-5">
          <TabsTrigger value="hospital"      className="gap-1.5"><Hospital className="h-3.5 w-3.5" /> Hospital</TabsTrigger>
          <TabsTrigger value="departments"   className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Departments</TabsTrigger>
          <TabsTrigger value="roles"         className="gap-1.5"><Shield className="h-3.5 w-3.5" /> User Roles</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="system"        className="gap-1.5"><Palette className="h-3.5 w-3.5" /> System</TabsTrigger>
        </TabsList>

        {/* ── Hospital Info ── */}
        <TabsContent value="hospital">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                  <Hospital className="h-4 w-4 text-blue-500" /> Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Hospital Name',  key: 'name'       },
                    { label: 'License Number', key: 'license'    },
                    { label: 'Phone',          key: 'phone'      },
                    { label: 'Email',          key: 'email'      },
                    { label: 'Bed Capacity',   key: 'bedCapacity'},
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
                      <Input
                        value={hospitalInfo[key as keyof typeof hospitalInfo]}
                        onChange={(e) => setHospitalInfo({ ...hospitalInfo, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timezone</label>
                    <Select value={hospitalInfo.timezone} onValueChange={(v) => setHospitalInfo({ ...hospitalInfo, timezone: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</label>
                  <Input value={hospitalInfo.address} onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })} />
                </div>
                <div className="pt-2">
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('Hospital')}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Departments ── */}
        <TabsContent value="departments">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-blue-500" /> Departments ({departments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Head of Department</th>
                    <th className="px-5 py-3 text-center">Beds</th>
                    <th className="px-5 py-3 text-center">Doctors</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{dept.name}</td>
                      <td className="px-5 py-3 text-slate-600">{dept.head}</td>
                      <td className="px-5 py-3 text-center text-slate-600">{dept.beds}</td>
                      <td className="px-5 py-3 text-center text-slate-600">{dept.doctors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── User Roles ── */}
        <TabsContent value="roles">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Shield className="h-4 w-4 text-blue-500" /> Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {roles.map((r) => (
                <div key={r.role} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-slate-800">{r.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Access: {r.permission}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {r.count} {r.count === 1 ? 'user' : 'users'}
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Manage</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Bell className="h-4 w-4 text-blue-500" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {[
                { label: 'ICU bed capacity alerts (>85%)',       desc: 'Alert when ICU occupancy exceeds threshold'   },
                { label: 'New patient registration',              desc: 'Notify on every new patient admission'        },
                { label: 'Lab report ready',                      desc: 'Alert when lab results are available'         },
                { label: 'Invoice overdue (>7 days)',             desc: 'Flag unpaid invoices past due date'           },
                { label: 'Doctor availability change',            desc: 'Notify when doctor status changes'            },
                { label: 'Daily summary report (8 AM)',           desc: 'Send daily operational summary every morning' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={i < 4} className="peer sr-only" />
                    <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
              <div className="pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('Notification')}>
                  <Save className="mr-2 h-4 w-4" /> Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── System ── */}
        <TabsContent value="system">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Palette className="h-4 w-4 text-blue-500" /> System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Currency</label>
                  <Select defaultValue="INR">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date Format</label>
                  <Select defaultValue="YYYY-MM-DD">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">Danger Zone</p>
                <p className="mt-1 text-xs text-red-500">These actions are irreversible. Admin only.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs">Clear Activity Logs</Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs">Reset System Data</Button>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('System')}>
                <Save className="mr-2 h-4 w-4" /> Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
