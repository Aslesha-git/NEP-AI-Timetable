import { useState } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { StudentProgram, ProgramType } from '@/types/timetable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PROGRAMS: ProgramType[] = ['B.Ed', 'M.Ed', 'FYUP', 'ITEP'];

export default function ProgramsPage() {
  const { programs, setPrograms } = useTimetableContext();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentProgram | null>(null);
  const [form, setForm] = useState({ name: 'B.Ed' as ProgramType, semester: '1', students: '60', subjects: '' });

  const resetForm = () => { setForm({ name: 'B.Ed', semester: '1', students: '60', subjects: '' }); setEditing(null); };

  const handleSave = () => {
    const subjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
    if (editing) {
      setPrograms(prev => prev.map(p => p.id === editing.id ? { ...p, name: form.name, semester: +form.semester, studentCount: +form.students, requiredSubjects: subjects } : p));
      toast.success('Program updated');
    } else {
      const newP: StudentProgram = { id: `P${String(programs.length + 1).padStart(3, '0')}`, name: form.name, semester: +form.semester, studentCount: +form.students, requiredSubjects: subjects };
      setPrograms(prev => [...prev, newP]);
      toast.success('Program added');
    }
    setOpen(false); resetForm();
  };

  const handleEdit = (p: StudentProgram) => {
    setEditing(p);
    setForm({ name: p.name, semester: String(p.semester), students: String(p.studentCount), subjects: p.requiredSubjects.join(', ') });
    setOpen(true);
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title font-display">Student Programs</h1>
          <p className="page-description">NEP 2020 multidisciplinary programs</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Program</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Program</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Program</Label>
                <Select value={form.name} onValueChange={v => setForm(p => ({ ...p, name: v as ProgramType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROGRAMS.map(pr => <SelectItem key={pr} value={pr}>{pr}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Semester</Label><Input type="number" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} /></div>
              <div><Label>Number of Students</Label><Input type="number" value={form.students} onChange={e => setForm(p => ({ ...p, students: e.target.value }))} /></div>
              <div><Label>Required Subjects (comma-separated)</Label><Input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Program</TableHead><TableHead>Semester</TableHead>
                <TableHead>Students</TableHead><TableHead>Required Subjects</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.semester}</TableCell>
                  <TableCell>{p.studentCount}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{p.requiredSubjects.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setPrograms(prev => prev.filter(x => x.id !== p.id)); toast.success('Deleted'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
