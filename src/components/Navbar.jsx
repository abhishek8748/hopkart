import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

const NAV_LINKS = [
  { label:'Home',          path:'/' },
  { label:'Co-ord Sets',   path:'/shop?sub=coord-set' },
  { label:'T-Shirts',      path:'/shop?sub=tshirt' },
  { label:'Polo T-Shirts', path:'/shop?sub=polo' },
  { label:'New Arrivals ✨',path:'/shop?new=true', isNew:true },
  { label:'🔥 Sale',        path:'/shop?sale=true', isSale:true },
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

      {/* ROW 1: PROMO BAR — Hopscotch purple */}
      <div style={{ background:'var(--hops-purple)', color:'#fff', textAlign:'center', padding:'8px 16px', fontSize:13, fontWeight:700 }}>
        🎉 FREE SHIPPING above ₹499 &nbsp;|&nbsp; Code{' '}
        <strong style={{ background:'rgba(255,255,255,0.2)', padding:'1px 8px', borderRadius:3 }}>BASHABOS20</strong>
        {' '}for 20% OFF
      </div>

      {/* ROW 2: LOGO + SEARCH + ICONS */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--hops-border)', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', height:60, display:'flex', alignItems:'center', gap:16 }}>

          {/* LOGO */}
          <Link to="/" style={{ fontFamily:'var(--hops-font-logo)', fontSize:26, color:'var(--hops-purple)', flexShrink:0, letterSpacing:-1 }}>
            Basha<span style={{ color:'var(--hops-pink)' }}>Bos</span>
          </Link>

          {/* SEARCH — Hopscotch style center search bar */}
          <form onSubmit={go} className="hops-srch" style={{ flex:1, maxWidth:460, display:'flex', alignItems:'center', background:'var(--hops-gray-light)', border:'1.5px solid var(--hops-border)', borderRadius:4, height:38, padding:'0 12px', gap:8 }}>
            <Search size={15} color="#aaa" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search kids clothes..."
              style={{ flex:1, border:'none', background:'none', fontSize:13, fontWeight:600, color:'#333' }} />
            {q && <button type="button" onClick={() => setQ('')}><X size={13} color="#aaa" /></button>}
          </form>

          {/* ICONS */}
          <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:'auto', flexShrink:0 }}>
            <Link to="/wishlist" style={icoS} title="Wishlist">
              <Heart size={21} />
              {wish.length > 0 && <span style={dotS('#e91e8c')}>{wish.length}</span>}
            </Link>
            <button onClick={onCartOpen} style={{ ...icoS, position:'relative' }} title="Cart">
              <ShoppingCart size={21} />
              {count > 0 && <span style={dotS('#67218C')}>{count}</span>}
            </button>
            <Link to="/account" style={icoS} title="Account"><User size={21} /></Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ ...icoS, display:'none' }} className="hops-burger">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: CATEGORY LINKS — Hopscotch bottom border purple */}
      <div style={{ background:'#fff', borderBottom:'2px solid var(--hops-purple)' }} className="hops-catrow">
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', display:'flex', overflowX:'auto' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path}
              className="hops-catlink"
              style={{ padding:'10px 14px', fontSize:13.5, fontWeight:700, color: l.isSale ? 'var(--hops-orange)' : '#444', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div style={{ background:'#fff', borderBottom:'1px solid var(--hops-border)', padding:'12px 20px 18px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
          <form onSubmit={go} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--hops-gray-light)', border:'1.5px solid var(--hops-border)', borderRadius:4, padding:'0 12px', height:40, marginBottom:12 }}>
            <Search size={15} color="#aaa" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{ flex:1, border:'none', background:'none', fontSize:14, fontWeight:600 }} />
          </form>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path} onClick={() => setMobileOpen(false)}
              style={{ display:'block', padding:'11px 4px', fontSize:15, fontWeight:700, color: l.isSale ? 'var(--hops-orange)' : '#333', borderBottom:'1px solid #f5f5f5' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .hops-catlink:hover { color: var(--hops-purple) !important; border-bottom: 2px solid var(--hops-purple); margin-bottom: -2px; }
        @media(max-width:860px){ .hops-srch{display:none!important} .hops-catrow{display:none!important} .hops-burger{display:flex!important} }
      `}</style>
    </header>
  )
}

const icoS = { position:'relative', width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', transition:'background 0.15s', textDecoration:'none', border:'none', background:'none', cursor:'pointer' }
const dotS = bg => ({ position:'absolute', top:3, right:3, background:bg, color:'#fff', width:17, height:17, borderRadius:'50%', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' })
