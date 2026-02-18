import { Link } from 'react-router-dom'
import { BlockMath } from '@/components/BlockMath'
import './DocumentationPage.css'

// LaTeX strings using String.raw so backslashes are preserved for KaTeX
const LATEX = {
  patchWidth: String.raw`W = \frac{c}{2f_r \sqrt{\frac{\varepsilon_r + 1}{2}}}`,
  effPermittivity: String.raw`\varepsilon_{\mathrm{reff}} = \frac{\varepsilon_r + 1}{2} + \frac{\varepsilon_r - 1}{2} \left[ \frac{1}{\sqrt{1 + 12 \frac{h}{W}}} \right]`,
  patchLength: String.raw`L = \frac{c}{2f_r \sqrt{\varepsilon_{\mathrm{reff}}}} - 0.824h \left( \frac{(\varepsilon_{\mathrm{reff}} + 0.3)\left(\frac{W}{h} + 0.264\right)}{(\varepsilon_{\mathrm{reff}} - 0.258)\left(\frac{W}{h} + 0.8\right)} \right)`,
  G1: String.raw`G_1 = \frac{1}{120\pi^2} \int_0^\pi \left[ \frac{\sin\left(\frac{k_0 W}{2}\cos\theta\right)}{\cos\theta} \right]^2 \sin^3\theta \, d\theta`,
  G12: String.raw`G_{12} = \frac{1}{120\pi^2} \int_0^\pi \left[ \frac{\sin\left(\frac{k_0 W}{2}\cos\theta\right)}{\cos\theta} \right]^2 J_0(k_0 L\sin\theta)\sin^3\theta \, d\theta`,
  Rin0: String.raw`R_{\mathrm{in}}(y = 0) = \frac{1}{2(G_1+G_{12})}`,
  Riny0: String.raw`R_{\mathrm{in}}(y = y_0) = \frac{1}{2(G_1+G_{12})} \cos^2\left(\frac{\pi}{L}y_0\right)`,
  I1: String.raw`I_1 = \int_0^\pi \int_0^\pi \left[ \frac{\sin\left(\frac{k_0 W}{2}\cos\theta\right)}{\cos\theta} \right]^2 \sin^3\theta \, \cos^2\left(\frac{k_0 L_{\mathrm{e}}}{2}\sin\theta\sin\phi\right) \, d\theta \, d\phi`,
  directivity: String.raw`D = \left(\frac{2\pi W}{\lambda_0}\right)^2 \frac{\pi}{I_1}`,
  circularF: String.raw`F = \frac{\chi_{11} \, c}{2\pi f_r \sqrt{\varepsilon_r}} \approx \frac{8.791 \times 10^7}{f_r \sqrt{\varepsilon_r}}`,
  circularA: String.raw`a = \frac{F}{\sqrt{1 + \frac{2h}{\pi \varepsilon_r F} \ln\left(\frac{\pi F}{2h} + 1.7726\right)}}`,
  circularAe: String.raw`a_e = a \sqrt{1 + \frac{2h}{\pi a \varepsilon_r} \ln\left(\frac{\pi a}{2h} + 1.7726\right)}`,
  circularD0: String.raw`D_0 = \frac{(k_0 a_e)^2}{120 \, G_{\mathrm{rad}}}`,
} as const

const PARAMETERS = [
  { symbol: 'c', name: 'Speed of light', description: 'm/s' },
  { symbol: 'f_r', name: 'Resonant frequency', description: 'Hz' },
  { symbol: 'ε_r', name: 'Relative permittivity', description: 'Substrate dielectric constant' },
  { symbol: 'h', name: 'Substrate height', description: 'm' },
  { symbol: 'W', name: 'Patch width', description: 'm (rectangular)' },
  { symbol: 'L', name: 'Patch length', description: 'm (rectangular)' },
  { symbol: 'L_eff', name: 'Effective length', description: 'm (rectangular)' },
  { symbol: 'ΔL', name: 'Fringing extension', description: 'm' },
  { symbol: 'ε_reff', name: 'Effective relative permittivity', description: '—' },
  { symbol: 'R_in', name: 'Input impedance', description: 'Ω' },
  { symbol: 'G₁', name: 'Single slot conductance', description: 'S' },
  { symbol: 'G₁₂', name: 'Mutual conductance', description: 'S' },
  { symbol: 'y₀', name: '50 Ω feed position', description: 'm' },
  { symbol: 'D', name: 'Directivity', description: 'dBi' },
  { symbol: 'λ₀', name: 'Free-space wavelength', description: 'm' },
  { symbol: 'k₀', name: 'Free-space wavenumber', description: '2π/λ₀ (rad/m)' },
  { symbol: 'χ₁₁', name: 'First zero of J₁', description: '≈ 1.841 (circular)' },
  { symbol: 'F', name: 'Intermediate (circular)', description: 'm' },
  { symbol: 'a', name: 'Patch physical radius', description: 'm (circular)' },
  { symbol: 'a_e', name: 'Effective radius', description: 'm (circular)' },
  { symbol: 'G_rad', name: 'Radiation conductance', description: 'S (circular)' },
  { symbol: 'D₀', name: 'Directivity', description: 'dBi (circular)' },
  { symbol: 'J₀, J₂', name: 'Bessel functions', description: 'First kind, order 0 and 2' },
  { symbol: 'I₁', name: 'Double integral', description: 'Over θ, φ (rectangular directivity)' },
]

