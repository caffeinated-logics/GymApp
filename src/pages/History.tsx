import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { countDays, useWorkouts } from '../lib/store'
import { fmt, fromISO } from '../lib/dates'
import WorkoutCard from '../components/WorkoutCard'
import type { Workout } from '../lib/types'

export default function History() {
  const { workouts } = useWorkouts()
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = needle
      ? workouts.filter(
          (w) =>
            w.title.toLowerCase().includes(needle) ||
            w.exercises.some((e) => e.name.toLowerCase().includes(needle)),
        )
      : workouts
    const map = new Map<string, Workout[]>()
    for (const w of filtered) {
      const key = w.date.slice(0, 7)
      map.set(key, [...(map.get(key) ?? []), w])
    }
    return [...map.entries()]
  }, [workouts, q])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">All sessions</p>
          <h1>History</h1>
        </div>
        <label className="search">
          <Search size={16} />
          <input placeholder="Search workouts or exercises" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </header>

      {groups.length === 0 ? (
        <div className="empty card">
          {q ? 'No matches.' : <>No workouts yet. <Link to="/log">Log one</Link>.</>}
        </div>
      ) : (
        groups.map(([month, ws]) => (
          <section key={month} className="month-group">
            <h2 className="section-title">
              {fmt.monthYear(fromISO(month + '-01'))}
              <span className="pill">{countDays(ws)} gym days</span>
            </h2>
            <div className="stack">
              {ws.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
