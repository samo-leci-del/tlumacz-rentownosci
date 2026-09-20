const formatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPLN(kwota: number): string {
  return `${formatter.format(kwota)} zł`
}
