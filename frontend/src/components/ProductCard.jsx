import { useState } from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, layout = 'grid' }) {
  const { add, toggleWish, isWished } = useCart()
  const [hovered, setHovered] = useState(false)
  const [imgIdx, setImgIdx]   = useState(0)
  const [added, setAdded]     = useState(false)
  const disc   = Math.round(((product.mrp - product.price) / product.mrp) * 100)
  const wished = isWished(product.id)

  const handleAdd = e => {
    e.preventDefault()
    add({ ...product, size: product.sizes[0] })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }
  const handleWish = e => {
    e.preventDefault()
    toggleWish(product)
  }

  /* LIST VIEW */
  if (layout === 'list') {
    return (
      <Link to={`/product/${product.id}`} style={{ display:'flex', gap:14, background:'#fff', border:'1px solid var(--hops-border)', borderRadius:6, overflow:'hidden', padding:12, color:'inherit', transition:'box-shadow 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow='var(--hops-shadow-hover)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
        <div style={{ width:100, height:120, borderRadius:4, overflow:'hidden', flexShrink:0, background:'#f8f8f8' }}>
          {product.images?.[0] && <img src={product.images[0]} alt={product.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }} />}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, fontWeight:800, color:'var(--hops-purple)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>{product.brand}</p>
          <p style={{ fontSize:15, fontWeight:800, color:'#222', marginBottom:4 }}>{product.name}</p>
          <p style={{ fontSize:12, color:'#888', fontWeight:600, marginBottom:8 }}>{product.color} · {product.ageRange}</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:17, fontWeight:900, color:'#222' }}>₹{product.price}</span>
            <span style={{ fontSize:13, color:'#bbb', textDecoration:'line-through', fontWeight:600 }}>₹{product.mrp}</span>
            <span style={{ fontSize:11, color:'var(--hops-green)', fontWeight:800 }}>{disc}% off</span>
          </div>
        </div>
        <button onClick={handleAdd}
          style={{ background: added ? 'var(--hops-green)' : 'var(--hops-purple)', color:'#fff', border:'none', borderRadius:4, padding:'10px 16px', fontSize:12, fontWeight:800, cursor:'pointer', flexShrink:0, alignSelf:'center', transition:'background 0.2s' }}>
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </Link>
    )
  }

  /* GRID VIEW — Exact Hopscotch card style */
  return (
    <Link to={`/product/${product.id}`} style={{ display:'block', color:'inherit' }}>
      <div
        onMouseEnter={() => { setHovered(true); if (product.images?.length > 1) setImgIdx(1) }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
        style={{
          background: '#fff',
          border: '1px solid var(--hops-border)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: hovered ? 'var(--hops-shadow-hover)' : 'var(--hops-shadow-card)',
          transform: hovered ? 'translateY(-3px)' : 'none',
          transition: 'all 0.22s ease',
          cursor: 'pointer',
        }}
      >
        {/* IMAGE — Hopscotch 3:4 portrait */}
        <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', background:'var(--hops-gray-light)' }}>
          {product.images?.[imgIdx] ? (
            <img
              src={product.images[imgIdx]}
              alt={`${product.name} ${product.color}`}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', transition:'transform 0.4s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--hops-purple-light)', fontSize:56, fontWeight:900, color:'var(--hops-purple)', opacity:0.2 }}>B</div>
          )}

          {/* TOP-LEFT BADGES — Hopscotch style */}
          <div style={{ position:'absolute', top:9, left:9, display:'flex', flexDirection:'column', gap:5 }}>
            {disc > 0 && (
              <span style={{ background:'var(--hops-orange)', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:3 }}>
                {disc}% OFF
              </span>
            )}
            {product.isNew && (
              <span style={{ background:'var(--hops-green)', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:3 }}>
                NEW
              </span>
            )}
          </div>

          {/* WISHLIST — top right */}
          <button
            onClick={handleWish}
            style={{
              position:'absolute', top:9, right:9,
              width:32, height:32, borderRadius:'50%',
              background: wished ? 'var(--hops-pink-light)' : 'rgba(255,255,255,0.92)',
              border: wished ? '1px solid var(--hops-pink)' : '1px solid #ddd',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 1px 4px rgba(0,0,0,0.1)',
              transition:'all 0.15s',
              cursor:'pointer',
            }}
          >
            <Heart size={15} fill={wished ? 'var(--hops-pink)' : 'none'} color={wished ? 'var(--hops-pink)' : '#888'} />
          </button>

          {/* COLOUR TAG — bottom left, Hopscotch style */}
          <span style={{
            position:'absolute', bottom:8, left:8,
            background:'rgba(0,0,0,0.52)', color:'#fff',
            fontSize:10, fontWeight:700,
            padding:'2px 9px', borderRadius:2,
            backdropFilter:'blur(3px)',
            maxWidth:'calc(100% - 16px)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {product.color}
          </span>

          {/* ADD TO CART overlay on hover */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            background: added ? 'var(--hops-green)' : 'var(--hops-purple)',
            color:'#fff',
            padding:'11px',
            fontSize:13, fontWeight:800,
            textAlign:'center',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform 0.24s ease',
            cursor:'pointer',
          }} onClick={handleAdd}>
            <ShoppingCart size={14} /> {added ? '✓ Added to Cart!' : 'Quick Add'}
          </div>
        </div>

        {/* INFO — Hopscotch card info style */}
        <div style={{ padding:'11px 12px 13px' }}>

          {/* Brand */}
          <p style={{ fontSize:10, fontWeight:800, color:'var(--hops-purple)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:3 }}>
            {product.brand}
          </p>

          {/* Stars */}
          <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:4 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} fill={i <= Math.round(product.rating) ? '#f0ad4e' : 'none'} color={i <= Math.round(product.rating) ? '#f0ad4e' : '#ddd'} />
            ))}
            <span style={{ fontSize:11, color:'#aaa', fontWeight:600, marginLeft:2 }}>({product.reviews})</span>
          </div>

          {/* Name */}
          <p style={{ fontSize:14, fontWeight:800, color:'#222', lineHeight:1.3, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {product.name}
          </p>

          {/* Age */}
          <p style={{ fontSize:12, color:'#888', fontWeight:600, marginBottom:9 }}>{product.ageRange}</p>

          {/* Price row — Hopscotch style */}
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ fontSize:17, fontWeight:900, color:'#222' }}>₹{product.price}</span>
            <span style={{ fontSize:13, color:'#bbb', textDecoration:'line-through', fontWeight:600 }}>₹{product.mrp}</span>
            {disc > 0 && (
              <span style={{ fontSize:11, color:'var(--hops-green)', fontWeight:800 }}>{disc}% off</span>
            )}
          </div>

          {/* Fabric badge */}
          {product.fabric && (
            <span style={{ display:'inline-block', marginTop:7, background:'var(--hops-purple-light)', color:'var(--hops-purple)', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:2, border:'1px solid #e0c8f0' }}>
              {product.fabric}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
