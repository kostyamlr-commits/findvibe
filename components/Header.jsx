import { useState, useEffect, useRef } from 'react'
import { CAT_LABELS, CATEGORY_LIST } from '../lib/aliexpress'

export default function Header() {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
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
      {/* Logo bar - fades out on scroll */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 90, background: '#faf8f5',
        borderBottom: '1px solid #e8e2d9', padding: '16px 20px',
        opacity: scrolled ? 0 : 1, maxHeight: scrolled ? 0 : 80,
        overflow: 'hidden', transition: 'opacity 0.3s, max-height 0.3s, padding 0.3s',
        ...(scrolled ? { padding: '0 20px' } : {}),
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontSize: 22, fontWeight: 800, color: '#2b2825', letterSpacing: '-0.02em' }}>
            FindVibe
          </a>
          <span style={{ fontSize: 12, color: '#a8a096', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Affordable Aesthetic Finds
          </span>
        </div>
      </div>

      {/* Floating search bar - always visible */}
      <div style={{ position: 'sticky', top: scrolled ? 0 : 0, zIndex: 95, padding: '12px 20px', background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e2d9' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={q}
              onChange={e => handleSearchInput(e.target.value)}
              placeholder="Search aesthetic finds..."
              style={{
                width: '100%', height: 44, padding: '0 18px', borderRadius: 22,
                border: '1px solid #e0d9cd', background: '#fff', color: '#2b2825',
                fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            />
          </div>
          <button onClick={() => setCatsOpen(o => !o)}
            style={{ height: 44, padding: '0 18px', borderRadius: 22, border: '1px solid #e0d9cd', background: '#fff', color: '#5a544a', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Categories
          </button>
        </div>
        {catsOpen && (
          <div style={{ maxWidth: 760, margin: '14px auto 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORY_LIST.map(c => (
              <a key={c.id} href={`/?cat=${c.id}`}
                style={{ padding: '6px 14px', borderRadius: 14, fontSize: 12.5, fontWeight: 600, color: '#5a544a', background: '#fff', border: '1px solid #e8e2d9' }}>
                {CAT_LABELS[c.id]}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
