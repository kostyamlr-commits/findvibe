import { useState, useEffect, useRef } from 'react'

// Single fixed top container holding both logo and search, centered,
// with proper top padding so nothing hugs the screen edge. Fixes the
// earlier bug where logo and search were two separate fixed elements
// that could overlap/drift independently.
export default function Header() {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [focused, setFocused] = useState(false)
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
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
      paddingTop: '2rem', paddingLeft: 20, paddingRight: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      pointerEvents: 'none', // children opt back in individually so empty space doesn't block scroll/taps
    }}>
      <a href="/" style={{
        pointerEvents: 'auto',
        fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
        opacity: scrolled ? 0 : 1, transition: 'opacity 0.3s',
        textShadow: '0 1px 8px rgba(0,0,0,0.45)',
      }}>
        FindVibe
      </a>

      <input
        value={q}
        onChange={e => handleSearchInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search..."
        style={{
          pointerEvents: 'auto',
          width: focused || q ? 260 : 180, maxWidth: '90vw',
          height: 42, padding: '0 18px', borderRadius: 21,
          border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          color: '#fff', fontSize: 13, outline: 'none', textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'width 0.25s ease',
        }}
      />
    </div>
  )
}
