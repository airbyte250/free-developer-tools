'use client'

import { useEffect, useRef } from 'react'

interface AdSlotProps {
  code: string
}

export default function AdSlot({ code }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const injectedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || injectedRef.current) return
    injectedRef.current = true

    const container = containerRef.current
    container.innerHTML = ''

    // Parse HTML and inject with script execution
    const temp = document.createElement('div')
    temp.innerHTML = code

    // Move nodes and execute scripts
    const nodes = Array.from(temp.childNodes)
    for (const node of nodes) {
      if (node.nodeName === 'SCRIPT') {
        const script = document.createElement('script')
        const srcEl = node as HTMLScriptElement
        if (srcEl.src) {
          script.src = srcEl.src
          script.async = true
          if (srcEl.crossOrigin) script.crossOrigin = srcEl.crossOrigin
        } else {
          script.textContent = srcEl.textContent
        }
        container.appendChild(script)
      } else {
        container.appendChild(node.cloneNode(true))
      }
    }
  }, [code])

  return <div ref={containerRef} />
}
