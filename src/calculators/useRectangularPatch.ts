import { useState, useCallback } from 'react'
import type { LengthUnit, FrequencyUnit } from '@/lib/units'
import { lengthToSI, lengthFromSI, frequencyToSI, frequencyFromSI } from '@/lib/units'
import { computeRectangularPatch, computeRectangularPatchReverse } from './rectangularPatch'
import type { RectangularPatchResult } from './rectangularPatch'

export type RectangularCalcMode = 'frequency' | 'dimensions'

export interface RectangularPatchState {
  mode: RectangularCalcMode
  frequency: number
  frequencyUnit: FrequencyUnit
  width: number
  length: number
  epsilonR: number
  height: number
  heightUnit: LengthUnit
  /** Optional feed X offset from center in length unit (e.g. mm). Can be negative. */
  feedXOffset: number | null
  /** Optional feed Y offset from center in length unit. Empty = use 50Ω y₀. */
  feedYOffset: number | null
}

const defaultState: RectangularPatchState = {
  mode: 'frequency',
  frequency: 2.4,
  frequencyUnit: 'GHz',
  width: 30,
  length: 24,
  epsilonR: 4.4,
  height: 1.6,
  heightUnit: 'mm',
  feedXOffset: null,
  feedYOffset: null,
}

export function useRectangularPatch() {
  const [state, setState] = useState<RectangularPatchState>(defaultState)
  const [result, setResult] = useState<RectangularPatchResult | null>(null)
  const [computedFrHz, setComputedFrHz] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateState = useCallback(<K extends keyof RectangularPatchState>(
    key: K,
    value: RectangularPatchState[K]
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
      const out = computeRectangularPatch({
        frHz,
        epsilonR: state.epsilonR,
        hM,
      })
      if (!out) {
        setError('Calculation failed (check inputs or numerical limits)')
        setResult(null)
        return
      }
      if (!Number.isFinite(out.G1) || !Number.isFinite(out.G12)) {
        setError('Integrals did not converge')
        setResult(null)
        return
      }
      setResult(out)
      setComputedFrHz(null)
    } else {
      const WM = lengthToSI(state.width, state.heightUnit)
      const LM = lengthToSI(state.length, state.heightUnit)
      if (WM <= 0 || LM <= 0) {
        setError('Invalid input: W > 0, L > 0')
        setResult(null)
        return
      }
      const out = computeRectangularPatchReverse({
        WM,
        LM,
        epsilonR: state.epsilonR,
        hM,
      })
      if (!out) {
        setError('Calculation failed (check dimensions or numerical limits)')
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
