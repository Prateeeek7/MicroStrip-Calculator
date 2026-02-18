/**
 * Physical constants for antenna calculations.
 * All in SI: c in m/s, wavelengths in m.
 */

/** Speed of light in m/s */
export const C = 299792458

/** Free-space wavelength (m) for a given frequency (Hz). */
export function wavelength(frHz: number): number {
  return C / frHz
}

/** Free-space wave number k0 = 2*pi/lambda0 (1/m). */
export function k0(frHz: number): number {
  return (2 * Math.PI * frHz) / C
}
