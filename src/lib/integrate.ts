/**
 * Numerical integration (Simpson's rule) for antenna conductance/directivity integrals.
 */

/**
 * Simpson's rule for definite integral of f from a to b with n subintervals (n even).
 */
export function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  if (n % 2 !== 0) n += 1
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) {
    const x = a + i * h
    sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x)
  }
  return (h / 3) * sum
}

/**
 * Double integral over rectangle [a,b] x [c,d].
 * innerVar: 0 = integrate x first (outer y), 1 = integrate y first (outer x).
 * Returns integral of f(x,y). We use: outer loop (e.g. theta), inner loop (e.g. phi).
 */
export function simpson2D(
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  nOuter: number,
  nInner: number
): number {
  const hOuter = (b - a) / nOuter
  let total = 0
  for (let i = 0; i <= nOuter; i++) {
    const x = a + i * hOuter
    const w = i === 0 || i === nOuter ? 1 : i % 2 === 0 ? 2 : 4
    const g = (y: number) => f(x, y)
    total += w * simpson(g, c, d, nInner)
  }
  return ((hOuter / 3) * total)
}
