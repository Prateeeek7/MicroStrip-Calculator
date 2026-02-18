import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RectangularCalculator } from '@/components/RectangularCalculator'
import { CircularCalculator } from '@/components/CircularCalculator'
import { AppFooter } from '@/components/AppFooter'
import { DocumentationPage } from '@/pages/DocumentationPage'

type Tab = 'rectangular' | 'circular'

function CalculatorApp() {
  const [tab, setTab] = useState<Tab>('rectangular')

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-brand">
          <img src="/MPAC.png" alt="MPAC" className="app-logo" />
          <h1 className="app-title">Microstrip Patch Antenna Calculator</h1>
        </div>
      </header>
      <main className="app-main">
        <nav className="patch-type-tabs" aria-label="Patch type">
          <button
            type="button"
            className={tab === 'rectangular' ? 'tab active' : 'tab'}
            onClick={() => setTab('rectangular')}
          >
            Rectangular Patch
          </button>
          <button
            type="button"
            className={tab === 'circular' ? 'tab active' : 'tab'}
            onClick={() => setTab('circular')}
          >
            Circular Patch
          </button>
        </nav>
        <div className="dashboard-panel">
          {tab === 'rectangular' && <RectangularCalculator />}
          {tab === 'circular' && <CircularCalculator />}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/*" element={<CalculatorApp />} />
    </Routes>
  )
}
