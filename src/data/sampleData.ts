import { Faculty, Course, Room, StudentProgram } from '@/types/timetable';

export const sampleFaculty: Faculty[] = [
  { id: 'F001', name: 'Dr. Priya Sharma', department: 'Education', subjects: ['Pedagogy', 'Educational Psychology'], maxHoursPerWeek: 18, availableSlots: [], preferredSlots: [] },
  { id: 'F002', name: 'Dr. Rajesh Kumar', department: 'Education', subjects: ['Curriculum Development', 'Assessment Methods'], maxHoursPerWeek: 16, availableSlots: [], preferredSlots: [] },
  { id: 'F003', name: 'Prof. Anita Desai', department: 'Sciences', subjects: ['Mathematics Education', 'Statistics'], maxHoursPerWeek: 20, availableSlots: [], preferredSlots: [] },
  { id: 'F004', name: 'Dr. Suresh Patel', department: 'Languages', subjects: ['English Proficiency', 'Communication Skills'], maxHoursPerWeek: 18, availableSlots: [], preferredSlots: [] },
  { id: 'F005', name: 'Prof. Meena Iyer', department: 'Technology', subjects: ['ICT in Education', 'Digital Pedagogy'], maxHoursPerWeek: 16, availableSlots: [], preferredSlots: [] },
  { id: 'F006', name: 'Dr. Vikram Singh', department: 'Education', subjects: ['Philosophy of Education', 'NEP 2020 Studies'], maxHoursPerWeek: 18, availableSlots: [], preferredSlots: [] },
];

export const sampleCourses: Course[] = [
  { id: 'C001', name: 'Pedagogy', program: 'B.Ed', semester: 1, credits: 4, hoursPerWeek: 4, assignedFacultyId: 'F001' },
  { id: 'C002', name: 'Educational Psychology', program: 'B.Ed', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F001' },
  { id: 'C003', name: 'Curriculum Development', program: 'B.Ed', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F002' },
  { id: 'C004', name: 'Mathematics Education', program: 'B.Ed', semester: 1, credits: 4, hoursPerWeek: 4, assignedFacultyId: 'F003' },
  { id: 'C005', name: 'English Proficiency', program: 'B.Ed', semester: 1, credits: 2, hoursPerWeek: 2, assignedFacultyId: 'F004' },
  { id: 'C006', name: 'ICT in Education', program: 'B.Ed', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F005' },
  { id: 'C007', name: 'NEP 2020 Studies', program: 'M.Ed', semester: 1, credits: 4, hoursPerWeek: 4, assignedFacultyId: 'F006' },
  { id: 'C008', name: 'Assessment Methods', program: 'M.Ed', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F002' },
  { id: 'C009', name: 'Digital Pedagogy', program: 'FYUP', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F005' },
  { id: 'C010', name: 'Communication Skills', program: 'ITEP', semester: 1, credits: 2, hoursPerWeek: 2, assignedFacultyId: 'F004' },
  { id: 'C011', name: 'Philosophy of Education', program: 'ITEP', semester: 1, credits: 3, hoursPerWeek: 3, assignedFacultyId: 'F006' },
  { id: 'C012', name: 'Statistics', program: 'FYUP', semester: 1, credits: 4, hoursPerWeek: 4, assignedFacultyId: 'F003' },
];

export const sampleRooms: Room[] = [
  { id: 'R001', name: 'Hall A', capacity: 120, type: 'Lecture Hall', available: true },
  { id: 'R002', name: 'Hall B', capacity: 80, type: 'Lecture Hall', available: true },
  { id: 'R003', name: 'Lab 1', capacity: 40, type: 'Lab', available: true },
  { id: 'R004', name: 'Lab 2', capacity: 40, type: 'Lab', available: true },
  { id: 'R005', name: 'Seminar Room 1', capacity: 30, type: 'Seminar Room', available: true },
  { id: 'R006', name: 'Seminar Room 2', capacity: 30, type: 'Seminar Room', available: true },
];

export const samplePrograms: StudentProgram[] = [
  { id: 'P001', name: 'B.Ed', semester: 1, studentCount: 60, requiredSubjects: ['Pedagogy', 'Educational Psychology', 'Curriculum Development', 'Mathematics Education', 'English Proficiency', 'ICT in Education'] },
  { id: 'P002', name: 'M.Ed', semester: 1, studentCount: 30, requiredSubjects: ['NEP 2020 Studies', 'Assessment Methods'] },
  { id: 'P003', name: 'FYUP', semester: 1, studentCount: 45, requiredSubjects: ['Digital Pedagogy', 'Statistics'] },
  { id: 'P004', name: 'ITEP', semester: 1, studentCount: 35, requiredSubjects: ['Communication Skills', 'Philosophy of Education'] },
];
