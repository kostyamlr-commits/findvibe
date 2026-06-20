import { useState, useEffect, useRef } from 'react'
import FeedCard from './FeedCard'

// Full-screen vertical snap feed - TikTok-style, one product at a time.
// No grid, no item counts, no category chips inside the feed itself;
// category/search filtering is driven entirely by the floating search bar.
export default function HomeFeed({ initialProducts = [], total = 0 }) {
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(total > initialProducts.length)
  const [loading, setLoading] = useState(false)
  const seen = useRef(new Set(initialProducts.map(p => p.id)))
  const busy = useRef(false)
  const sentinel = useRef(null)
  const page = useRef(1)
  const params = useRef({ cat: '', q: '' })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const cat = p.get('cat') || '', q = p.get('q') || ''
    params.current = { cat, q }
    if (cat || q) { seen.current = new Set(); setProducts([]); setHasMore(true); page.current = 1; load(1, cat, q) }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !busy.current) load(page.current + 1, params.current.cat, params.current.q)
    }, { rootMargin: '1500px' })
    if (sentinel.current) obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [hasMore])

  async function load(p, cat, q) {
    if (busy.current) return
    busy.current = true; setLoading(true)
    try {
      let url = `/api/products?page=${p}&limit=12`
      if (q) url += `&q=${encodeURIComponent(q)}`
      else if (cat) url += `&cat=${cat}`
      const r = await fetch(url)
      const d = await r.json()
      const fresh = (d.products || []).filter(p => { if (seen.current.has(p.id)) return false; seen.current.add(p.id); return true })
      setProducts(prev => p === 1 ? fresh : [...prev, ...fresh])
      setHasMore(d.hasMore && fresh.length > 0)
      page.current = p
    } catch (e) { console.error(e) }
    busy.current = false; setLoading(false)
  }

  return (
    <div className="scroll-snap-feed" style={{ width: '100%' }}>
      {products.map(p => <FeedCard key={p.id} product={p} />)}

      {products.length === 0 && !loading && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a8a096', background: '#1a1714' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>No finds yet</p>
        </div>
      )}

      {loading && (
        <div style={{ height: products.length ? 80 : '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.2)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      <div ref={sentinel} style={{ height: 1 }} />
    </div>
  )
}
