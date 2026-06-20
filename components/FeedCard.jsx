import { useState } from 'react'

// Full-screen single-product card for the TikTok-style vertical feed.
export default function FeedCard({ product }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <article className="scroll-snap-item" style={{
      position: 'relative', width: '100%', height: '100vh',
      background: '#1a1714', overflow: 'hidden', flexShrink: 0,
    }}>
      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
        style={{ display: 'block', width: '100%', height: '100%' }}>
        {!imgErr && product.image
          ? <img src={product.image} alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgErr(true)} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, color: '#5a544a' }}>✦</div>
        }
      </a>

      {/* Gradient scrim so overlay text stays legible on any image */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Translucent glass title overlay */}
      <div style={{
        position: 'absolute', left: 20, right: 20, bottom: 28,
        padding: '16px 20px', borderRadius: 18,
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}>
        <p style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>
          {product.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 12, color: i <= Math.round(product.rating||4.5) ? '#e8c97a' : 'rgba(255,255,255,0.25)' }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {(product.orders||0) >= 1000 ? `${Math.round(product.orders/1000*10)/10}K sold` : `${product.orders||0} sold`}
          </span>
        </div>
      </div>
    </article>
  )
}
