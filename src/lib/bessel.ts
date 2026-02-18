/**
 * Bessel function of the first kind J_n(x) via series expansion.
 * J_n(x) = sum_{k=0}^inf (-1)^k / (k! (n+k)!) * (x/2)^(n+2k)
 */

function factorial(k: number): number {
  if (k < 0) return NaN
  if (k === 0 || k === 1) return 1
  let f = 1
  for (let i = 2; i <= k; i++) f *= i
  return f
}

/** Bessel J_n(x) for integer n. */
export function besselJ(n: number, x: number): number {
  if (!Number.isFinite(x)) return NaN
  if (n < 0 || n !== Math.floor(n)) return NaN
  const x2 = x / 2
  let sum = 0
  let term = Math.pow(x2, n) / (factorial(n) * factorial(n))
  if (n === 0) term = 1
  if (!Number.isFinite(term)) return 0
  for (let k = 0; k < 120; k++) {
    sum += term
    term *= (-1 * (x2 * x2)) / ((k + 1) * (n + k + 1))
    if (Math.abs(term) < 1e-16 * Math.abs(sum)) break
  }
  return sum
}

export function besselJ0(x: number): number {
  return besselJ(0, x)
}

export function besselJ2(x: number): number {
  return besselJ(2, x)
}
