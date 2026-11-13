import type { Workout } from './types'
import { uid } from './store'

/** Deep-copy a workout onto a new date, with fresh ids so it's independent of the original. */
export function cloneWorkout(w: Workout, date: string): Workout {
  return {
    ...w,
    id: uid(),
    date,
    exercises: w.exercises.map((e) => ({ ...e, id: uid() })),
  }
}
