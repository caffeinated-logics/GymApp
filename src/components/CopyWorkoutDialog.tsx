import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'
import { useWorkouts } from '../lib/store'
import { cloneWorkout } from '../lib/copy'
import { addDays, fmt, fromISO, startOfWeek, toISO } from '../lib/dates'
import type { Workout } from '../lib/types'

/** Pick one or more dates and paste a copy of the workout onto each. */
export default function CopyWorkoutDialog({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { workouts, applyChanges } = useWorkouts()
  const [month, setMonth] = useState(() => {
    const d = fromISO(workout.date)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState<string[]>([])
  const [doneCount, setDoneCount] = useState<number | null>(null)

  const trained = new Set(workouts.map((w) => w.date))
  const todayISO = toISO(new Date())
  const gridStart = startOfWeek(month)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Math.ceil((((month.getDay() + 6) % 7) + daysInMonth) / 7) * 7

  const toggle = (iso: string) =>
    setSelected((s) => (s.includes(iso) ? s.filter((x) => x !== iso) : [...s, iso].sort()))

  const paste = () => {
    applyChanges(selected.map((d) => cloneWorkout(workout, d)))
    setDoneCount(selected.length)
  }

  if (doneCount !== null) {
    return (
      <Modal title="Copy workout" onClose={onClose}>
        <div className="alert success">
          <CheckCircle2 size={16} /> Pasted “{workout.title || 'Workout'}” to {doneCount} {doneCount === 1 ? 'date' : 'dates'}.
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Copy workout to…" onClose={onClose}>
      <p className="muted-text">
        Copying <strong>{workout.title || 'Workout'}</strong> ({workout.exercises.length} exercises). Pick one or more
        dates to paste it on.
      </p>

      <div className="picker-nav">
        <button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <strong>{fmt.monthYear(month)}</strong>
        <button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="month-grid picker">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => (
          <span key={i} className="mg-head">{l}</span>
        ))}
        {Array.from({ length: cells }, (_, i) => {
          const d = addDays(gridStart, i)
          const iso = toISO(d)
          const inMonth = d.getMonth() === month.getMonth()
          return (
            <button
              type="button"
              key={iso}
              disabled={!inMonth}
              onClick={() => toggle(iso)}
              className={`mg-cell pick ${!inMonth ? 'muted' : ''} ${selected.includes(iso) ? 'selected' : ''} ${trained.has(iso) ? 'has-workout' : ''} ${iso === todayISO ? 'today' : ''} ${iso === workout.date ? 'source' : ''}`}
              title={iso === workout.date ? 'Original workout date' : undefined}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <p className="hint">
        <span className="legend-dot" /> days that already have a workout. Pasting adds to them; it doesn't replace
        anything.
      </p>

      {selected.length > 0 && (
        <div className="chips">
          {selected.map((d) => (
            <button key={d} className="chip" onClick={() => toggle(d)} title="Remove">
              {fmt.weekday(fromISO(d))} {fmt.dayMonth(fromISO(d))} ×
            </button>
          ))}
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!selected.length} onClick={paste}>
          Paste to {selected.length || ''} {selected.length === 1 ? 'date' : 'dates'}
        </button>
      </div>
    </Modal>
  )
}