export function DocumentationPage() {
  return (
    <div className="doc-page">
      <header className="doc-header">
        <Link to="/" className="doc-back">← Calculator</Link>
        <h1 className="doc-title">Documentation — Formulas & Theory</h1>
      </header>
      <main className="doc-main">
        <section className="doc-section">
          <h2>Parameters</h2>
          <p className="doc-lead">All symbols used in the formulas below are defined in the following tables.</p>
          <div className="doc-params-grid">
            <table className="doc-params-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Description / Unit</th>
                </tr>
              </thead>
              <tbody>
                {PARAMETERS.slice(0, 12).map(({ symbol, name, description }) => (
                  <tr key={symbol}>
                    <td><code>{symbol}</code></td>
                    <td>{name}</td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="doc-params-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Description / Unit</th>
                </tr>
              </thead>
              <tbody>
                {PARAMETERS.slice(12, 24).map(({ symbol, name, description }) => (
                  <tr key={symbol}>
                    <td><code>{symbol}</code></td>
                    <td>{name}</td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="doc-section">
          <h2>Rectangular microstrip patch (TM₀₁₀)</h2>
          <p>
            The patch dimensions are designed for the <strong>dominant TM₀₁₀ mode</strong>. The ground plane is assumed infinite and conductors are lossless. Width <code>W</code> is chosen for good radiation; length <code>L</code> is approximately half-wave in the substrate to set resonance at <code>f_r</code>.
          </p>
          <h3>Formulas</h3>
          <div className="doc-equations">
            <div className="doc-equation-block">
              <span className="doc-equation-label">Patch width</span>
              <BlockMath latex={LATEX.patchWidth} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Effective relative permittivity</span>
              <BlockMath latex={LATEX.effPermittivity} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Patch length (with fringing extension ΔL)</span>
              <BlockMath latex={LATEX.patchLength} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Single slot conductance G₁</span>
              <BlockMath latex={LATEX.G1} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Mutual conductance G₁₂</span>
              <BlockMath latex={LATEX.G12} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Input impedance at edge (y = 0)</span>
              <BlockMath latex={LATEX.Rin0} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Input impedance at feed position y₀ (50 Ω)</span>
              <BlockMath latex={LATEX.Riny0} />
              <p className="doc-equation-note">Solve for y₀ when R_in(y₀) = 50 Ω.</p>
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Double integral I₁</span>
              <BlockMath latex={LATEX.I1} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Directivity</span>
              <BlockMath latex={LATEX.directivity} />
              <p className="doc-equation-note">Output in dBi: 10·log₁₀(D).</p>
            </div>
          </div>
          <div className="doc-ref-block">
            <h4 className="doc-ref-heading">Reference</h4>
            <p className="doc-ref-citation">Balanis, C. A. <em>Antenna Theory: Analysis and Design</em>, 4th ed. Hoboken, NJ: Wiley, 2016. Ch. 14.2 — Rectangular microstrip patch.</p>
          </div>
        </section>

        <section className="doc-section">
          <h2>Circular microstrip patch (TM₁₁₀ᶻ)</h2>
          <p>
            The circular patch is designed for the <strong>dominant TM₁₁₀ᶻ mode</strong> (z normal to the patch). Substrate height <code>h</code> is much smaller than λ. Fringing makes the electrical size larger than the physical radius; the <strong>effective radius</strong> <code>a_e</code> accounts for this.
          </p>
          <h3>Formulas</h3>
          <div className="doc-equations">
            <div className="doc-equation-block">
              <span className="doc-equation-label">Intermediate (χ₁₁ ≈ 1.841 for TM₁₁₀)</span>
              <BlockMath latex={LATEX.circularF} />
              <p className="doc-equation-note">With f_r in Hz, F in m.</p>
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Physical radius</span>
              <BlockMath latex={LATEX.circularA} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Effective radius</span>
              <BlockMath latex={LATEX.circularAe} />
            </div>
            <div className="doc-equation-block">
              <span className="doc-equation-label">Directivity</span>
              <BlockMath latex={LATEX.circularD0} />
              <p className="doc-equation-note">G_rad from integral involving Bessel J₀, J₂. dBi: 10·log₁₀(D₀).</p>
            </div>
          </div>
          <div className="doc-ref-block">
            <h4 className="doc-ref-heading">Reference</h4>
            <p className="doc-ref-citation">Balanis, C. A. <em>Antenna Theory: Analysis and Design</em>, 4th ed. Hoboken, NJ: Wiley, 2016. Ch. 14.3 — Circular microstrip patch.</p>
          </div>
        </section>

        <section className="doc-section doc-credits">
          <h2>Credits &amp; Acknowledgments</h2>
          <div className="doc-credits-card">
            <div className="doc-credits-row">
              <span className="doc-credits-label">Developed by</span>
              <span className="doc-credits-value">Pratik Kumar</span>
              <span className="doc-credits-meta">B.Tech., Electronics &amp; Communication Engineering</span>
              <span className="doc-credits-meta">Vellore Institute of Technology, Vellore</span>
            </div>
            <div className="doc-credits-divider" />
            <div className="doc-credits-row">
              <span className="doc-credits-label">Under the guidance of</span>
              <span className="doc-credits-value">Dr. Suresh Kumar T. R.</span>
              <span className="doc-credits-meta">Associate Professor Senior</span>
              <span className="doc-credits-meta">School of Electronic Engineering</span>
              <span className="doc-credits-meta">Vellore Institute of Technology, Vellore</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
