import type { ParseError } from '../types'

interface ErrorStateProps {
  errors: ParseError[]
  onReset: () => void
}

export function ErrorState({ errors, onReset }: ErrorStateProps) {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-red-50 p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-red-700">
        Nie udało się wczytać pliku
      </h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {errors.map((e, i) => (
          <li key={i}>• {e.komunikat}</li>
        ))}
      </ul>
      <button
        onClick={onReset}
        className="mt-6 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Spróbuj z innym plikiem
      </button>
    </div>
  )
}
