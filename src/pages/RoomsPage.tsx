import { useState } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { Room, RoomType } from '@/types/timetable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ROOM_TYPES: RoomType[] = ['Lecture Hall', 'Lab', 'Seminar Room'];

export default function RoomsPage() {
  const { rooms, setRooms } = useTimetableContext();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({ name: '', capacity: '60', type: 'Lecture Hall' as RoomType, available: true });

  const resetForm = () => { setForm({ name: '', capacity: '60', type: 'Lecture Hall', available: true }); setEditing(null); };

  const handleSave = () => {
    if (!form.name) { toast.error('Room name required'); return; }
    if (editing) {
      setRooms(prev => prev.map(r => r.id === editing.id ? { ...r, name: form.name, capacity: +form.capacity, type: form.type, available: form.available } : r));
      toast.success('Room updated');
    } else {
      const newR: Room = { id: `R${String(rooms.length + 1).padStart(3, '0')}`, name: form.name, capacity: +form.capacity, type: form.type, available: form.available };
      setRooms(prev => [...prev, newR]);
      toast.success('Room added');
    }
    setOpen(false); resetForm();
  };

  const handleEdit = (r: Room) => {
    setEditing(r);
    setForm({ name: r.name, capacity: String(r.capacity), type: r.type, available: r.available });
    setOpen(true);
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title font-display">Classroom Infrastructure</h1>
          <p className="page-description">Manage rooms, labs, and seminar halls</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Room</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Room Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
              <div><Label>Room Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as RoomType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3"><Label>Available</Label><Switch checked={form.available} onCheckedChange={v => setForm(p => ({ ...p, available: v }))} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Capacity</TableHead>
                <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.capacity}</TableCell>
                  <TableCell><Badge variant="secondary">{r.type}</Badge></TableCell>
                  <TableCell><Badge className={r.available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>{r.available ? 'Available' : 'Unavailable'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setRooms(prev => prev.filter(x => x.id !== r.id)); toast.success('Deleted'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
