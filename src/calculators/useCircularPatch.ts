import { useState, useCallback } from 'react'
import type { LengthUnit, FrequencyUnit } from '@/lib/units'
import { lengthToSI, lengthFromSI, frequencyToSI, frequencyFromSI } from '@/lib/units'
import { computeCircularPatch, computeCircularPatchReverse } from './circularPatch'
import type { CircularPatchResult } from './circularPatch'

export type CircularCalcMode = 'frequency' | 'dimensions'

export interface CircularPatchState {
  mode: CircularCalcMode
  frequency: number
  frequencyUnit: FrequencyUnit
  radius: number
  epsilonR: number
  height: number
  heightUnit: LengthUnit
  /** Optional feed X offset from center in length unit (e.g. mm). Can be negative. */
  feedXOffset: number | null
  /** Optional feed Y offset from center in length unit. */
  feedYOffset: number | null
}

const defaultState: CircularPatchState = {
  mode: 'frequency',
  frequency: 2.4,
  frequencyUnit: 'GHz',
  radius: 14,
  epsilonR: 4.4,
  height: 1.6,
  heightUnit: 'mm',
  feedXOffset: null,
  feedYOffset: null,
}

export function useCircularPatch() {
  const [state, setState] = useState<CircularPatchState>(defaultState)
  const [result, setResult] = useState<CircularPatchResult | null>(null)
  const [computedFrHz, setComputedFrHz] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateState = useCallback(<K extends keyof CircularPatchState>(
    key: K,
    value: CircularPatchState[K]
  ) => {
    setState((s) => ({ ...s, [key]: value }))
    setError(null)
  }, [])

  const calculate = useCallback(() => {
    setError(null)
    setComputedFrHz(null)
    const hM = lengthToSI(state.height, state.heightUnit)
    if (state.epsilonR < 1 || hM <= 0) {
      setError('Invalid input: ε_r ≥ 1, h > 0')
      setResult(null)
      return
    }

    if (state.mode === 'frequency') {
      const frHz = frequencyToSI(state.frequency, state.frequencyUnit)
      if (frHz <= 0) {
        setError('Invalid input: f_r > 0')
        setResult(null)
        return
      }
      const out = computeCircularPatch({
        frHz,
        epsilonR: state.epsilonR,
        hM,
      })
      if (!out) {
        setError('Calculation failed (check inputs or numerical limits)')
        setResult(null)
        return
      }
      if (!Number.isFinite(out.directivityD)) {
        setError('Directivity integral did not converge')
        setResult(null)
        return
      }
      setResult(out)
      setComputedFrHz(null)
    } else {
      const aM = lengthToSI(state.radius, state.heightUnit)
      if (aM <= 0) {
        setError('Invalid input: radius a > 0')
        setResult(null)
        return
      }
      const out = computeCircularPatchReverse({
        aM,
        epsilonR: state.epsilonR,
        hM,
      })
      if (!out) {
        setError('Calculation failed (check radius or numerical limits)')
        setResult(null)
        return
      }
      setResult(out.result)
      setComputedFrHz(out.frHz)
    }
  }, [state])

  const getLengthInUnit = (valueM: number, unit: LengthUnit) =>
    lengthFromSI(valueM, unit)

  const getFrequencyInUnit = (valueHz: number, unit: FrequencyUnit) =>
    frequencyFromSI(valueHz, unit)

  return {
    state,
    updateState,
    result,
    computedFrHz,
    error,
    calculate,
    getLengthInUnit,
    getFrequencyInUnit,
  }
}
