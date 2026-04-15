import { useState } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { Course, ProgramType } from '@/types/timetable';
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

export default function CoursesPage() {
  const { courses, setCourses, faculty } = useTimetableContext();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', program: 'B.Ed' as ProgramType, semester: '1', credits: '3', hours: '3', facultyId: '' });

  const resetForm = () => { setForm({ name: '', program: 'B.Ed', semester: '1', credits: '3', hours: '3', facultyId: '' }); setEditing(null); };

  const handleSave = () => {
    if (!form.name) { toast.error('Course name required'); return; }
    if (editing) {
      setCourses(prev => prev.map(c => c.id === editing.id ? { ...c, name: form.name, program: form.program, semester: +form.semester, credits: +form.credits, hoursPerWeek: +form.hours, assignedFacultyId: form.facultyId || undefined } : c));
      toast.success('Course updated');
    } else {
      const newC: Course = { id: `C${String(courses.length + 1).padStart(3, '0')}`, name: form.name, program: form.program, semester: +form.semester, credits: +form.credits, hoursPerWeek: +form.hours, assignedFacultyId: form.facultyId || undefined };
      setCourses(prev => [...prev, newC]);
      toast.success('Course added');
    }
    setOpen(false); resetForm();
  };

  const handleEdit = (c: Course) => {
    setEditing(c);
    setForm({ name: c.name, program: c.program, semester: String(c.semester), credits: String(c.credits), hours: String(c.hoursPerWeek), facultyId: c.assignedFacultyId || '' });
    setOpen(true);
  };

  const programColor = (p: ProgramType) => {
    const map: Record<ProgramType, string> = { 'B.Ed': 'bg-primary/10 text-primary', 'M.Ed': 'bg-secondary/10 text-secondary', 'FYUP': 'bg-accent/10 text-accent-foreground', 'ITEP': 'bg-info/10 text-info' };
    return map[p];
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title font-display">Course Management</h1>
          <p className="page-description">Manage courses across NEP 2020 programs</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Course</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Course Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Program</Label>
                <Select value={form.program} onValueChange={v => setForm(p => ({ ...p, program: v as ProgramType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROGRAMS.map(pr => <SelectItem key={pr} value={pr}>{pr}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Semester</Label><Input type="number" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} /></div>
                <div><Label>Credits</Label><Input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))} /></div>
                <div><Label>Hours/Week</Label><Input type="number" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} /></div>
              </div>
              <div><Label>Assigned Faculty</Label>
                <Select value={form.facultyId} onValueChange={v => setForm(p => ({ ...p, facultyId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                  <SelectContent>{faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Program</TableHead>
                <TableHead>Sem</TableHead><TableHead>Credits</TableHead><TableHead>Hrs/Wk</TableHead>
                <TableHead>Faculty</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge className={programColor(c.program)}>{c.program}</Badge></TableCell>
                  <TableCell>{c.semester}</TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell>{c.hoursPerWeek}</TableCell>
                  <TableCell>{faculty.find(f => f.id === c.assignedFacultyId)?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setCourses(prev => prev.filter(x => x.id !== c.id)); toast.success('Deleted'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
