import { UnitInput, LengthInput } from './UnitInput'
import { FREQUENCY_UNITS, lengthToSI } from '@/lib/units'
import type { FrequencyUnit, LengthUnit } from '@/lib/units'
import { ResultsTable, type ResultRow } from './ResultsTable'
import { PatchViewer } from './PatchViewer'
import { useRectangularPatch } from '@/calculators/useRectangularPatch'

export function RectangularCalculator() {
  const {
    state,
    updateState,
    result,
    computedFrHz,
    error,
    calculate,
    getLengthInUnit,
    getFrequencyInUnit,
  } = useRectangularPatch()
  const lenUnit = state.heightUnit

  const rows: ResultRow[] = result
    ? [
        ...(computedFrHz != null
          ? [
              {
                symbol: 'f_r',
                label: 'Resonant frequency',
                value: getFrequencyInUnit(computedFrHz, state.frequencyUnit),
                unit: state.frequencyUnit,
              },
            ]
          : []),
        { symbol: 'W', label: 'Patch width', value: getLengthInUnit(result.W, lenUnit), unit: lenUnit },
        { symbol: 'L', label: 'Patch length', value: getLengthInUnit(result.L, lenUnit), unit: lenUnit },
        { symbol: 'L_eff', label: 'Effective length', value: getLengthInUnit(result.L_eff, lenUnit), unit: lenUnit },
        { symbol: 'R_in', label: 'Input impedance at edge (y=0)', value: result.RinAtEdge.toFixed(4), unit: 'Ω' },
        {
          symbol: 'y_0',
          label: '50 Ω feed position',
          value: result.y0_50ohm != null ? getLengthInUnit(result.y0_50ohm, lenUnit) : 'N/A',
          unit: result.y0_50ohm != null ? lenUnit : '—',
        },
        { symbol: 'G_1', label: 'Single slot conductance', value: result.G1.toExponential(6), unit: 'S' },
        { symbol: 'G_12', label: 'Mutual conductance', value: result.G12.toExponential(6), unit: 'S' },
        { symbol: 'D', label: 'Directivity', value: result.directivityDBi.toFixed(4), unit: 'dBi' },
      ]
    : []

  return (
    <section className="calculator-section">
      <h2>Rectangular Microstrip Patch Antenna</h2>

      <div className="mode-toggle">
        <label className="mode-label">
          <input
            type="radio"
            name="rect-mode"
            checked={state.mode === 'frequency'}
            onChange={() => updateState('mode', 'frequency')}
          />
          <span>Given frequency → find W, L</span>
        </label>
        <label className="mode-label">
          <input
            type="radio"
            name="rect-mode"
            checked={state.mode === 'dimensions'}
            onChange={() => updateState('mode', 'dimensions')}
          />
          <span>Given W, L → find resonant frequency</span>
        </label>
      </div>

      <div className="input-panel">
        {state.mode === 'frequency' ? (
          <UnitInput
            label="Resonant frequency f_r"
            value={state.frequency}
            unit={state.frequencyUnit}
            onValueChange={(v) => updateState('frequency', v)}
            onUnitChange={(u) => updateState('frequencyUnit', u as FrequencyUnit)}
            unitOptions={FREQUENCY_UNITS}
          />
        ) : (
          <>
            <LengthInput
              label="Patch width W"
              value={state.width}
              unit={state.heightUnit}
              onValueChange={(v) => updateState('width', v)}
              onUnitChange={(u) => updateState('heightUnit', u as LengthUnit)}
            />
            <LengthInput
              label="Patch length L"
              value={state.length}
              unit={state.heightUnit}
              onValueChange={(v) => updateState('length', v)}
              onUnitChange={(u) => updateState('heightUnit', u as LengthUnit)}
            />
          </>
        )}
        <div className="unit-input">
          <label>
            <span className="label-text">Substrate relative permittivity ε_r</span>
            <input
              type="number"
              value={state.epsilonR}
              onChange={(e) => updateState('epsilonR', Number(e.target.value))}
              min={1}
              step={0.1}
            />
          </label>
        </div>
        <LengthInput
          label="Substrate height h"
          value={state.height}
          unit={state.heightUnit}
          onValueChange={(v) => updateState('height', v)}
          onUnitChange={(u) => updateState('heightUnit', u as LengthUnit)}
        />
        <button type="button" className="primary" onClick={calculate}>
          Calculate
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <ResultsTable title="Output" rows={rows} />
          <PatchViewer
            type="rectangular"
            W={result.W}
            L={result.L}
            h={lengthToSI(state.height, state.heightUnit)}
            y0={result.y0_50ohm}
            lengthUnit={lenUnit}
          />
        </>
      )}
    </section>
  )
}
