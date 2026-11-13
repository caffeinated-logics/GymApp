import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import { WorkoutProvider } from './lib/store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WeekView from './pages/WeekView'
import LogWorkout from './pages/LogWorkout'
import History from './pages/History'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkoutProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="week" element={<WeekView />} />
            <Route path="log" element={<LogWorkout />} />
            <Route path="log/:id" element={<LogWorkout />} />
            <Route path="history" element={<History />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  </StrictMode>,
)
