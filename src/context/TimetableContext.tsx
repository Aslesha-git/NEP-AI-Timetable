import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Faculty, Course, Room, StudentProgram, GeneratedTimetable } from '@/types/timetable';
import { sampleFaculty, sampleCourses, sampleRooms, samplePrograms } from '@/data/sampleData';

export interface PeriodDefinition {
  number: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string;
}

export interface ScheduleSettings {
  periods: PeriodDefinition[];
  weeklyOffs: string[];
}

interface TimetableContextType {
  faculty: Faculty[];
  setFaculty: React.Dispatch<React.SetStateAction<Faculty[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  programs: StudentProgram[];
  setPrograms: React.Dispatch<React.SetStateAction<StudentProgram[]>>;
  generatedTimetable: GeneratedTimetable | null;
  setGeneratedTimetable: React.Dispatch<React.SetStateAction<GeneratedTimetable | null>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleSettings: ScheduleSettings;
  setScheduleSettings: React.Dispatch<React.SetStateAction<ScheduleSettings>>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const defaultScheduleSettings: ScheduleSettings = {
  periods: [
    { number: 1, startTime: '08:00', endTime: '08:50', isBreak: false, label: 'Period 1' },
    { number: 2, startTime: '09:00', endTime: '09:50', isBreak: false, label: 'Period 2' },
    { number: 3, startTime: '10:00', endTime: '10:50', isBreak: false, label: 'Period 3' },
    { number: 4, startTime: '11:00', endTime: '11:50', isBreak: false, label: 'Period 4' },
    { number: 5, startTime: '12:00', endTime: '12:50', isBreak: true, label: 'Lunch Break' },
    { number: 6, startTime: '01:00', endTime: '01:50', isBreak: false, label: 'Period 5' },
    { number: 7, startTime: '02:00', endTime: '02:50', isBreak: false, label: 'Period 6' },
    { number: 8, startTime: '03:00', endTime: '03:50', isBreak: false, label: 'Period 7' },
  ],
  weeklyOffs: [],
};

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>(sampleFaculty);
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [rooms, setRooms] = useState<Room[]>(sampleRooms);
  const [programs, setPrograms] = useState<StudentProgram[]>(samplePrograms);
  const [generatedTimetable, setGeneratedTimetable] = useState<GeneratedTimetable | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(defaultScheduleSettings);

  return (
    <TimetableContext.Provider value={{
      faculty, setFaculty,
      courses, setCourses,
      rooms, setRooms,
      programs, setPrograms,
      generatedTimetable, setGeneratedTimetable,
      isGenerating, setIsGenerating,
      scheduleSettings, setScheduleSettings,
    }}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetableContext() {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error('useTimetableContext must be used within TimetableProvider');
  return ctx;
}
