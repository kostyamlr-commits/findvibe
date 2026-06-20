import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import { CAT_LABELS } from '../lib/aliexpress'

function Skeleton() {
  return (
    <div style={{ background:'#fff', borderRadius:18, overflow:'hidden', border:'1px solid #ece6dc' }}>
      <div style={{ width:'100%', aspectRatio:'1/1', background:'linear-gradient(90deg,#f3efe8 25%,#fbf8f3 50%,#f3efe8 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
      <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ height:34, borderRadius:6, background:'linear-gradient(90deg,#f3efe8 25%,#fbf8f3 50%,#f3efe8 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
        <div style={{ height:36, borderRadius:12, marginTop:4, background:'#f3efe8', animation:'shimmer 1.5s infinite' }}/>
      </div>
    </div>
  )
}

// Modular feed: handles its own pagination/infinite-scroll state, takes
// SSR-provided initialProducts for the unfiltered first page so it renders
// instantly, then fetches more from /api/products as the user scrolls.
export default function HomeFeed({ initialProducts = [], total = 0 }) {
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(total > initialProducts.length)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('All Finds')
  const seen = useRef(new Set(initialProducts.map(p => p.id)))
  const busy = useRef(false)
  const sentinel = useRef(null)
  const page = useRef(1)
  const params = useRef({ cat: '', q: '' })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const cat = p.get('cat') || '', q = p.get('q') || ''
    params.current = { cat, q }
    setTitle(q ? `Results for "${q}"` : (CAT_LABELS[cat] || 'All Finds'))
    if (cat || q) { seen.current = new Set(); setProducts([]); setHasMore(true); page.current = 1; load(1, cat, q) }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !busy.current) load(page.current + 1, params.current.cat, params.current.q)
    }, { rootMargin: '500px' })
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
    <section className="scroll-snap-feed" style={{ padding: '32px 20px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <h2 style={{ color: '#2b2825' }}>{title}</h2>
        <span style={{ color: '#a8a096', fontSize: 13, fontWeight: 500 }}>{total} items</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
        {loading && products.length === 0 && Array.from({length:12}).map((_,i) => <Skeleton key={i} />)}
      </div>
      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a8a096' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No finds yet</p>
          <a href="/" style={{ color: '#2b2825', fontWeight: 700, fontSize: 14, textDecoration: 'underline' }}>← All finds</a>
        </div>
      )}
      {loading && products.length > 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ display: 'inline-block', width: 26, height: 26, border: '2.5px solid #ece6dc', borderTop: '2.5px solid #2b2825', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {!hasMore && !loading && products.length > 0 && <p style={{ textAlign: 'center', color: '#c9c0b3', padding: '32px 0', fontSize: 13, fontWeight: 500 }}>You've seen every find ✦</p>}
      <div ref={sentinel} style={{ height: 1 }} />
    </section>
  )
}
