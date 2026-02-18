import { UnitInput, LengthInput } from './UnitInput'
import { FREQUENCY_UNITS, lengthToSI } from '@/lib/units'
import type { FrequencyUnit, LengthUnit } from '@/lib/units'
import { ResultsTable, type ResultRow } from './ResultsTable'
import { PatchViewer } from './PatchViewer'
import { useCircularPatch } from '@/calculators/useCircularPatch'

export function CircularCalculator() {
  const {
    state,
    updateState,
    result,
    computedFrHz,
    error,
    calculate,
    getLengthInUnit,
    getFrequencyInUnit,
  } = useCircularPatch()
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
        { symbol: 'a', label: 'Patch physical radius', value: getLengthInUnit(result.a, lenUnit), unit: lenUnit },
        { symbol: 'a_e', label: 'Effective radius', value: getLengthInUnit(result.a_e, lenUnit), unit: lenUnit },
        { symbol: 'D_0', label: 'Directivity', value: result.directivityDBi.toFixed(4), unit: 'dBi' },
      ]
    : []

  return (
    <section className="calculator-section">
      <h2>Circular Microstrip Patch Antenna</h2>

      <div className="mode-toggle">
        <label className="mode-label">
          <input
            type="radio"
            name="circ-mode"
            checked={state.mode === 'frequency'}
            onChange={() => updateState('mode', 'frequency')}
          />
          <span>Given frequency → find radius a</span>
        </label>
        <label className="mode-label">
          <input
            type="radio"
            name="circ-mode"
            checked={state.mode === 'dimensions'}
            onChange={() => updateState('mode', 'dimensions')}
          />
          <span>Given radius a → find resonant frequency</span>
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
          <LengthInput
            label="Patch physical radius a"
            value={state.radius}
            unit={state.heightUnit}
            onValueChange={(v) => updateState('radius', v)}
            onUnitChange={(u) => updateState('heightUnit', u as LengthUnit)}
          />
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
            type="circular"
            a={result.a}
            a_e={result.a_e}
            h={lengthToSI(state.height, state.heightUnit)}
            lengthUnit={lenUnit}
          />
        </>
      )}
    </section>
  )
}
