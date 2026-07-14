import { useEffect, useRef } from 'react'

const DinoRunner = () => {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const relayControls = (event: KeyboardEvent) => {
      if (!['Space', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.code)) return
      const target = event.target as HTMLElement | null
      if (event.code === 'Enter' && (target?.tagName === 'INPUT' || target?.tagName === 'BUTTON')) return

      event.preventDefault()
      frameRef.current?.contentWindow?.postMessage({
        source: 'kemenkum-login',
        type: event.type,
        code: event.code,
        keyCode: event.keyCode,
      }, window.location.origin)
    }

    window.addEventListener('keydown', relayControls)
    window.addEventListener('keyup', relayControls)

    return () => {
      window.removeEventListener('keydown', relayControls)
      window.removeEventListener('keyup', relayControls)
    }
  }, [])

  return (
    <div className="login-dino-runner relative z-10 mt-auto">
      <iframe
        ref={frameRef}
        src="/dino-runner/index.html?v=6"
        className="login-dino-frame"
        title="Permainan dinosaurus. Tekan spasi atau panah atas untuk melompat."
        tabIndex={-1}
      />
      <p className="login-dino-hint">SPASI / ↑ UNTUK MULAI &amp; MELOMPAT</p>
    </div>
  )
}

export default DinoRunner
