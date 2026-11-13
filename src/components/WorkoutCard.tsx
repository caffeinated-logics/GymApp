import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import type { Workout } from '../lib/types'
import { fmt, fromISO } from '../lib/dates'

export default function WorkoutCard({ workout, showDate = true }: { workout: Workout; showDate?: boolean }) {
  const totalSets = workout.exercises.reduce((n, e) => n + (Number(e.sets) || 0), 0)
  return (
    <article className="card workout">
      <header className="workout-head">
        <div>
          {showDate && <div className="eyebrow">{fmt.long(fromISO(workout.date))}</div>}
          <h3>{workout.title || 'Workout'}</h3>
        </div>
        <div className="workout-meta">
          <span className="pill">{workout.exercises.length} exercises</span>
          <span className="pill">{totalSets} sets</span>
          <Link to={`/log/${workout.id}`} className="icon-btn" aria-label="Edit workout">
            <Pencil size={16} />
          </Link>
        </div>
      </header>

      {workout.exercises.length > 0 && (
        <div className="table-wrap">
          <table className="ex-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Weight</th>
                <th>Reps</th>
                <th>Sets</th>
              </tr>
            </thead>
            <tbody>
              {workout.exercises.map((e) => (
                <tr key={e.id}>
                  <td className="ex-name">{e.name || '—'}</td>
                  <td>{e.weight || '—'}</td>
                  <td>{e.reps || '—'}</td>
                  <td>{e.sets === '' ? '—' : e.sets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {workout.notes && <p className="notes">{workout.notes}</p>}
    </article>
  )
}
