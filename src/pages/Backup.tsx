import { useRef, useState } from 'react'
import { CheckCircle2, Download, FileUp, AlertTriangle } from 'lucide-react'
import { countDays, useWorkouts } from '../lib/store'
import { downloadBackup, readBackup } from '../lib/backup'
import { fmt, fromISO } from '../lib/dates'
import type { Workout } from '../lib/types'

const LAST_BACKUP_KEY = 'ironlog.lastBackup'

function getLastBackup(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}

function dateRange(ws: Workout[]): string {
  if (!ws.length) return '—'
  const sorted = ws.map((w) => w.date).sort()
  return `${fmt.dayMonth(fromISO(sorted[0]))} ${sorted[0].slice(0, 4)} – ${fmt.dayMonth(fromISO(sorted[sorted.length - 1]))} ${sorted[sorted.length - 1].slice(0, 4)}`
}

interface Pending {
  fileName: string
  workouts: Workout[]
  exportedAt?: string
  skipped: number
}

export default function Backup() {
  const { workouts, importAll } = useWorkouts()
  const fileInput = useRef<HTMLInputElement>(null)
  const [lastBackup, setLastBackup] = useState(getLastBackup)
  const [pending, setPending] = useState<Pending | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const onExport = () => {
    downloadBackup(workouts)
    const now = new Date().toISOString()
    try {
      localStorage.setItem(LAST_BACKUP_KEY, now)
    } catch {
      /* ignore */
    }
    setLastBackup(now)
  }

  const onFile = async (file: File | undefined) => {
    setError('')
    setDone('')
    setPending(null)
    if (!file) return
    try {
      const res = await readBackup(file)
      setPending({ fileName: file.name, ...res })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onRestore = (mode: 'replace' | 'merge') => {
    if (!pending) return
    if (mode === 'replace' && workouts.length > 0 && !confirm(`Replace your current ${workouts.length} workouts with the backup?`))
      return
    importAll(pending.workouts, mode)
    setDone(
      mode === 'replace'
        ? `Restored ${pending.workouts.length} workouts.`
        : `Merged ${pending.workouts.length} workouts into your log.`,
    )
    setPending(null)
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <div>
          <p className="eyebrow">Your data</p>
          <h1>Backup &amp; Restore</h1>
        </div>
      </header>

      <p className="lead">
        Your workouts are saved only in this browser. Download a backup file and keep it somewhere safe, like Google
        Drive, email or a USB stick. You can restore it in any browser or on any device.
      </p>

      <section className="card backup-card">
        <span className="stat-icon orange"><Download size={20} /></span>
        <div className="backup-body">
          <h2 className="card-title">Back up</h2>
          <dl className="kv">
            <dt>Workouts</dt>
            <dd>{workouts.length} ({countDays(workouts)} gym days)</dd>
            <dt>Range</dt>
            <dd>{dateRange(workouts)}</dd>
            <dt>Last backup</dt>
            <dd>{lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}</dd>
          </dl>
          <button className="btn btn-primary" onClick={onExport} disabled={!workouts.length}>
            <Download size={16} /> Download backup
          </button>
        </div>
      </section>

      <section className="card backup-card">
        <span className="stat-icon blue"><FileUp size={20} /></span>
        <div className="backup-body">
          <h2 className="card-title">Restore</h2>
          <p className="muted-text">Choose a backup file (.json) you downloaded before.</p>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button className="btn btn-ghost" onClick={() => fileInput.current?.click()}>
            <FileUp size={16} /> Choose backup file
          </button>

          {error && (
            <div className="alert error">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          {done && (
            <div className="alert success">
              <CheckCircle2 size={16} /> {done}
            </div>
          )}

          {pending && (
            <div className="restore-preview">
              <dl className="kv">
                <dt>File</dt>
                <dd>{pending.fileName}</dd>
                {pending.exportedAt && (
                  <>
                    <dt>Created</dt>
                    <dd>{new Date(pending.exportedAt).toLocaleString()}</dd>
                  </>
                )}
                <dt>Workouts</dt>
                <dd>
                  {pending.workouts.length} ({countDays(pending.workouts)} gym days)
                  {pending.skipped > 0 && <span className="muted-text"> · {pending.skipped} invalid skipped</span>}
                </dd>
                <dt>Range</dt>
                <dd>{dateRange(pending.workouts)}</dd>
              </dl>
              <div className="restore-actions">
                <button className="btn btn-primary" onClick={() => onRestore('replace')}>
                  Replace current data
                </button>
                <button className="btn btn-ghost" onClick={() => onRestore('merge')}>
                  Merge with current data
                </button>
                <button className="btn btn-ghost" onClick={() => setPending(null)}>
                  Cancel
                </button>
              </div>
              <p className="hint">
                <strong>Replace</strong> makes this browser match the backup exactly. Use it on a new browser.{' '}
                <strong>Merge</strong> keeps what's here and adds the backup's workouts. Workouts that appear in both
                are overwritten by the backup version.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
