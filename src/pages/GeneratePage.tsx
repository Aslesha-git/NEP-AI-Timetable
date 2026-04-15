import { useState } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { generateTimetable } from '@/engine/geneticAlgorithm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function GeneratePage() {
  const { faculty, courses, rooms, programs, scheduleSettings, setGeneratedTimetable, isGenerating, setIsGenerating } = useTimetableContext();
  const [progress, setProgress] = useState(0);
  const [genInfo, setGenInfo] = useState<{ gen: number; score: number } | null>(null);

  const activePeriods = scheduleSettings.periods.filter(p => !p.isBreak);
  const activeDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].filter(d => !scheduleSettings.weeklyOffs.includes(d));

  const handleGenerate = () => {
    if (courses.length === 0) { toast.error('Add courses first'); return; }
    if (rooms.length === 0) { toast.error('Add rooms first'); return; }
    if (activePeriods.length === 0) { toast.error('Configure periods in Schedule Settings'); return; }
    setIsGenerating(true);
    setProgress(0);

    setTimeout(() => {
      const result = generateTimetable(
        { faculty, courses, rooms, programs },
        (gen, bestScore) => {
          setProgress((gen / 200) * 100);
          setGenInfo({ gen, score: bestScore });
        },
        { activeDays, activePeriods: activePeriods.map(p => p.number) }
      );
      setGeneratedTimetable(result);
      setIsGenerating(false);
      setProgress(100);

      if (result.conflicts.length === 0) {
        toast.success('Conflict-free timetable generated!');
      } else {
        toast.warning(`Timetable generated with ${result.conflicts.length} conflict(s)`);
      }
    }, 100);
  };

  const { generatedTimetable } = useTimetableContext();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title font-display">AI Timetable Generator</h1>
        <p className="page-description">Genetic Algorithm-based scheduling engine for NEP 2020 programs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0 text-center">
            <p className="text-4xl font-bold text-primary">{courses.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Courses to Schedule</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0 text-center">
            <p className="text-4xl font-bold text-secondary">{faculty.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Available Faculty</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0 text-center">
            <p className="text-4xl font-bold text-accent">{rooms.filter(r => r.available).length}</p>
            <p className="text-sm text-muted-foreground mt-1">Available Rooms</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Brain className="h-5 w-5 text-primary" />
            Generate Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Active Days</p>
                <p className="font-semibold">{activeDays.length} days</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Teaching Periods</p>
                <p className="font-semibold">{activePeriods.length} per day</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Break Periods</p>
                <p className="font-semibold">{scheduleSettings.periods.filter(p => p.isBreak).length}</p>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Generation {genInfo?.gen || 0} — Best Fitness: {genInfo?.score || 0}</p>
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
              {isGenerating ? (
                <><Zap className="h-4 w-4 mr-2 animate-pulse" />Evolving Timetables...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" />Generate Timetable</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedTimetable && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                {generatedTimetable.conflicts.length === 0 ? (
                  <><CheckCircle className="h-5 w-5 text-success" />Generation Complete — No Conflicts</>
                ) : (
                  <><AlertTriangle className="h-5 w-5 text-warning" />{generatedTimetable.conflicts.length} Conflict(s) Detected</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex gap-4 text-sm">
                  <span>Fitness Score: <strong>{generatedTimetable.fitnessScore}</strong></span>
                  <span>Entries: <strong>{generatedTimetable.entries.length}</strong></span>
                  <span>Generated: <strong>{generatedTimetable.generatedAt.toLocaleString()}</strong></span>
                </div>
              </div>
              {generatedTimetable.conflicts.length > 0 && (
                <div className="space-y-2">
                  {generatedTimetable.conflicts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted">
                      <Badge variant={c.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">{c.severity}</Badge>
                      <span>{c.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
