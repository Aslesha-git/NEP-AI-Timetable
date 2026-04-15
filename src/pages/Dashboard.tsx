import { useTimetableContext } from '@/context/TimetableContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Building2, GraduationCap, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fadeIn = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { faculty, courses, rooms, programs, generatedTimetable } = useTimetableContext();

  const stats = [
    { label: 'Faculty', value: faculty.length, icon: Users, color: 'text-primary' },
    { label: 'Courses', value: courses.length, icon: BookOpen, color: 'text-secondary' },
    { label: 'Rooms', value: rooms.length, icon: Building2, color: 'text-accent' },
    { label: 'Programs', value: programs.length, icon: GraduationCap, color: 'text-info' },
  ];

  const workloadData = faculty.map(f => {
    const assigned = courses.filter(c => c.assignedFacultyId === f.id).reduce((sum, c) => sum + c.hoursPerWeek, 0);
    return { name: f.name.split(' ').pop(), assigned, max: f.maxHoursPerWeek };
  });

  const programData = programs.map(p => ({ name: p.name, students: p.studentCount }));
  const COLORS = ['hsl(215,70%,28%)', 'hsl(174,52%,40%)', 'hsl(38,92%,55%)', 'hsl(200,80%,50%)'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title font-display">Dashboard</h1>
        <p className="page-description">Overview of your multidisciplinary timetable system</p>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        {stats.map(s => (
          <motion.div key={s.label} variants={fadeIn}>
            <Card className="stat-card">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`h-10 w-10 ${s.color} opacity-30`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {generatedTimetable && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Card className={generatedTimetable.conflicts.length === 0 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
            <CardContent className="p-4 flex items-center gap-3">
              {generatedTimetable.conflicts.length === 0 ? (
                <><CheckCircle className="h-5 w-5 text-success" /><span className="text-sm font-medium">Timetable generated with no conflicts! Fitness: {generatedTimetable.fitnessScore}</span></>
              ) : (
                <><AlertTriangle className="h-5 w-5 text-warning" /><span className="text-sm font-medium">{generatedTimetable.conflicts.length} conflict(s) detected. Fitness: {generatedTimetable.fitnessScore}</span></>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Faculty Workload</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workloadData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="assigned" fill="hsl(215,70%,28%)" radius={[4,4,0,0]} name="Assigned Hours" />
                <Bar dataKey="max" fill="hsl(215,70%,28%,0.2)" radius={[4,4,0,0]} name="Max Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Student Distribution</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={programData} cx="50%" cy="50%" outerRadius={90} dataKey="students" label={({ name, students }) => `${name}: ${students}`}>
                  {programData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
