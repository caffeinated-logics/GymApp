export interface Exercise {
  id: string
  name: string
  /** Free text, e.g. "60 kg", "bodyweight", "20/22.5/25" */
  weight: string
  /** Free text, e.g. "10" or "12, 10, 8" */
  reps: string
  sets: number | ''
}

export interface Workout {
  id: string
  /** ISO date YYYY-MM-DD */
  date: string
  title: string
  notes: string
  exercises: Exercise[]
}
