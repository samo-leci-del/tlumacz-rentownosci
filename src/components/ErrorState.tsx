import type { ParseError } from '../types'

interface ErrorStateProps {
  errors: ParseError[]
  onReset: () => void
}

export function ErrorState({ errors, onReset }: ErrorStateProps) {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-accent/10 p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-accent">
        Nie udało się wczytać pliku
      </h2>
      <ul className="mt-4 space-y-2 text-sm text-ink">
        {errors.map((e, i) => (
          <li key={i}>• {e.komunikat}</li>
        ))}
      </ul>
      <button
        onClick={onReset}
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper hover:opacity-90"
      >
        Spróbuj z innym plikiem
      </button>
    </div>
  )
}
