import { Link } from 'react-router-dom'
import { CalendarCheck, CalendarRange, Flame, Plus } from 'lucide-react'
import { countDays, useWorkouts } from '../lib/store'
import { addDays, fmt, fromISO, inRange, isSameMonth, startOfWeek, toISO, weekDays } from '../lib/dates'
import WorkoutCard from '../components/WorkoutCard'

/** Consecutive weeks (ending this week or last week) with at least one session. */
function weekStreak(dates: Set<string>): number {
  let wk = startOfWeek(new Date())
  const hasIn = (s: Date) => [...dates].some((d) => inRange(d, s, addDays(s, 7)))
  if (!hasIn(wk)) wk = addDays(wk, -7) // this week not started yet — don't break streak
  let n = 0
  while (hasIn(wk)) {
    n++
    wk = addDays(wk, -7)
  }
  return n
}

export default function Dashboard() {
  const { workouts } = useWorkouts()
  const today = new Date()
  const todayISO = toISO(today)
  const weekStart = startOfWeek(today)
  const days = weekDays(weekStart)

  const thisWeek = workouts.filter((w) => inRange(w.date, weekStart, addDays(weekStart, 7)))
  const thisMonth = workouts.filter((w) => isSameMonth(w.date, today))
  const trainedDates = new Set(workouts.map((w) => w.date))

  // Month calendar grid (Mon-first)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const gridStart = startOfWeek(monthStart)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const cells = Math.ceil(((monthStart.getDay() + 6) % 7 + daysInMonth) / 7) * 7

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{fmt.long(today)}</p>
          <h1>Welcome back 💪</h1>
        </div>
        <Link to="/log" className="btn btn-primary">
          <Plus size={18} /> Log workout
        </Link>
      </header>

      <section className="stats">
        <div className="stat card">
          <span className="stat-icon orange"><CalendarCheck size={20} /></span>
          <div>
            <div className="stat-value">{countDays(thisWeek)}<small>/7</small></div>
            <div className="stat-label">Gym days this week</div>
          </div>
        </div>
        <div className="stat card">
          <span className="stat-icon blue"><CalendarRange size={20} /></span>
          <div>
            <div className="stat-value">{countDays(thisMonth)}<small>/{daysInMonth}</small></div>
            <div className="stat-label">Gym days in {today.toLocaleDateString(undefined, { month: 'long' })}</div>
          </div>
        </div>
        <div className="stat card">
          <span className="stat-icon green"><Flame size={20} /></span>
          <div>
            <div className="stat-value">{weekStreak(trainedDates)}</div>
            <div className="stat-label">Week streak</div>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">This week</h2>
          <div className="week-strip">
            {days.map((d) => {
              const iso = toISO(d)
              const hit = trainedDates.has(iso)
              return (
                <div key={iso} className={`day-dot ${hit ? 'hit' : ''} ${iso === todayISO ? 'today' : ''}`}>
                  <span className="dow">{fmt.weekday(d).slice(0, 2)}</span>
                  <span className="dot">{d.getDate()}</span>
                </div>
              )
            })}
          </div>
          <Link to="/week" className="link-more">View weekly routine →</Link>
        </section>

        <section className="card">
          <h2 className="card-title">{fmt.monthYear(today)}</h2>
          <div className="month-grid">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => (
              <span key={i} className="mg-head">{l}</span>
            ))}
            {Array.from({ length: cells }, (_, i) => {
              const d = addDays(gridStart, i)
              const iso = toISO(d)
              const inMonth = d.getMonth() === today.getMonth()
              return (
                <span
                  key={iso}
                  className={`mg-cell ${inMonth ? '' : 'muted'} ${trainedDates.has(iso) && inMonth ? 'hit' : ''} ${iso === todayISO ? 'today' : ''}`}
                >
                  {d.getDate()}
                </span>
              )
            })}
          </div>
        </section>
      </div>

      <section>
        <h2 className="section-title">Recent sessions</h2>
        {workouts.length === 0 ? (
          <div className="empty card">
            No workouts yet. <Link to="/log">Log your first session</Link>.
          </div>
        ) : (
          <div className="stack">
            {workouts
              .filter((w) => fromISO(w.date) <= today)
              .slice(0, 3)
              .map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
