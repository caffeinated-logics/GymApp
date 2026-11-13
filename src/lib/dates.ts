// Date helpers. All dates are handled as local-time ISO strings (YYYY-MM-DD).

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Monday-based start of week */
export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (r.getDay() + 6) % 7 // Mon=0 … Sun=6
  return addDays(r, -dow)
}

export function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isSameMonth(iso: string, ref: Date): boolean {
  const d = fromISO(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function inRange(iso: string, start: Date, endExclusive: Date): boolean {
  const d = fromISO(iso)
  return d >= start && d < endExclusive
}

export const fmt = {
  weekday: (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short' }),
  dayMonth: (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  long: (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
  monthYear: (d: Date) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
}
