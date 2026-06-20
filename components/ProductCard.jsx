import { useState } from 'react'

export default function ProductCard({ product }) {
  const [imgErr, setImgErr] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <article
      className="scroll-snap-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        border: '1px solid #ece6dc', transition: 'all 0.3s ease',
        transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? '0 12px 28px rgba(43,40,37,0.08)' : '0 1px 3px rgba(43,40,37,0.03)',
      }}
    >
      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
        style={{ display: 'block', width: '100%', aspectRatio: '1/1', background: '#f3efe8', overflow: 'hidden' }}>
        {!imgErr && product.image
          ? <img src={product.image} alt={product.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hover ? 'scale(1.05)' : 'scale(1)' }}
              onError={() => setImgErr(true)} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#c9c0b3' }}>✦</div>
        }
      </a>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#2b2825', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38 }}>
          {product.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 12, color: i <= Math.round(product.rating||4.5) ? '#b08d57' : '#e0d9cd' }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#a8a096', fontWeight: 500 }}>
            {(product.orders||0) >= 1000 ? `${Math.round(product.orders/1000*10)/10}K sold` : `${product.orders||0} sold`}
          </span>
        </div>
        <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
          style={{ display: 'block', textAlign: 'center', background: '#2b2825', color: '#faf8f5', fontSize: 12.5, fontWeight: 600, padding: '10px 0', borderRadius: 12, marginTop: 2, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4a443c'}
          onMouseLeave={e => e.currentTarget.style.background = '#2b2825'}>
          View
        </a>
      </div>
    </article>
  )
}
