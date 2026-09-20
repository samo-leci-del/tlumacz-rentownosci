import { useMemo, useState } from 'react'
import { ErrorState } from './components/ErrorState'
import { FileUpload } from './components/FileUpload'
import { ProductReport } from './components/ProductReport'
import { SummaryCards } from './components/SummaryCards'
import { parseCsv } from './lib/csvParser'
import { analizujWszystkie } from './lib/profitability'
import type { ParseError, SalesRow } from './types'

type Widok =
  | { typ: 'start' }
  | { typ: 'blad'; errors: ParseError[] }
  | { typ: 'raport'; rows: SalesRow[]; ostrzezenia: ParseError[] }

function App() {
  const [widok, setWidok] = useState<Widok>({ typ: 'start' })

  const analizy = useMemo(
    () => (widok.typ === 'raport' ? analizujWszystkie(widok.rows) : []),
    [widok],
  )

  const wczytajPlik = (tekst: string) => {
    const { rows, errors } = parseCsv(tekst)
    if (rows.length === 0) {
      setWidok({ typ: 'blad', errors })
      return
    }
    setWidok({ typ: 'raport', rows, ostrzezenia: errors })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-xl font-semibold text-slate-900">Tłumacz rentowności</h1>
          <p className="text-sm text-slate-500">
            Zamień eksport sprzedaży na konkretną rekomendację — co traci pieniądze, co podnieść
            w cenie, co wycofać.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {widok.typ === 'start' && (
          <div className="flex flex-col items-center gap-6 py-10">
            <FileUpload onFileLoaded={wczytajPlik} />
          </div>
        )}

        {widok.typ === 'blad' && (
          <div className="flex flex-col items-center gap-6 py-10">
            <ErrorState errors={widok.errors} onReset={() => setWidok({ typ: 'start' })} />
          </div>
        )}

        {widok.typ === 'raport' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Przeanalizowano {widok.rows.length} pozycji sprzedażowych
              </p>
              <button
                onClick={() => setWidok({ typ: 'start' })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Wgraj inny plik
              </button>
            </div>

            {widok.ostrzezenia.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">
                  Pominięto {widok.ostrzezenia.length}{' '}
                  {widok.ostrzezenia.length === 1 ? 'wiersz' : 'wierszy'} z błędami:
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {widok.ostrzezenia.map((e, i) => (
                    <li key={i}>{e.komunikat}</li>
                  ))}
                </ul>
              </div>
            )}

            <SummaryCards analizy={analizy} />
            <ProductReport analizy={analizy} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
