/**
 * Unit conversion for frequency and length.
 * Internal SI: frequency in Hz, length in meters.
 */

export type FrequencyUnit = 'GHz' | 'MHz' | 'kHz' | 'Hz'
export type LengthUnit = 'mm' | 'cm' | 'm' | 'mil' | 'inch'

const LENGTH_TO_M: Record<LengthUnit, number> = {
  mm: 1e-3,
  cm: 1e-2,
  m: 1,
  mil: 25.4e-6,
  inch: 0.0254,
}

const FREQ_TO_HZ: Record<FrequencyUnit, number> = {
  GHz: 1e9,
  MHz: 1e6,
  kHz: 1e3,
  Hz: 1,
}

/** Convert length value from given unit to meters (SI). */
export function lengthToSI(value: number, unit: LengthUnit): number {
  return value * LENGTH_TO_M[unit]
}

/** Convert length in meters to display value in given unit. */
export function lengthFromSI(valueM: number, unit: LengthUnit): number {
  if (valueM === 0) return 0
  return valueM / LENGTH_TO_M[unit]
}

/** Convert frequency value from given unit to Hz (SI). */
export function frequencyToSI(value: number, unit: FrequencyUnit): number {
  return value * FREQ_TO_HZ[unit]
}

/** Convert frequency in Hz to display value in given unit. */
export function frequencyFromSI(valueHz: number, unit: FrequencyUnit): number {
  if (valueHz === 0) return 0
  return valueHz / FREQ_TO_HZ[unit]
}

export const FREQUENCY_UNITS: FrequencyUnit[] = ['GHz', 'MHz', 'kHz', 'Hz']
export const LENGTH_UNITS: LengthUnit[] = ['mm', 'cm', 'm', 'mil', 'inch']
