/**
 * Rectangular microstrip patch antenna design (Balanis Ch. 14.2).
 * All inputs: fr in Hz, er (epsilon_r), h in m. Outputs in SI.
 */

import { C, k0, wavelength } from '@/lib/constants'
import { simpson, simpson2D } from '@/lib/integrate'
import { besselJ0 } from '@/lib/bessel'

export interface RectangularPatchInput {
  frHz: number
  epsilonR: number
  hM: number
}

/** Input for reverse calculation: given W, L → find f_r */
export interface RectangularPatchInputReverse {
  WM: number
  LM: number
  epsilonR: number
  hM: number
}

export interface RectangularPatchResult {
  W: number
  L: number
  L_eff: number
  epsilonReff: number
  G1: number
  G12: number
  RinAtEdge: number
  y0_50ohm: number | null
  directivityD: number
  directivityDBi: number
  lambda0: number
}

function safeBesselJ0(x: number): number {
  const v = besselJ0(x)
  return Number.isFinite(v) ? v : 0
}

/**
 * Effective relative permittivity.
 */
function effectiveEpsilon(epsilonR: number, W: number, h: number): number {
  return (epsilonR + 1) / 2 + ((epsilonR - 1) / 2) * 1 / Math.sqrt(1 + 12 * h / W)
}

/**
 * Compute rectangular patch dimensions and derived quantities.
 */
export function computeRectangularPatch(input: RectangularPatchInput): RectangularPatchResult | null {
  const { frHz, epsilonR, hM } = input
  if (frHz <= 0 || epsilonR < 1 || hM <= 0) return null

  const lambda0 = wavelength(frHz)
  const k0Val = k0(frHz)

  // 1. Width
  const W = (C / (2 * frHz)) * Math.sqrt(2 / (epsilonR + 1))
  const epsilonReff = effectiveEpsilon(epsilonR, W, hM)

  // 2. Length: L = c/(2*fr*sqrt(epsilonReff)) - 0.824*h * (...)
  const num = (epsilonReff + 0.3) * (W / hM + 0.264)
  const den = (epsilonReff - 0.258) * (W / hM + 0.8)
  const L = C / (2 * frHz * Math.sqrt(epsilonReff)) - 0.824 * hM * (num / den)

  // Effective length (half-wave resonant length)
  const L_eff = C / (2 * frHz * Math.sqrt(epsilonReff))

  // 3. Conductance G1: integrand can be singular at cos(theta)=0; use limit
  const eps = 1e-12
  const integrandG1 = (theta: number) => {
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    if (Math.abs(cosT) < eps) {
      const term = (k0Val * W) / 2
      return term * term * Math.pow(sinT, 3)
    }
    const arg = (k0Val * W / 2) * cosT
    return Math.pow(Math.sin(arg) / cosT, 2) * Math.pow(sinT, 3)
  }
  const G1 = (1 / (120 * Math.PI * Math.PI)) * simpson(integrandG1, 0, Math.PI, 512)

  // 4. Conductance G12 with J0
  const integrandG12 = (theta: number) => {
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    const j0Arg = k0Val * L * sinT
    const j0Val = safeBesselJ0(j0Arg)
    if (Math.abs(cosT) < eps) {
      const term = (k0Val * W) / 2
      return term * term * j0Val * Math.pow(sinT, 3)
    }
    const arg = (k0Val * W / 2) * cosT
    return Math.pow(Math.sin(arg) / cosT, 2) * j0Val * Math.pow(sinT, 3)
  }
  const G12 = (1 / (120 * Math.PI * Math.PI)) * simpson(integrandG12, 0, Math.PI, 512)

  const Gsum = G1 + G12
  if (!Number.isFinite(G1) || !Number.isFinite(G12) || Gsum <= 0) return null

  const RinAtEdge = 1 / (2 * Gsum)

  // 5. 50 ohm feed position: Rin(y0) = Rin(0)*cos^2(pi*y0/L) = 50 => y0 = L/pi * acos(sqrt(50/Rin(0)))
  let y0_50ohm: number | null = null
  if (RinAtEdge >= 50 && RinAtEdge < 1e10) {
    const ratio = 50 / RinAtEdge
    if (ratio <= 1 && ratio >= 0) {
      y0_50ohm = (L / Math.PI) * Math.acos(Math.sqrt(ratio))
    }
  }

  // 6. Directivity: I1 double integral, D = (2*pi*W/lambda0)^2 * pi/I1
  const integrandI1 = (theta: number, phi: number) => {
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    let factor: number
    if (Math.abs(cosT) < eps) {
      const term = (k0Val * W) / 2
      factor = term * term
    } else {
      const arg = (k0Val * W / 2) * cosT
      factor = Math.pow(Math.sin(arg) / cosT, 2)
    }
    const inner = (k0Val * L_eff / 2) * sinT * Math.sin(phi)
    return factor * Math.pow(sinT, 3) * Math.pow(Math.cos(inner), 2)
  }
  const I1 = simpson2D(integrandI1, 0, Math.PI, 0, Math.PI, 128, 128)
  if (!Number.isFinite(I1) || I1 <= 0) {
    return {
      W, L, L_eff, epsilonReff, G1, G12, RinAtEdge, y0_50ohm,
      directivityD: NaN,
      directivityDBi: NaN,
      lambda0,
    }
  }
  const D = Math.pow((2 * Math.PI * W) / lambda0, 2) * (Math.PI / I1)
  const directivityDBi = 10 * Math.log10(D)

  return {
    W,
    L,
    L_eff,
    epsilonReff,
    G1,
    G12,
    RinAtEdge,
    y0_50ohm,
    directivityD: D,
    directivityDBi,
    lambda0,
  }
}

/**
 * Reverse calculation: given patch width W and length L (and h, εr), compute resonant frequency f_r (Hz).
 * From L = c/(2*fr*sqrt(ε_reff)) - ΔL  =>  fr = c / (2*sqrt(ε_reff)*(L + ΔL)).
 */
export function computeRectangularPatchReverse(input: RectangularPatchInputReverse): { frHz: number; result: RectangularPatchResult } | null {
  const { WM, LM, epsilonR, hM } = input
  if (WM <= 0 || LM <= 0 || epsilonR < 1 || hM <= 0) return null

  const epsilonReff = effectiveEpsilon(epsilonR, WM, hM)
  const num = (epsilonReff + 0.3) * (WM / hM + 0.264)
  const den = (epsilonReff - 0.258) * (WM / hM + 0.8)
  const deltaL = 0.824 * hM * (num / den)
  const frHz = C / (2 * Math.sqrt(epsilonReff) * (LM + deltaL))
  if (!Number.isFinite(frHz) || frHz <= 0) return null

  const forward = computeRectangularPatch({ frHz, epsilonR, hM })
  if (!forward) return null
  return { frHz, result: forward }
}
