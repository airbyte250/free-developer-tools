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

    // Parse HTML and inject with script execution (including nested scripts)
    const temp = document.createElement('div')
    temp.innerHTML = code

    // Patch: If page already loaded, intercept DOMContentLoaded listeners and run them immediately
    const origAdd = document.addEventListener
    if (document.readyState !== 'loading') {
      document.addEventListener = function(type: string, fn: EventListenerOrEventListenerObject, ...args: unknown[]) {
        if (type === 'DOMContentLoaded') {
          setTimeout(() => (fn as EventListener)(new Event('DOMContentLoaded')), 0)
        } else {
          origAdd.call(document, type, fn as EventListenerOrEventListenerObject, args[0] as boolean | AddEventListenerOptions | undefined)
        }
      } as typeof document.addEventListener
    }

    function activateScripts(parent: Element) {
      const scripts = parent.querySelectorAll('script')
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script')
        if (oldScript.src) {
          newScript.src = oldScript.src
          newScript.async = true
          if (oldScript.crossOrigin) newScript.crossOrigin = oldScript.crossOrigin
        } else {
          newScript.textContent = oldScript.textContent
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript)
      })
    }

    // Move all nodes into container first (preserving structure)
    const nodes = Array.from(temp.childNodes)
    for (const node of nodes) {
      container.appendChild(node)
    }

    // Then activate all scripts (top-level and nested)
    activateScripts(container)

    // Restore original addEventListener after scripts are injected
    setTimeout(() => { document.addEventListener = origAdd }, 100)
  }, [code])

  return <div ref={containerRef} />
}
