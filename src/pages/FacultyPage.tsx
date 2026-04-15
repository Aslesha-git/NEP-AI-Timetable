import { useState } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { Faculty } from '@/types/timetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FacultyPage() {
  const { faculty, setFaculty } = useTimetableContext();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState({ name: '', department: '', subjects: '', maxHours: '18' });

  const resetForm = () => { setForm({ name: '', department: '', subjects: '', maxHours: '18' }); setEditing(null); };

  const handleSave = () => {
    if (!form.name || !form.department) { toast.error('Name and department required'); return; }
    const subjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
    if (editing) {
      setFaculty(prev => prev.map(f => f.id === editing.id ? { ...f, name: form.name, department: form.department, subjects, maxHoursPerWeek: +form.maxHours } : f));
      toast.success('Faculty updated');
    } else {
      const newF: Faculty = { id: `F${String(faculty.length + 1).padStart(3, '0')}`, name: form.name, department: form.department, subjects, maxHoursPerWeek: +form.maxHours, availableSlots: [], preferredSlots: [] };
      setFaculty(prev => [...prev, newF]);
      toast.success('Faculty added');
    }
    setOpen(false); resetForm();
  };

  const handleEdit = (f: Faculty) => {
    setEditing(f);
    setForm({ name: f.name, department: f.department, subjects: f.subjects.join(', '), maxHours: String(f.maxHoursPerWeek) });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setFaculty(prev => prev.filter(f => f.id !== id));
    toast.success('Faculty removed');
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title font-display">Faculty Management</h1>
          <p className="page-description">Manage faculty data, subjects, and workload limits</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Faculty</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Faculty</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. John Doe" /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Education" /></div>
              <div><Label>Subjects (comma-separated)</Label><Input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))} placeholder="Pedagogy, Psychology" /></div>
              <div><Label>Max Hours/Week</Label><Input type="number" value={form.maxHours} onChange={e => setForm(p => ({ ...p, maxHours: e.target.value }))} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Faculty</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Max Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.id}</TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.department}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{f.subjects.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></TableCell>
                  <TableCell>{f.maxHoursPerWeek}h</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
