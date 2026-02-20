import { UnitInput, LengthInput } from './UnitInput'
import { FREQUENCY_UNITS, lengthToSI } from '@/lib/units'
import type { FrequencyUnit, LengthUnit } from '@/lib/units'
import { ResultsTable, type ResultRow } from './ResultsTable'
import { PatchViewer } from './PatchViewer'
import { useState } from 'react'
import { useCircularPatch } from '@/calculators/useCircularPatch'

export function CircularCalculator() {
  const [feedExpanded, setFeedExpanded] = useState(false)
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
        ...(state.feedXOffset != null || state.feedYOffset != null
          ? [{
              symbol: 'Feed',
              label: 'Feed offset from center (x, y)',
              value: `${(state.feedXOffset ?? 0).toFixed(3)}, ${(state.feedYOffset ?? 0).toFixed(3)}`,
              unit: lenUnit,
            }]
          : []),
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
        <div className="unit-input feed-optional-wrap">
          <button
            type="button"
            className="feed-toggle"
            onClick={() => setFeedExpanded((e) => !e)}
            aria-expanded={feedExpanded}
          >
            Feed (optional)
          </button>
          {feedExpanded && (
            <>
              <p className="note" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                Feed offset is for the 3D marker only; a, f_r and directivity do not depend on feed position.
              </p>
              <label>
                <span className="label-text">Feed X offset (from center)</span>
                <div className="input-row">
                  <input
                    type="number"
                    step={0.01}
                    placeholder="e.g. -4.23"
                    value={state.feedXOffset ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      updateState('feedXOffset', v === '' ? null : Number(v))
                    }}
                  />
                  <span className="unit-suffix">{state.heightUnit}</span>
                </div>
              </label>
              <label>
                <span className="label-text">Feed Y offset (from center)</span>
                <div className="input-row">
                  <input
                    type="number"
                    step={0.01}
                    placeholder="0 = center"
                    value={state.feedYOffset ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      updateState('feedYOffset', v === '' ? null : Number(v))
                    }}
                  />
                  <span className="unit-suffix">{state.heightUnit}</span>
                </div>
              </label>
            </>
          )}
        </div>
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
            feedXOffsetM={state.feedXOffset != null ? lengthToSI(state.feedXOffset, state.heightUnit) : null}
            feedYOffsetM={state.feedYOffset != null ? lengthToSI(state.feedYOffset, state.heightUnit) : null}
            lengthUnit={lenUnit}
          />
        </>
      )}
    </section>
  )
}
