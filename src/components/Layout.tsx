import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Dumbbell, History, LayoutDashboard, Plus } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/week', label: 'This Week', icon: CalendarDays },
  { to: '/log', label: 'Log Workout', icon: Plus },
  { to: '/history', label: 'History', icon: History },
]

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Dumbbell size={20} />
          </span>
          IronLog
        </div>
        <nav className="nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-foot">Data is saved in this browser.</p>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <nav className="tabbar">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="tab">
            <Icon size={20} />
            <span>{label.replace(' Workout', '')}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
