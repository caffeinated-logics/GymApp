import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, Plus } from 'lucide-react'
import CopyWeekDialog from '../components/CopyWeekDialog'
import { countDays, useWorkouts } from '../lib/store'
import { addDays, fmt, startOfWeek, toISO, weekDays } from '../lib/dates'
import WorkoutCard from '../components/WorkoutCard'

export default function WeekView() {
  const { workouts } = useWorkouts()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [copyingWeek, setCopyingWeek] = useState(false)
  const days = weekDays(weekStart)
  const todayISO = toISO(new Date())
  const isCurrent = toISO(weekStart) === toISO(startOfWeek(new Date()))

  const weekWorkouts = workouts.filter((w) => w.date >= toISO(days[0]) && w.date <= toISO(days[6]))
  const totalSets = weekWorkouts.flatMap((w) => w.exercises).reduce((n, e) => n + (Number(e.sets) || 0), 0)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Weekly routine</p>
          <h1>
            {fmt.dayMonth(days[0])} – {fmt.dayMonth(days[6])}
          </h1>
        </div>
        <div className="week-nav">
          <button className="btn btn-ghost" onClick={() => setCopyingWeek(true)} disabled={!weekWorkouts.length}>
            <Copy size={16} /> Copy week
          </button>
          <button className="icon-btn" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-ghost" disabled={isCurrent} onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Today
          </button>
          <button className="icon-btn" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {copyingWeek && <CopyWeekDialog sourceStart={weekStart} onClose={() => setCopyingWeek(false)} />}

      <div className="summary-bar card">
        <div><strong>{countDays(weekWorkouts)}</strong> gym days</div>
        <div><strong>{weekWorkouts.length}</strong> sessions</div>
        <div><strong>{totalSets}</strong> total sets</div>
      </div>

      <div className="stack">
        {days.map((d) => {
          const iso = toISO(d)
          const dayWorkouts = weekWorkouts.filter((w) => w.date === iso)
          return (
            <section key={iso} className={`day-row ${iso === todayISO ? 'is-today' : ''}`}>
              <div className="day-label">
                <span className="dow">{fmt.weekday(d)}</span>
                <span className="dnum">{d.getDate()}</span>
              </div>
              <div className="day-body">
                {dayWorkouts.length ? (
                  dayWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} showDate={false} />)
                ) : (
                  <div className="rest">
                    <span>Rest day</span>
                    <Link to={`/log?date=${iso}`} className="add-inline">
                      <Plus size={14} /> Add
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
