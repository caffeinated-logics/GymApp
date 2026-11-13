import { useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { uid, useWorkouts } from '../lib/store'
import { toISO } from '../lib/dates'
import type { Exercise, Workout } from '../lib/types'

const blankExercise = (): Exercise => ({ id: uid(), name: '', weight: '', reps: '', sets: '' })

export default function LogWorkout() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { get, save, remove } = useWorkouts()
  const navigate = useNavigate()
  const existing = id ? get(id) : undefined

  const [form, setForm] = useState<Workout>(
    () =>
      existing ?? {
        id: uid(),
        date: params.get('date') ?? toISO(new Date()),
        title: '',
        notes: '',
        exercises: [blankExercise()],
      },
  )

  if (id && !existing) {
    return (
      <div className="page">
        <div className="empty card">Workout not found.</div>
      </div>
    )
  }

  const setEx = (exId: string, patch: Partial<Exercise>) =>
    setForm((f) => ({ ...f, exercises: f.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    save({ ...form, exercises: form.exercises.filter((x) => x.name.trim() || x.weight || x.reps || x.sets !== '') })
    navigate('/week')
  }

  const onDelete = () => {
    if (confirm('Delete this workout?')) {
      remove(form.id)
      navigate('/history')
    }
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <div>
          <p className="eyebrow">{existing ? 'Edit session' : 'New session'}</p>
          <h1>{existing ? 'Edit workout' : 'Log a workout'}</h1>
        </div>
      </header>

      <form className="card form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Workout name</span>
            <input
              placeholder="e.g. Push Day"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="field field-date">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </label>
        </div>

        <div className="ex-editor">
          <div className="ex-editor-head">
            <span>Exercise</span>
            <span>Sets</span>
            <span>Reps</span>
            <span>Weight</span>
            <span />
          </div>
          {form.exercises.map((ex, i) => (
            <div key={ex.id} className="ex-editor-row">
              <input
                aria-label={`Exercise ${i + 1} name`}
                placeholder="Bench Press"
                value={ex.name}
                onChange={(e) => setEx(ex.id, { name: e.target.value })}
              />
              <input
                aria-label="Sets"
                type="number"
                min={0}
                placeholder="3"
                value={ex.sets}
                onChange={(e) => setEx(ex.id, { sets: e.target.value === '' ? '' : Number(e.target.value) })}
              />
              <input
                aria-label="Reps"
                placeholder="10"
                value={ex.reps}
                onChange={(e) => setEx(ex.id, { reps: e.target.value })}
              />
              <input
                aria-label="Weight"
                placeholder="60 kg"
                value={ex.weight}
                onChange={(e) => setEx(ex.id, { weight: e.target.value })}
              />
              <button
                type="button"
                className="icon-btn danger"
                aria-label="Remove exercise"
                onClick={() => setForm((f) => ({ ...f, exercises: f.exercises.filter((x) => x.id !== ex.id) }))}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost add-ex"
            onClick={() => setForm((f) => ({ ...f, exercises: [...f.exercises, blankExercise()] }))}
          >
            <Plus size={16} /> Add exercise
          </button>
        </div>

        <label className="field">
          <span>Notes (optional)</span>
          <textarea
            rows={3}
            placeholder="How did it feel? Any PRs?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>

        <div className="form-actions">
          {existing && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save workout
          </button>
        </div>
      </form>
    </div>
  )
}
