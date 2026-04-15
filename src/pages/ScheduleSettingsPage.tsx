import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTimetableContext, PeriodDefinition } from '@/context/TimetableContext';
import type { Json } from '@/integrations/supabase/types';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function ScheduleSettingsPage() {
  const { user } = useAuth();
  const { scheduleSettings, setScheduleSettings } = useTimetableContext();
  const [periods, setPeriods] = useState<PeriodDefinition[]>(scheduleSettings.periods);
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(scheduleSettings.weeklyOffs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('college_settings')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    if (data) {
      const loadedPeriods = data.periods as unknown as PeriodDefinition[];
      if (Array.isArray(loadedPeriods) && loadedPeriods.length > 0) {
        setPeriods(loadedPeriods);
        setScheduleSettings({ periods: loadedPeriods, weeklyOffs: data.weekly_offs || [] });
      }
      if (data.weekly_offs) setWeeklyOffs(data.weekly_offs);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('college_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    const periodsJson = JSON.parse(JSON.stringify(periods)) as Json;

    let error;
    if (existing) {
      ({ error } = await supabase.from('college_settings').update({
        periods: periodsJson,
        weekly_offs: weeklyOffs,
      }).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('college_settings').insert({
        user_id: user.id,
        periods: periodsJson,
        weekly_offs: weeklyOffs,
      }));
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('Schedule settings saved!');
      setScheduleSettings({ periods, weeklyOffs });
    }
  };

  const addPeriod = () => {
    const next = periods.length + 1;
    setPeriods([...periods, { number: next, startTime: '', endTime: '', isBreak: false, label: `Period ${next}` }]);
  };

  const removePeriod = (idx: number) => {
    const updated = periods.filter((_, i) => i !== idx).map((p, i) => ({ ...p, number: i + 1 }));
    setPeriods(updated);
  };

  const updatePeriod = (idx: number, field: keyof PeriodDefinition, value: string | boolean | number) => {
    const updated = [...periods];
    (updated[idx] as any)[field] = value;
    setPeriods(updated);
  };

  const toggleWeeklyOff = (day: string) => {
    setWeeklyOffs(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title font-display">Schedule Settings</h1>
        <p className="page-description">Define college period timings and weekly off days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display">
                <Clock className="h-5 w-5 text-primary" />
                Period Definitions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addPeriod}>
                <Plus className="h-4 w-4 mr-1" /> Add Period
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {periods.map((period, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${period.isBreak ? 'bg-accent/10 border-accent/30' : 'bg-card'}`}>
                    <span className="text-xs font-semibold text-muted-foreground w-6">{period.number}</span>
                    <Input
                      value={period.label}
                      onChange={e => updatePeriod(idx, 'label', e.target.value)}
                      className="w-32"
                      placeholder="Label"
                    />
                    <Input
                      type="time"
                      value={period.startTime}
                      onChange={e => updatePeriod(idx, 'startTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={period.endTime}
                      onChange={e => updatePeriod(idx, 'endTime', e.target.value)}
                      className="w-32"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={period.isBreak}
                        onCheckedChange={v => updatePeriod(idx, 'isBreak', !!v)}
                      />
                      <Label className="text-xs">Break</Label>
                    </div>
                    {period.isBreak && <Badge variant="secondary" className="text-xs">Break</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => removePeriod(idx)} className="ml-auto">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Weekly Off Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ALL_DAYS.map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <Checkbox
                      checked={weeklyOffs.includes(day)}
                      onCheckedChange={() => toggleWeeklyOff(day)}
                    />
                    <Label>{day}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
