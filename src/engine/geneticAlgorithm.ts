import {
  Faculty, Course, Room, StudentProgram,
  TimetableEntry, GeneratedTimetable, Conflict,
  DAYS, PERIODS, Day
} from '@/types/timetable';

const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 200;
const MUTATION_RATE = 0.15;
const ELITE_COUNT = 5;

interface GAInput {
  faculty: Faculty[];
  courses: Course[];
  rooms: Room[];
  programs: StudentProgram[];
}

interface ScheduleConstraints {
  activeDays: string[];
  activePeriods: number[];
}

type Chromosome = TimetableEntry[];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomChromosome(input: GAInput, constraints: ScheduleConstraints): Chromosome {
  const entries: TimetableEntry[] = [];
  const { courses, rooms } = input;
  const days = constraints.activeDays as Day[];
  const periods = constraints.activePeriods;

  for (const course of courses) {
    const availableRooms = rooms.filter(r => r.available);
    for (let h = 0; h < course.hoursPerWeek; h++) {
      entries.push({
        day: randomItem(days),
        period: randomItem(periods),
        courseId: course.id,
        facultyId: course.assignedFacultyId || '',
        roomId: randomItem(availableRooms).id,
        program: course.program,
        semester: course.semester,
      });
    }
  }
  return entries;
}

function evaluateFitness(chromosome: Chromosome, input: GAInput): { score: number; conflicts: Conflict[] } {
  let score = 1000;
  const conflicts: Conflict[] = [];

  // Check faculty overlap
  const facultySlotMap = new Map<string, TimetableEntry[]>();
  for (const entry of chromosome) {
    const key = `${entry.facultyId}-${entry.day}-${entry.period}`;
    if (!facultySlotMap.has(key)) facultySlotMap.set(key, []);
    facultySlotMap.get(key)!.push(entry);
  }
  for (const [, entries] of facultySlotMap) {
    if (entries.length > 1) {
      score -= 50 * (entries.length - 1);
      const faculty = input.faculty.find(f => f.id === entries[0].facultyId);
      conflicts.push({
        type: 'faculty_overlap',
        description: `${faculty?.name || entries[0].facultyId} assigned to ${entries.length} classes at ${entries[0].day} Period ${entries[0].period}`,
        severity: 'high',
      });
    }
  }

  // Check room overlap
  const roomSlotMap = new Map<string, TimetableEntry[]>();
  for (const entry of chromosome) {
    const key = `${entry.roomId}-${entry.day}-${entry.period}`;
    if (!roomSlotMap.has(key)) roomSlotMap.set(key, []);
    roomSlotMap.get(key)!.push(entry);
  }
  for (const [, entries] of roomSlotMap) {
    if (entries.length > 1) {
      score -= 40 * (entries.length - 1);
      conflicts.push({
        type: 'room_overlap',
        description: `Room conflict: ${entries.length} classes in same room at ${entries[0].day} Period ${entries[0].period}`,
        severity: 'high',
      });
    }
  }

  // Check faculty workload
  const facultyHours = new Map<string, number>();
  for (const entry of chromosome) {
    facultyHours.set(entry.facultyId, (facultyHours.get(entry.facultyId) || 0) + 1);
  }
  for (const [fid, hours] of facultyHours) {
    const faculty = input.faculty.find(f => f.id === fid);
    if (faculty && hours > faculty.maxHoursPerWeek) {
      score -= 30 * (hours - faculty.maxHoursPerWeek);
      conflicts.push({
        type: 'workload_exceeded',
        description: `${faculty.name}: ${hours}/${faculty.maxHoursPerWeek} hours exceeded`,
        severity: 'medium',
      });
    }
  }

  // Check program clashes
  const progSlotMap = new Map<string, TimetableEntry[]>();
  for (const entry of chromosome) {
    const key = `${entry.program}-${entry.semester}-${entry.day}-${entry.period}`;
    if (!progSlotMap.has(key)) progSlotMap.set(key, []);
    progSlotMap.get(key)!.push(entry);
  }
  for (const [, entries] of progSlotMap) {
    if (entries.length > 1) {
      score -= 45 * (entries.length - 1);
      conflicts.push({
        type: 'faculty_overlap',
        description: `${entries[0].program} Sem ${entries[0].semester}: ${entries.length} classes clash at ${entries[0].day} Period ${entries[0].period}`,
        severity: 'high',
      });
    }
  }

  // Check room capacity
  for (const entry of chromosome) {
    const room = input.rooms.find(r => r.id === entry.roomId);
    const prog = input.programs.find(p => p.name === entry.program && p.semester === entry.semester);
    if (room && prog && prog.studentCount > room.capacity) {
      score -= 20;
      conflicts.push({
        type: 'capacity_exceeded',
        description: `${room.name} (cap: ${room.capacity}) insufficient for ${prog.name} (${prog.studentCount} students)`,
        severity: 'medium',
      });
    }
  }

  // Spread classes across days
  const dayCounts = new Map<string, number>();
  for (const entry of chromosome) {
    const key = `${entry.courseId}-${entry.day}`;
    dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
  }
  for (const [, count] of dayCounts) {
    if (count > 1) score -= 5 * (count - 1);
  }

  const uniqueConflicts = conflicts.filter((c, i, arr) =>
    arr.findIndex(x => x.description === c.description) === i
  );

  return { score: Math.max(0, score), conflicts: uniqueConflicts };
}

function crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
  const point = Math.floor(Math.random() * Math.min(parent1.length, parent2.length));
  return [...parent1.slice(0, point), ...parent2.slice(point)];
}

function mutate(chromosome: Chromosome, input: GAInput, constraints: ScheduleConstraints): Chromosome {
  const days = constraints.activeDays as Day[];
  const periods = constraints.activePeriods;

  return chromosome.map(entry => {
    if (Math.random() < MUTATION_RATE) {
      const mutationType = Math.random();
      if (mutationType < 0.33) {
        return { ...entry, day: randomItem(days) };
      } else if (mutationType < 0.66) {
        return { ...entry, period: randomItem(periods) };
      } else {
        const availableRooms = input.rooms.filter(r => r.available);
        return { ...entry, roomId: randomItem(availableRooms).id };
      }
    }
    return entry;
  });
}

function tournamentSelect(population: { chromosome: Chromosome; score: number }[], size: number = 3): Chromosome {
  const tournament = Array.from({ length: size }, () => randomItem(population));
  tournament.sort((a, b) => b.score - a.score);
  return tournament[0].chromosome;
}

export function generateTimetable(
  input: GAInput,
  onProgress?: (gen: number, bestScore: number) => void,
  constraints?: ScheduleConstraints
): GeneratedTimetable {
  const defaultConstraints: ScheduleConstraints = {
    activeDays: [...DAYS],
    activePeriods: [...PERIODS],
  };
  const c = constraints || defaultConstraints;

  let population = Array.from({ length: POPULATION_SIZE }, () => {
    const chromosome = generateRandomChromosome(input, c);
    const { score } = evaluateFitness(chromosome, input);
    return { chromosome, score };
  });

  let bestEver = population[0];

  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    population.sort((a, b) => b.score - a.score);

    if (population[0].score > bestEver.score) {
      bestEver = population[0];
    }

    const { conflicts } = evaluateFitness(bestEver.chromosome, input);
    if (conflicts.filter(c => c.severity === 'high').length === 0 && bestEver.score >= 950) {
      break;
    }

    onProgress?.(gen, bestEver.score);

    const newPop = population.slice(0, ELITE_COUNT).map(p => ({ ...p }));

    while (newPop.length < POPULATION_SIZE) {
      const p1 = tournamentSelect(population);
      const p2 = tournamentSelect(population);
      let child = crossover(p1, p2);
      child = mutate(child, input, c);
      const { score } = evaluateFitness(child, input);
      newPop.push({ chromosome: child, score });
    }

    population = newPop;
  }

  const finalEval = evaluateFitness(bestEver.chromosome, input);

  return {
    id: `TT-${Date.now()}`,
    entries: bestEver.chromosome,
    fitnessScore: finalEval.score,
    conflicts: finalEval.conflicts,
    generatedAt: new Date(),
  };
}
