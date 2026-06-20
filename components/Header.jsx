import { useState, useEffect, useRef } from 'react'

// Minimal floating header: small logo top-left that fades on scroll, and a
// floating search bar (debounced) that is the ONLY way to filter the feed -
// no category chips cluttering the screen per Kostya spec.
export default function Header() {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearchInput(val) {
    setQ(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) window.location.href = `/?q=${encodeURIComponent(val.trim())}`
    }, 400)
  }

  return (
    <>
      <a href="/" style={{
        position: 'fixed', top: 18, left: 20, zIndex: 100,
        fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
        opacity: scrolled ? 0 : 1, transition: 'opacity 0.3s',
        textShadow: '0 1px 6px rgba(0,0,0,0.4)',
      }}>
        FindVibe
      </a>

      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        width: scrolled ? 240 : 44, transition: 'width 0.3s ease',
      }}>
        <input
          value={q}
          onChange={e => handleSearchInput(e.target.value)}
          onFocus={e => e.target.style.width = '240px'}
          placeholder="Search..."
          style={{
            width: '100%', height: 44, padding: '0 16px', borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            color: '#fff', fontSize: 13, outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}
        />
      </div>
    </>
  )
}
