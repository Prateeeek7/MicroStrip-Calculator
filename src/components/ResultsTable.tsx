export interface ResultRow {
  symbol: string
  label: string
  value: string | number
  unit: string
}

interface ResultsTableProps {
  title?: string
  rows: ResultRow[]
}

export function ResultsTable({ title, rows }: ResultsTableProps) {
  return (
    <div className="results-table-wrap">
      {title && <h3 className="results-title">{title}</h3>}
      <table className="results-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol}>
              <td>
                <span className="symbol">{row.symbol}</span>
                {row.label && ` — ${row.label}`}
              </td>
              <td>{typeof row.value === 'number' ? row.value.toFixed(6) : row.value}</td>
              <td>{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
