import { useCallback, useState } from 'react'

interface FileUploadProps {
  onFileLoaded: (tekst: string) => void
}

export function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [przeciagane, setPrzeciagane] = useState(false)

  const wczytajPlik = useCallback(
    (plik: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') onFileLoaded(reader.result)
      }
      reader.readAsText(plik, 'utf-8')
    },
    [onFileLoaded],
  )

  return (
    <div className="w-full max-w-xl">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setPrzeciagane(true)
        }}
        onDragLeave={() => setPrzeciagane(false)}
        onDrop={(e) => {
          e.preventDefault()
          setPrzeciagane(false)
          const plik = e.dataTransfer.files[0]
          if (plik) wczytajPlik(plik)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors ${
          przeciagane
            ? 'border-accent bg-accent/5'
            : 'border-ink-faint bg-paper shadow-sm hover:border-ink-muted'
        }`}
      >
        <svg
          className="h-10 w-10 text-ink-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <p className="text-base font-medium text-ink">
          Przeciągnij tu plik CSV albo kliknij, żeby go wybrać
        </p>
        <p className="text-sm text-ink-faint">
          Eksport sprzedaży z Allegro, Empiku, Amazona lub Erli
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const plik = e.target.files?.[0]
            if (plik) wczytajPlik(plik)
          }}
        />
      </label>
      <p className="mt-4 text-center text-sm text-ink-faint">
        Nie masz jeszcze pliku?{' '}
        <a
          href="/przykladowe-dane-sprzedazowe.csv"
          download
          className="font-medium text-accent underline underline-offset-2 hover:text-ink"
        >
          Pobierz przykładowy plik
        </a>{' '}
        i zobacz, jak to działa.
      </p>
    </div>
  )
}
