'use client'

import { useEffect, useRef } from 'react'

const HEAD_TAGS = new Set(['SCRIPT', 'META', 'LINK', 'STYLE', 'NOSCRIPT'])

export default function HeadInjector({ code }: { code: string }) {
  const injectedRef = useRef(false)

  useEffect(() => {
    if (injectedRef.current || !code) return
    injectedRef.current = true

    const temp = document.createElement('div')
    temp.innerHTML = code

    const head = document.head
    const nodes = Array.from(temp.childNodes)
    for (const node of nodes) {
      if (node.nodeType !== 1) continue
      const el = node as HTMLElement
      if (!HEAD_TAGS.has(el.nodeName)) continue

      if (el.nodeName === 'SCRIPT') {
        const script = document.createElement('script')
        const srcEl = el as HTMLScriptElement
        if (srcEl.src) {
          script.src = srcEl.src
          script.async = true
          if (srcEl.crossOrigin) script.crossOrigin = srcEl.crossOrigin
        } else {
          script.textContent = srcEl.textContent
        }
        head.appendChild(script)
      } else {
        head.appendChild(el.cloneNode(true))
      }
    }
  }, [code])

  return null
}
