import type { StatusKategorii } from '../types'

export const STATUS_STYLE: Record<StatusKategorii, { tekst: string; tlo: string; ikona: string }> = {
  strata: { tekst: 'text-red-700', tlo: 'bg-red-100', ikona: '🔴' },
  niska_marza: { tekst: 'text-amber-600', tlo: 'bg-amber-100', ikona: '🟡' },
  zdrowy: { tekst: 'text-emerald-700', tlo: 'bg-emerald-100', ikona: '🟢' },
}
