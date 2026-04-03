import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Hospital, Building2, Bell, Palette,
  Plus, Trash2, UserPlus, KeyRound, Eye, EyeOff, Users,
} from 'lucide-react';

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { apiFetch } from '@/services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Department { id: string; name: string; doctors: number; head: string; }
interface StaffUser   { id: string; employeeId: string; name: string; role: string; department: string | null; createdAt: string; }

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', DOCTOR: 'Doctor', RECEPTIONIST: 'Receptionist', LAB_TECHNICIAN: 'Lab Technician',
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700', DOCTOR: 'bg-blue-100 text-blue-700',
  RECEPTIONIST: 'bg-purple-100 text-purple-700', LAB_TECHNICIAN: 'bg-yellow-100 text-yellow-700',
};

const NOTIF_PREFS_KEY = 'mediflow_notif_prefs';
const DEFAULT_NOTIF_PREFS = {
  newPatient:       true,
  labReady:         true,
  appointmentBooked:true,
  invoiceGenerated: true,
  doctorAdded:      false,
  invoicePaid:      false,
};

function loadNotifPrefs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || 'null') ?? DEFAULT_NOTIF_PREFS; }
  catch { return DEFAULT_NOTIF_PREFS; }
}

// ---------------------------------------------------------------------------
// Settings Component
// ---------------------------------------------------------------------------
export default function Settings() {
  const { hospitalInfo: savedInfo, setHospitalInfo: persistInfo } = useHospital();
  const [hospitalInfo, setHospitalInfo] = useState(savedInfo);

  // Departments
  const [departments, setDepartments]     = useState<Department[]>([]);
  const [deptLoading, setDeptLoading]     = useState(false);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [newDeptName, setNewDeptName]     = useState('');
  const [deptSaving, setDeptSaving]       = useState(false);

  // Users
  const [users, setUsers]               = useState<StaffUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ employeeId: '', name: '', password: '', role: 'RECEPTIONIST' });
  const [userSaving, setUserSaving]     = useState(false);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs());

  // Account / Change Password
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]           = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving]       = useState(false);

  // ── Load departments & users ─────────────────────────────────────────────
  useEffect(() => {
    setDeptLoading(true);
    apiFetch('/departments').then(setDepartments).catch(() => {}).finally(() => setDeptLoading(false));

    setUsersLoading(true);
    apiFetch('/users').then(setUsers).catch(() => {}).finally(() => setUsersLoading(false));
  }, []);

  // ── Hospital Info save ────────────────────────────────────────────────────
  const handleSaveHospital = () => {
    persistInfo(hospitalInfo);
    toast.success('Hospital settings saved');
  };

  // ── Add Department ────────────────────────────────────────────────────────
  const handleAddDept = async () => {
    if (!newDeptName.trim()) { toast.error('Enter a department name'); return; }
    setDeptSaving(true);
    try {
      const dept = await apiFetch('/departments', { method: 'POST', body: JSON.stringify({ name: newDeptName.trim() }) });
      setDepartments(prev => [...prev, dept]);
      setNewDeptName('');
      setShowDeptDialog(false);
      toast.success(`Department "${dept.name}" added`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add department');
    } finally {
      setDeptSaving(false);
    }
  };

  // ── Add User ─────────────────────────────────────────────────────────────
  const handleAddUser = async () => {
    if (!newUser.employeeId || !newUser.name || !newUser.password) {
      toast.error('All fields are required'); return;
    }
    setUserSaving(true);
    try {
      const user = await apiFetch('/users', { method: 'POST', body: JSON.stringify(newUser) });
      setUsers(prev => [{ ...user, department: null, createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
      setNewUser({ employeeId: '', name: '', password: '', role: 'RECEPTIONIST' });
      setShowUserDialog(false);
      toast.success(`${user.name} (${newUser.employeeId}) account created`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setUserSaving(false);
    }
  };

  // ── Delete User ───────────────────────────────────────────────────────────
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s account? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(`${name}'s account removed`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove user');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) { toast.error('Fill in all password fields'); return; }
    if (pwForm.next !== pwForm.confirm)  { toast.error('New passwords do not match');   return; }
    if (pwForm.next.length < 6)          { toast.error('New password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await apiFetch('/users/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setPwForm({ current: '', next: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Save notification preferences to localStorage ───────────────────────
  const handleSaveNotifs = () => {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(notifPrefs));
    toast.success('Notification preferences saved');
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex cursor-pointer items-center" onClick={onChange}>
      <div className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );

  const PwField = ({
    label, field, value, onChange,
  }: { label: string; field: 'current' | 'next' | 'confirm'; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      <div className="relative">
        <Input
          type={showPw[field] ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">Manage hospital configuration, staff accounts, and system preferences</p>
      </div>

      <Tabs defaultValue="hospital">
        <TabsList className="mb-5 flex-wrap h-auto gap-1">
          <TabsTrigger value="hospital"      className="gap-1.5"><Hospital className="h-3.5 w-3.5" /> Hospital</TabsTrigger>
          <TabsTrigger value="departments"   className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Departments</TabsTrigger>
          <TabsTrigger value="users"         className="gap-1.5"><Users className="h-3.5 w-3.5" /> User Management</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="account"       className="gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Account</TabsTrigger>
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
                    { label: 'Hospital Name',  key: 'name'        },
                    { label: 'License Number', key: 'license'     },
                    { label: 'Phone',          key: 'phone'       },
                    { label: 'Email',          key: 'email'       },
                    { label: 'Bed Capacity',   key: 'bedCapacity' },
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
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveHospital}>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Departments {!deptLoading && `(${departments.length})`}
                </CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDeptDialog(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Department
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {deptLoading ? (
                <p className="py-10 text-center text-sm text-slate-400">Loading departments…</p>
              ) : departments.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No departments yet. Add one to get started.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Head</th>
                      <th className="px-5 py-3 text-center">Doctors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id} className="border-b hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">{dept.name}</td>
                        <td className="px-5 py-3 text-slate-600">{dept.head}</td>
                        <td className="px-5 py-3 text-center text-slate-600">{dept.doctors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
              <div className="py-2">
                <Input
                  placeholder="Department name e.g. Physiotherapy"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddDept()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeptDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddDept} disabled={deptSaving}>
                  {deptSaving ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── User Management ── */}
        <TabsContent value="users">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                  <Users className="h-4 w-4 text-blue-500" />
                  Staff Accounts {!usersLoading && `(${users.length})`}
                </CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUserDialog(true)}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Create Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <p className="py-10 text-center text-sm text-slate-400">Loading users…</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Employee ID</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Created</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{u.employeeId}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ROLE_LABELS[u.role] ?? u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{u.department ?? '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{u.createdAt}</td>
                        <td className="px-5 py-3 text-right">
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              disabled={deletingId === u.id}
                              onClick={() => handleDeleteUser(u.id, u.name)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {deletingId === u.id ? 'Removing…' : 'Remove'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Create user dialog */}
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create Staff Account</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Employee ID</label>
                    <Input placeholder="e.g. REC001" value={newUser.employeeId} onChange={e => setNewUser({ ...newUser, employeeId: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</label>
                    <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="DOCTOR">Doctor</SelectItem>
                        <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                        <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full Name</label>
                  <Input placeholder="e.g. Priya Sharma" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Password</label>
                  <Input type="password" placeholder="Initial password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  ⚠ Share the Employee ID and password securely with the staff member. They can change their password from Settings → Account.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser} disabled={userSaving}>
                  {userSaving ? 'Creating…' : 'Create Account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Bell className="h-4 w-4 text-blue-500" /> In-App Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <div className="pb-3 text-xs text-slate-400">
                These preferences control which actions appear as notifications in the bell icon in the top bar.
              </div>
              {[
                { key: 'newPatient',        label: 'New patient registered',         desc: 'Show a notification when a new patient record is created' },
                { key: 'labReady',          label: 'Lab report ready',               desc: 'Alert when a lab test result file is uploaded' },
                { key: 'appointmentBooked', label: 'Appointment booked',             desc: 'Notify when a new appointment is scheduled' },
                { key: 'invoiceGenerated',  label: 'Invoice generated',              desc: 'Alert when a new invoice is created' },
                { key: 'invoicePaid',       label: 'Invoice marked as paid',         desc: 'Notify when an outstanding invoice is settled' },
                { key: 'doctorAdded',       label: 'New doctor / staff added',       desc: 'Alert when a doctor or staff account is created' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ToggleSwitch
                    checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                    onChange={() => setNotifPrefs((p: typeof notifPrefs) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                  />
                </div>
              ))}
              <div className="pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveNotifs}>
                  <Save className="mr-2 h-4 w-4" /> Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Account (Change Password) ── */}
        <TabsContent value="account">
          <Card className="shadow-sm max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <KeyRound className="h-4 w-4 text-blue-500" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PwField label="Current Password" field="current" value={pwForm.current} onChange={v => setPwForm(p => ({ ...p, current: v }))} />
              <Separator />
              <PwField label="New Password"      field="next"    value={pwForm.next}    onChange={v => setPwForm(p => ({ ...p, next: v }))} />
              <PwField label="Confirm New Password" field="confirm" value={pwForm.confirm} onChange={v => setPwForm(p => ({ ...p, confirm: v }))} />
              {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              <div className="pt-1">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword} disabled={pwSaving}>
                  <Save className="mr-2 h-4 w-4" /> {pwSaving ? 'Saving…' : 'Change Password'}
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
                  <Select defaultValue="DD/MM/YYYY">
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
                <p className="mt-1 text-xs text-red-500">These actions are irreversible. Admin access only.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                    onClick={() => toast.error('This action is disabled in the current environment')}>
                    Clear Activity Logs
                  </Button>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.success('System settings saved')}>
                <Save className="mr-2 h-4 w-4" /> Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
