import type { Platform } from '../types'

/**
 * Uproszczone stawki prowizji — jedna reprezentatywna wartość per platforma
 * zamiast pełnej tabeli kategorii (świadome uproszczenie MVP).
 * Realne widełki (2026): Allegro 1–17% + ~1,2% opłaty transakcyjnej,
 * Empik Place 2,5–15,5%, Amazon.pl 5–15%, Erli 5–10% (do ~15% w części kategorii).
 * Wartości poniżej to środek widełek — do skorygowania, gdy klient zna swoją kategorię.
 */
export const STAWKI_PROWIZJI: Record<Platform, number> = {
  Allegro: 0.12,
  Empik: 0.09,
  Amazon: 0.1,
  Erli: 0.08,
}
