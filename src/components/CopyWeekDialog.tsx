import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'
import { countDays, useWorkouts } from '../lib/store'
import { cloneWorkout } from '../lib/copy'
import { addDays, fmt, fromISO, toISO } from '../lib/dates'

const inWeek = (iso: string, start: Date) => iso >= toISO(start) && iso <= toISO(addDays(start, 6))
const rangeLabel = (start: Date) => `${fmt.dayMonth(start)} – ${fmt.dayMonth(addDays(start, 6))}`

/** Copy every workout of one week onto another week, keeping the same weekdays. */
export default function CopyWeekDialog({ sourceStart, onClose }: { sourceStart: Date; onClose: () => void }) {
  const { workouts, applyChanges } = useWorkouts()
  const [targetStart, setTargetStart] = useState(() => addDays(sourceStart, 7))
  const [mode, setMode] = useState<'add' | 'replace'>('add')
  const [result, setResult] = useState<string | null>(null)

  const source = workouts.filter((w) => inWeek(w.date, sourceStart))
  const existing = workouts.filter((w) => inWeek(w.date, targetStart))
  const sameWeek = toISO(targetStart) === toISO(sourceStart)
  const offsetDays = Math.round((targetStart.getTime() - sourceStart.getTime()) / 86_400_000)

  const paste = () => {
    const copies = source.map((w) => cloneWorkout(w, toISO(addDays(fromISO(w.date), offsetDays))))
    applyChanges(copies, mode === 'replace' ? existing.map((w) => w.id) : [])
    setResult(
      `Copied ${copies.length} ${copies.length === 1 ? 'workout' : 'workouts'} to ${rangeLabel(targetStart)}` +
        (mode === 'replace' && existing.length ? ` (replaced ${existing.length}).` : '.'),
    )
  }

  if (result) {
    return (
      <Modal title="Copy week" onClose={onClose}>
        <div className="alert success"><CheckCircle2 size={16} /> {result}</div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Copy week to…" onClose={onClose}>
      <dl className="kv">
        <dt>From</dt>
        <dd>
          {rangeLabel(sourceStart)} · {source.length} {source.length === 1 ? 'workout' : 'workouts'} ({countDays(source)} gym days)
        </dd>
      </dl>

      <div className="picker-nav">
        <button className="icon-btn" onClick={() => setTargetStart(addDays(targetStart, -7))} aria-label="Previous week">
          <ChevronLeft size={16} />
        </button>
        <span>
          <span className="muted-text">To </span>
          <strong>{rangeLabel(targetStart)}</strong>
        </span>
        <button className="icon-btn" onClick={() => setTargetStart(addDays(targetStart, 7))} aria-label="Next week">
          <ChevronRight size={16} />
        </button>
      </div>

      {sameWeek && <div className="alert error">Choose a different week from the one you're copying.</div>}
      {!source.length && <div className="alert error">There are no workouts in this week to copy.</div>}

      {!sameWeek && existing.length > 0 && (
        <fieldset className="mode">
          <legend>
            The target week already has {existing.length} {existing.length === 1 ? 'workout' : 'workouts'}:
          </legend>
          <label>
            <input type="radio" checked={mode === 'add'} onChange={() => setMode('add')} />
            Keep them and add the copied workouts
          </label>
          <label>
            <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
            Replace them with the copied workouts
          </label>
        </fieldset>
      )}

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={sameWeek || !source.length} onClick={paste}>
          Paste week
        </button>
      </div>
    </Modal>
  )
}
