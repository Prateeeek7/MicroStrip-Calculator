/**
 * Circular microstrip patch antenna design (Balanis Ch. 14.3).
 * All inputs: fr in Hz, er (epsilon_r), h in m. Outputs in SI.
 */

import { k0, wavelength } from '@/lib/constants'
import { simpson } from '@/lib/integrate'
import { besselJ0, besselJ2 } from '@/lib/bessel'

export interface CircularPatchInput {
  frHz: number
  epsilonR: number
  hM: number
}

/** Input for reverse calculation: given radius a → find f_r */
export interface CircularPatchInputReverse {
  aM: number
  epsilonR: number
  hM: number
}

export interface CircularPatchResult {
  a: number
  a_e: number
  directivityD: number
  directivityDBi: number
  lambda0: number
}

function safeBesselJ0(x: number): number {
  const v = besselJ0(x)
  return Number.isFinite(v) ? v : 0
}

function safeBesselJ2(x: number): number {
  const v = besselJ2(x)
  return Number.isFinite(v) ? v : 0
}

/**
 * F = chi_11*c/(2*pi) / (fr * sqrt(epsilon_r)); chi_11 ≈ 1.841 (first zero of J1' for TM110).
 * With fr in Hz -> F in m. Constant 8.791e7 ≈ chi_11*c/(2*pi) (8.785e7).
 */
function F(frHz: number, epsilonR: number): number {
  return (8.791e7) / (frHz * Math.sqrt(epsilonR))
}

/**
 * Physical radius a (m).
 */
function physicalRadius(FVal: number, h: number, epsilonR: number): number {
  const lnArg = (Math.PI * FVal) / (2 * h) + 1.7726
  const den = 1 + (2 * h) / (Math.PI * epsilonR * FVal) * Math.log(lnArg)
  return FVal / Math.sqrt(den)
}

/**
 * Effective radius a_e (m).
 */
function effectiveRadius(a: number, h: number, epsilonR: number): number {
  const lnArg = (Math.PI * a) / (2 * h) + 1.7726
  const factor = 1 + (2 * h) / (Math.PI * a * epsilonR) * Math.log(lnArg)
  return a * Math.sqrt(factor)
}

/**
 * Radiating conductance G_rad: integral 0 to pi/2 of [J02'^2 + cos^2(theta)*J02^2]*sin(theta) d(theta).
 * J02' = J0(k0*a_e*sin(theta)) - J2(k0*a_e*sin(theta))
 * J02  = J0(k0*a_e*sin(theta)) + J2(k0*a_e*sin(theta))  (for the second term, Balanis uses cos^2*J02^2; often J02 is same as J02' for dominant mode - check). 
 * Reference: D0 = (k0*a_e)^2 / (120*G_rad). So G_rad = (k0*a_e)^2/(480) * integral...
 * From vinoth: G_rad = (k0*a_e)^2/480 * integral_0^(pi/2) [J02'^2 + cos^2(theta)*J02^2] sin(theta) d(theta)
 * So integrand = [J02'^2 + cos^2*J02^2]*sin(theta), then G_rad = (k0*a_e)^2/480 * I.
 */
export function computeCircularPatch(input: CircularPatchInput): CircularPatchResult | null {
  const { frHz, epsilonR, hM } = input
  if (frHz <= 0 || epsilonR < 1 || hM <= 0) return null

  const lambda0 = wavelength(frHz)
  const k0Val = k0(frHz)

  const FVal = F(frHz, epsilonR)
  const a = physicalRadius(FVal, hM, epsilonR)
  const a_e = effectiveRadius(a, hM, epsilonR)

  // G_rad integral
  const integrand = (theta: number) => {
    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)
    const x = k0Val * a_e * sinT
    const J02p = safeBesselJ0(x) - safeBesselJ2(x)
    const J02 = safeBesselJ0(x) + safeBesselJ2(x)
    return (J02p * J02p + cosT * cosT * J02 * J02) * sinT
  }
  const integral = simpson(integrand, 0, Math.PI / 2, 512)
  const G_rad = ((k0Val * a_e) ** 2 / 480) * integral

  if (!Number.isFinite(G_rad) || G_rad <= 0) {
    return {
      a,
      a_e,
      directivityD: NaN,
      directivityDBi: NaN,
      lambda0,
    }
  }

  const D0 = (k0Val * a_e) ** 2 / (120 * G_rad)
  const directivityDBi = 10 * Math.log10(D0)

  return {
    a,
    a_e,
    directivityD: D0,
    directivityDBi,
    lambda0,
  }
}

/**
 * Reverse calculation: given physical radius a (m), find resonant frequency f_r (Hz).
 * Solve physicalRadius(F, h, εr) = a for F, then fr = 8.791e7/(F*sqrt(εr)).
 * Use bisection on F (physicalRadius is monotonic in F).
 */
export function computeCircularPatchReverse(input: CircularPatchInputReverse): { frHz: number; result: CircularPatchResult } | null {
  const { aM, epsilonR, hM } = input
  if (aM <= 0 || epsilonR < 1 || hM <= 0) return null

  // F in m: for fr 1e9–10e9, F = 8.791e7/(fr*sqrt(er)) ≈ 3e-3–3e-2 m for er~4
  let FLow = 1e-5
  let FHigh = 0.1
  // Ensure physicalRadius(FLow) < aM < physicalRadius(FHigh)
  while (physicalRadius(FLow, hM, epsilonR) >= aM && FLow > 1e-7) FLow *= 0.5
  while (physicalRadius(FHigh, hM, epsilonR) <= aM && FHigh < 0.5) FHigh *= 2
  if (physicalRadius(FLow, hM, epsilonR) > aM || physicalRadius(FHigh, hM, epsilonR) < aM) return null

  for (let i = 0; i < 80; i++) {
    const FMid = (FLow + FHigh) / 2
    const aMid = physicalRadius(FMid, hM, epsilonR)
    if (Math.abs(aMid - aM) < 1e-12 * aM) {
      const frHz = (8.791e7) / (FMid * Math.sqrt(epsilonR))
      const result = computeCircularPatch({ frHz, epsilonR, hM })
      if (!result) return null
      return { frHz, result }
    }
    if (aMid < aM) FLow = FMid
    else FHigh = FMid
  }
  const frHz = (8.791e7) / (((FLow + FHigh) / 2) * Math.sqrt(epsilonR))
  const result = computeCircularPatch({ frHz, epsilonR, hM })
  if (!result) return null
  return { frHz, result }
}
