import { useState } from 'react'

// Full-screen single-product card. No technical title, no star rating -
// just a short elegant name and a subtle "Shop the look" action, on a
// gentle scrim that doesn't cover the image.
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

      {/* Very subtle scrim, just enough for legibility, doesn't mask the image */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '22%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', left: 24, right: 24, bottom: 32,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
      }}>
        <p style={{
          margin: 0, color: '#fff', fontSize: 17, fontWeight: 500, letterSpacing: '0.01em',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}>
          {product.title}
        </p>
        <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
          style={{
            flexShrink: 0, padding: '9px 16px', borderRadius: 18,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 12.5, fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
          Shop the look
        </a>
      </div>
    </article>
  )
}
