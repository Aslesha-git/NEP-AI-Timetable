import { useState, useMemo } from 'react';
import { useTimetableContext } from '@/context/TimetableContext';
import { DAYS, PERIODS, PERIOD_TIMES, ProgramType, Day } from '@/types/timetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type FilterType = 'program' | 'faculty' | 'room';

export default function TimetablePage() {
  const { generatedTimetable, faculty, courses, rooms } = useTimetableContext();
  const [filterType, setFilterType] = useState<FilterType>('program');
  const [filterValue, setFilterValue] = useState<string>('');

  const filterOptions = useMemo(() => {
    if (filterType === 'program') return [...new Set(courses.map(c => c.program))];
    if (filterType === 'faculty') return faculty.map(f => f.id);
    return rooms.map(r => r.id);
  }, [filterType, faculty, courses, rooms]);

  const filteredEntries = useMemo(() => {
    if (!generatedTimetable) return [];
    if (!filterValue) return generatedTimetable.entries;
    return generatedTimetable.entries.filter(e => {
      if (filterType === 'program') return e.program === filterValue;
      if (filterType === 'faculty') return e.facultyId === filterValue;
      return e.roomId === filterValue;
    });
  }, [generatedTimetable, filterType, filterValue]);

  const getCell = (day: Day, period: number) => {
    return filteredEntries.filter(e => e.day === day && e.period === period);
  };

  const getLabel = (id: string, type: FilterType) => {
    if (type === 'faculty') return faculty.find(f => f.id === id)?.name || id;
    if (type === 'room') return rooms.find(r => r.id === id)?.name || id;
    return id;
  };

  const exportPDF = () => {
    if (!generatedTimetable) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text('Timetable - NEP 2020', 14, 15);
    doc.setFontSize(10);
    doc.text(`Filter: ${filterType} - ${filterValue || 'All'} | Generated: ${generatedTimetable.generatedAt.toLocaleString()}`, 14, 22);

    const headers = ['Day/Period', ...PERIODS.map((_, i) => PERIOD_TIMES[i])];
    const body = DAYS.map(day => {
      return [day, ...PERIODS.map(p => {
        const cells = getCell(day, p);
        return cells.map(c => {
          const course = courses.find(x => x.id === c.courseId);
          const fac = faculty.find(x => x.id === c.facultyId);
          const room = rooms.find(x => x.id === c.roomId);
          return `${course?.name || c.courseId}\n${fac?.name?.split(' ').pop() || ''}\n${room?.name || ''}`;
        }).join('\n---\n') || '';
      })];
    });

    autoTable(doc, { head: [headers], body, startY: 28, styles: { fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [30, 58, 95] } });
    doc.save('timetable.pdf');
    toast.success('PDF exported');
  };

  const exportExcel = () => {
    if (!generatedTimetable) return;
    const wsData = [['Day', ...PERIOD_TIMES]];
    DAYS.forEach(day => {
      wsData.push([day, ...PERIODS.map(p => {
        const cells = getCell(day, p);
        return cells.map(c => {
          const course = courses.find(x => x.id === c.courseId);
          return course?.name || c.courseId;
        }).join(', ') || '';
      })]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, 'timetable.xlsx');
    toast.success('Excel exported');
  };

  if (!generatedTimetable) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title font-display">Timetable View</h1>
          <p className="page-description">Generate a timetable first to view it here</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No timetable generated yet. Go to Generate Timetable to create one.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title font-display">Timetable View</h1>
          <p className="page-description">Visual timetable grid with filters and export</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by:</span>
            <Select value={filterType} onValueChange={v => { setFilterType(v as FilterType); setFilterValue(''); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="room">Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All</SelectItem>
              {filterOptions.map(o => <SelectItem key={o} value={o}>{getLabel(o, filterType)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filteredEntries.length} entries</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr>
                <th className="timetable-header border-r w-24">Day</th>
                {PERIODS.map((p, i) => (
                  <th key={p} className="timetable-header border-r last:border-r-0">
                    <div>P{p}</div>
                    <div className="text-[10px] font-normal opacity-70">{PERIOD_TIMES[i]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="border-t">
                  <td className="timetable-header border-r font-medium text-xs">{day.slice(0, 3)}</td>
                  {PERIODS.map(p => {
                    const cells = getCell(day, p);
                    return (
                      <td key={p} className={`timetable-cell border-r last:border-r-0 ${cells.length > 0 ? 'timetable-cell-filled' : ''}`}>
                        {cells.map((c, i) => {
                          const course = courses.find(x => x.id === c.courseId);
                          const fac = faculty.find(x => x.id === c.facultyId);
                          const room = rooms.find(x => x.id === c.roomId);
                          return (
                            <div key={i} className={`${i > 0 ? 'mt-1 pt-1 border-t border-dashed' : ''}`}>
                              <p className="font-semibold text-primary truncate">{course?.name || c.courseId}</p>
                              <p className="text-muted-foreground truncate">{fac?.name?.split(' ').pop()}</p>
                              <p className="text-muted-foreground truncate">{room?.name}</p>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
