import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

const NAV_LINKS = [
  { label:'Home',           path:'/' },
  { label:'Co-ord Sets',    path:'/shop?sub=coord-set' },
  { label:'T-Shirts',       path:'/shop?sub=tshirt' },
  { label:'Polo T-Shirts',  path:'/shop?sub=polo' },
  { label:'New Arrivals ✨', path:'/shop?new=true', isNew:true },
  { label:'🔥 Sale',         path:'/shop?sale=true', isSale:true },
]

export default function Navbar({ onCartOpen }) {
  const { count, wish } = useCart()
  const [q, setQ] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const go = e => {
    e.preventDefault()
    if (q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setQ(''); setMobileOpen(false) }
  }

  return (
    <header style={{ position:'sticky', top:0, zIndex:999 }}>

      {/* ROW 1: PROMO BAR — BB red */}
      <div style={{ background:'var(--bb-red)', color:'#fff', textAlign:'center', padding:'8px 16px', fontSize:13, fontWeight:700 }}>
        🎉 FREE SHIPPING above ₹499 &nbsp;|&nbsp; Code{' '}
        <strong style={{ background:'rgba(255,255,255,0.25)', padding:'1px 8px', borderRadius:3 }}>BASHABOS20</strong>
        {' '}for 20% OFF
      </div>

      {/* ROW 2: LOGO + SEARCH + ICONS */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--bb-border)', boxShadow:'0 2px 8px rgba(26,38,80,0.08)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', height:64, display:'flex', alignItems:'center', gap:16 }}>

          {/* LOGO — BB image + BashaBos text */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, textDecoration:'none' }}>
            <img
              src="/bb-logo.png"
              alt="BashaBos logo"
              style={{ height:46, width:'auto', objectFit:'contain' }}
            />
            <span style={{
              fontFamily:'var(--bb-font-logo)',
              fontWeight:900,
              fontSize:24,
              lineHeight:1,
              WebkitTextStroke:'0.6px #000',
              textShadow:'0 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000',
            }}>
              <span style={{ color:'var(--bb-red)' }}>Basha</span><span style={{ color:'var(--bb-orange)' }}>Bos</span>
            </span>
          </Link>

          {/* SEARCH */}
          <form onSubmit={go} className="bb-srch" style={{ flex:1, maxWidth:460, display:'flex', alignItems:'center', background:'var(--bb-gray-light)', border:'1.5px solid var(--bb-border)', borderRadius:6, height:40, padding:'0 12px', gap:8 }}>
            <Search size={15} color="#aaa" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search kids clothes..."
              style={{ flex:1, border:'none', background:'none', fontSize:13, fontWeight:600, color:'#333' }} />
            {q && <button type="button" onClick={() => setQ('')}><X size={13} color="#aaa" /></button>}
          </form>

          {/* ICONS */}
          <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:'auto', flexShrink:0 }}>
            <Link to="/wishlist" style={icoS} title="Wishlist">
              <Heart size={21} />
              {wish.length > 0 && <span style={dotS('var(--bb-red)')}>{wish.length}</span>}
            </Link>
            <button onClick={onCartOpen} style={{ ...icoS, position:'relative' }} title="Cart">
              <ShoppingCart size={21} />
              {count > 0 && <span style={dotS('var(--bb-blue)')}>{count}</span>}
            </button>
            <Link to="/account" style={icoS} title="Account"><User size={21} /></Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ ...icoS, display:'none' }} className="bb-burger">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: CATEGORY LINKS — BB navy bottom border */}
      <div style={{ background:'#fff', borderBottom:'2.5px solid var(--bb-blue)' }} className="bb-catrow">
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', display:'flex', overflowX:'auto' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path}
              className="bb-catlink"
              style={{
                padding:'10px 14px', fontSize:13.5, fontWeight:700,
                color: l.isSale ? 'var(--bb-red)' : '#444',
                whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4
              }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div style={{ background:'#fff', borderBottom:'1px solid var(--bb-border)', padding:'12px 20px 18px', boxShadow:'0 4px 12px rgba(26,38,80,0.1)' }}>
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <img src="/bb-logo.png" alt="BashaBos" style={{ height:36, width:'auto' }} />
          </div>
          <form onSubmit={go} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bb-gray-light)', border:'1.5px solid var(--bb-border)', borderRadius:6, padding:'0 12px', height:40, marginBottom:12 }}>
            <Search size={15} color="#aaa" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{ flex:1, border:'none', background:'none', fontSize:14, fontWeight:600 }} />
          </form>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path} onClick={() => setMobileOpen(false)}
              style={{ display:'block', padding:'11px 4px', fontSize:15, fontWeight:700, color: l.isSale ? 'var(--bb-red)' : '#333', borderBottom:'1px solid #f5f5f5' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .bb-catlink:hover { color: var(--bb-blue) !important; border-bottom: 2.5px solid var(--bb-blue); margin-bottom: -2.5px; }
        @media(max-width:860px){ .bb-srch{display:none!important} .bb-catrow{display:none!important} .bb-burger{display:flex!important} }
      `}</style>
    </header>
  )
}

const icoS = { position:'relative', width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--bb-navy)', transition:'background 0.15s', textDecoration:'none', border:'none', background:'none', cursor:'pointer' }
const dotS = bg => ({ position:'absolute', top:3, right:3, background:bg, color:'#fff', width:17, height:17, borderRadius:'50%', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' })
