import type { Exercise } from './types'

/** Weights for sets 1..N, padded with '' (N = number of sets, or the stored length if sets is blank). */
export function setWeightList(e: Exercise): string[] {
  const stored = e.setWeights ?? []
  const n = e.sets === '' ? stored.length : Number(e.sets) || 0
  return Array.from({ length: n }, (_, i) => stored[i] ?? '')
}

/** Text shown in the Weight column: "60 / 65 / 70" for per-set weights, otherwise the single weight. */
export function weightLabel(e: Exercise): string {
  if (e.setWeights) {
    const list = setWeightList(e)
    if (list.some((w) => w.trim())) return list.map((w) => w.trim() || '—').join(' / ')
  }
  return e.weight
}
