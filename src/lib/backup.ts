import type { Exercise, Workout } from './types'
import { toISO } from './dates'
import { uid } from './store'

const APP_ID = 'ironlog'
const FORMAT_VERSION = 1

export interface BackupFile {
  app: typeof APP_ID
  version: number
  exportedAt: string
  workouts: Workout[]
}

export function downloadBackup(workouts: Workout[]) {
  const data: BackupFile = {
    app: APP_ID,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    workouts,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ironlog-backup-${toISO(new Date())}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

function cleanExercise(raw: unknown): Exercise | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  const sets = e.sets === '' || e.sets == null ? '' : Number(e.sets)
  return {
    id: str(e.id) || uid(),
    name: str(e.name),
    weight: str(e.weight),
    reps: str(e.reps),
    sets: sets === '' || Number.isNaN(sets) ? '' : sets,
  }
}

function cleanWorkout(raw: unknown): Workout | null {
  if (!raw || typeof raw !== 'object') return null
  const w = raw as Record<string, unknown>
  const date = str(w.date)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  return {
    id: str(w.id) || uid(),
    date,
    title: str(w.title),
    notes: str(w.notes),
    exercises: Array.isArray(w.exercises)
      ? w.exercises.map(cleanExercise).filter((e): e is Exercise => e !== null)
      : [],
  }
}

/** Parse and validate a backup file. Throws with a user-friendly message on failure. */
export async function readBackup(file: File): Promise<{ workouts: Workout[]; exportedAt?: string; skipped: number }> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  // Accept our backup format, or a bare array of workouts.
  let list: unknown[]
  let exportedAt: string | undefined
  if (Array.isArray(parsed)) {
    list = parsed
  } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as BackupFile).workouts)) {
    const b = parsed as BackupFile
    if (b.app && b.app !== APP_ID) throw new Error('This backup is from a different app.')
    if (typeof b.version === 'number' && b.version > FORMAT_VERSION)
      throw new Error('This backup was made by a newer version of IronLog.')
    list = b.workouts
    exportedAt = b.exportedAt
  } else {
    throw new Error("This doesn't look like an IronLog backup file.")
  }

  const workouts = list.map(cleanWorkout).filter((w): w is Workout => w !== null)
  if (list.length > 0 && workouts.length === 0) throw new Error('No valid workouts found in this file.')
  return { workouts, exportedAt, skipped: list.length - workouts.length }
}
