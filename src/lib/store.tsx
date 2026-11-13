import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Workout } from './types'
import { addDays, startOfWeek, toISO } from './dates'

const STORAGE_KEY = 'ironlog.workouts.v1'

export const uid = () => Math.random().toString(36).slice(2, 10)

function seed(): Workout[] {
  // A few sample sessions so the app doesn't look empty on first launch.
  const mon = startOfWeek(new Date())
  const mk = (offset: number, title: string, ex: [string, string, string, number][]): Workout => ({
    id: uid(),
    date: toISO(addDays(mon, offset)),
    title,
    notes: '',
    exercises: ex.map(([name, weight, reps, sets]) => ({ id: uid(), name, weight, reps, sets })),
  })
  return [
    mk(0, 'Push Day', [
      ['Bench Press', '70 kg', '8', 4],
      ['Overhead Press', '40 kg', '10', 3],
      ['Tricep Pushdown', '25 kg', '12', 3],
    ]),
    mk(2, 'Pull Day', [
      ['Deadlift', '120 kg', '5', 3],
      ['Pull-ups', 'Bodyweight', '10, 8, 8', 3],
      ['Barbell Row', '60 kg', '10', 3],
    ]),
    mk(-3, 'Leg Day', [
      ['Back Squat', '90 kg', '6', 5],
      ['Romanian Deadlift', '70 kg', '10', 3],
    ]),
    mk(-6, 'Upper Body', [
      ['Incline DB Press', '26 kg', '10', 3],
      ['Lat Pulldown', '55 kg', '12', 3],
    ]),
  ].filter((w) => w.date <= toISO(new Date()))
}

function load(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Workout[]
  } catch {
    /* ignore corrupt storage */
  }
  return seed()
}

interface Store {
  workouts: Workout[]
  get: (id: string) => Workout | undefined
  save: (w: Workout) => void
  remove: (id: string) => void
  /** Restore from backup. 'replace' wipes current data; 'merge' adds/overwrites by id. */
  importAll: (ws: Workout[], mode: 'replace' | 'merge') => void
}

const Ctx = createContext<Store | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
    } catch {
      /* storage full or unavailable */
    }
  }, [workouts])

  const store = useMemo<Store>(
    () => ({
      workouts: [...workouts].sort((a, b) => b.date.localeCompare(a.date)),
      get: (id) => workouts.find((w) => w.id === id),
      save: (w) =>
        setWorkouts((prev) =>
          prev.some((p) => p.id === w.id) ? prev.map((p) => (p.id === w.id ? w : p)) : [...prev, w],
        ),
      remove: (id) => setWorkouts((prev) => prev.filter((p) => p.id !== id)),
      importAll: (ws, mode) =>
        setWorkouts((prev) => {
          if (mode === 'replace') return ws
          const byId = new Map(prev.map((w) => [w.id, w]))
          for (const w of ws) byId.set(w.id, w)
          return [...byId.values()]
        }),
    }),
    [workouts],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useWorkouts() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useWorkouts must be used inside WorkoutProvider')
  return s
}

/** Number of distinct days trained (multiple sessions on one day count once). */
export function countDays(ws: Workout[]): number {
  return new Set(ws.map((w) => w.date)).size
}
