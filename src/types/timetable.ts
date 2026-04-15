export interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  maxHoursPerWeek: number;
  availableSlots: TimeSlot[];
  preferredSlots: TimeSlot[];
}

export interface Course {
  id: string;
  name: string;
  program: ProgramType;
  semester: number;
  credits: number;
  hoursPerWeek: number;
  assignedFacultyId?: string;
}

export type ProgramType = 'B.Ed' | 'M.Ed' | 'FYUP' | 'ITEP';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  available: boolean;
}

export type RoomType = 'Lecture Hall' | 'Lab' | 'Seminar Room';

export interface StudentProgram {
  id: string;
  name: ProgramType;
  semester: number;
  studentCount: number;
  requiredSubjects: string[];
}

export interface TimeSlot {
  day: Day;
  period: number;
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
export const PERIOD_TIMES = [
  '8:00-8:50', '9:00-9:50', '10:00-10:50', '11:00-11:50',
  '12:00-12:50', '1:00-1:50', '2:00-2:50', '3:00-3:50'
];

export interface TimetableEntry {
  day: Day;
  period: number;
  courseId: string;
  facultyId: string;
  roomId: string;
  program: ProgramType;
  semester: number;
}

export interface GeneratedTimetable {
  id: string;
  entries: TimetableEntry[];
  fitnessScore: number;
  conflicts: Conflict[];
  generatedAt: Date;
}

export interface Conflict {
  type: 'faculty_overlap' | 'room_overlap' | 'workload_exceeded' | 'capacity_exceeded' | 'hours_unsatisfied';
  description: string;
  severity: 'high' | 'medium' | 'low';
}
