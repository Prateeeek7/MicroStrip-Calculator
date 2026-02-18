import { useMemo } from 'react'
import katex from 'katex'

interface BlockMathProps {
  latex: string
  className?: string
}

export function BlockMath({ latex, className = '' }: BlockMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
        strict: false,
      })
    } catch {
      return ''
    }
  }, [latex])

  if (!html) return null

  return (
    <div
      className={`doc-latex ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-hidden
    />
  )
}
