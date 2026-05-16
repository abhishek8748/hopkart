import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const BANNERS = [
  { bg:'linear-gradient(135deg,#f5eefb 0%,#fde8f4 100%)', title:'New Summer Collection', sub:'Premium kids wear — TENCEL™ Co-ord Sets, Tees & Polos', cta:'Shop Now', path:'/shop', img:'/products/naruto-mint-1.jpg', tag:'Up to 50% OFF', color:'var(--hops-purple)' },
  { bg:'linear-gradient(135deg,#e8f5e9 0%,#e0f2f1 100%)', title:'Dino Rooaar Collection', sub:'TENCEL™ Fabric · All-Over Puff Print · 3 Colours', cta:'Shop Co-ords', path:'/shop?sub=coord-set', img:'/products/dino-pink-1.jpg', tag:'New Drop 🦕', color:'#2e7d32' },
  { bg:'linear-gradient(135deg,#fff3e0 0%,#fce4ec 100%)', title:'Character Tees', sub:'Naruto · Spider-Man · Looney Tunes · Donald Duck', cta:'Shop T-Shirts', path:'/shop?sub=tshirt', img:'/products/spiderman-white-1.jpg', tag:'Bestsellers 🔥', color:'var(--hops-orange)' },
]

const COLLECTIONS = [
  { label:'Co-ord Sets',  path:'/shop?sub=coord-set', img:'/products/naruto-mint-1.jpg',      count:'10 styles' },
  { label:'T-Shirts',     path:'/shop?sub=tshirt',    img:'/products/spiderman-white-1.jpg',   count:'4 styles' },
  { label:'Polo Shirts',  path:'/shop?sub=polo',      img:'/products/polo-captain-teal-1.jpg', count:'9 styles' },
]

const TRUST = [
  { emoji:'🚚', title:'Free Shipping',   sub:'Orders above ₹499' },
  { emoji:'↩️', title:'Easy Returns',    sub:'30-day return policy' },
  { emoji:'🔒', title:'100% Authentic',  sub:'Original BashaBos' },
  { emoji:'📞', title:'24/7 Support',    sub:'Always here to help' },
]

export default function Home() {
  const [slide, setSlide] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const cur = BANNERS[slide]

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const trending = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8)
  const newArrivals = products.filter(p => p.isNew).slice(0, 8)
  const filtered = activeFilter === 'all' ? trending : products.filter(p => p.sub === activeFilter).slice(0, 8)
  const FILTERS = [
    { id:'all',       label:'All' },
    { id:'coord-set', label:'Co-ord Sets' },
    { id:'tshirt',    label:'T-Shirts' },
    { id:'polo',      label:'Polo Shirts' },
  ]

  /* ── SECTION HEADER component ── */
  const SecHead = ({ title, link, linkLabel = 'View All' }) => (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:22 }}>
      <div>
        <h2 className="hops-section-title">{title}</h2>
      </div>
      {link && (
        <Link to={link} style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:'var(--hops-purple)', marginBottom:10 }}>
          {linkLabel} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )

  return (
    <div>

      {/* ── HERO BANNER SLIDER ── */}
      <section style={{ position:'relative', overflow:'hidden', background: cur.bg, transition:'background 0.6s' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'52px 24px 64px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }} className="hero-grid">
          <div>
            {/* Badge */}
            <span style={{ display:'inline-block', background: cur.color, color:'#fff', fontSize:12, fontWeight:800, padding:'5px 14px', borderRadius:3, marginBottom:16, letterSpacing:0.3 }}>
              {cur.tag}
            </span>
            <h1 style={{ fontSize:46, fontWeight:900, color:'#222', lineHeight:1.12, marginBottom:14 }}>{cur.title}</h1>
            <p style={{ fontSize:16, color:'#666', fontWeight:600, lineHeight:1.6, marginBottom:28 }}>{cur.sub}</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link to={cur.path} style={{ background: cur.color, color:'#fff', padding:'13px 30px', borderRadius:4, fontSize:14, fontWeight:800, display:'inline-flex', alignItems:'center', gap:7 }}>
                {cur.cta} <ArrowRight size={15} />
              </Link>
              <Link to="/shop?new=true" style={{ background:'#fff', color:'#333', padding:'13px 24px', borderRadius:4, fontSize:14, fontWeight:800, border:'1.5px solid var(--hops-border-dark)' }}>
                New Arrivals
              </Link>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'center', position:'relative' }} className="hero-img-col">
            <div style={{ width:300, height:360, borderRadius:12, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.14)' }}>
              {cur.img && <img src={cur.img} alt={cur.title} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', transition:'opacity 0.5s' }} />}
            </div>
            <div style={{ position:'absolute', bottom:24, left:-16, background:'#fff', borderRadius:6, padding:'9px 14px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', fontSize:12, fontWeight:800, color:'#333', border:'1px solid var(--hops-border)' }}>
              🌟 Trending Now
            </div>
            <div style={{ position:'absolute', top:20, right:-8, background: cur.color, color:'#fff', borderRadius:6, padding:'9px 14px', fontSize:12, fontWeight:800 }}>
              Up to 50% OFF
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button onClick={() => setSlide(s => (s - 1 + BANNERS.length) % BANNERS.length)}
          style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'1px solid #ddd', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronLeft size={18} color="#444" />
        </button>
        <button onClick={() => setSlide(s => (s + 1) % BANNERS.length)}
          style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'1px solid #ddd', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronRight size={18} color="#444" />
        </button>

        {/* Dots */}
        <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:7 }}>
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ width: i===slide ? 22 : 7, height:7, borderRadius:10, background: i===slide ? cur.color : 'rgba(0,0,0,0.2)', border:'none', cursor:'pointer', transition:'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* ── TRUST BADGES — Hopscotch style row ── */}
      <section style={{ background:'#fff', borderTop:'1px solid var(--hops-border)', borderBottom:'1px solid var(--hops-border)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }} className="trust-grid">
          {TRUST.map((f, i) => (
            <div key={f.title} style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderRight: i < 3 ? '1px solid var(--hops-border)' : 'none' }}>
              <span style={{ fontSize:26 }}>{f.emoji}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:'#333' }}>{f.title}</p>
                <p style={{ fontSize:12, color:'#888', fontWeight:600 }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY COLLECTION ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'48px 24px' }}>
        <SecHead title="Shop by Collection" link="/shop" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }} className="col-grid">
          {COLLECTIONS.map(c => (
            <Link key={c.label} to={c.path}
              style={{ display:'block', borderRadius:8, overflow:'hidden', position:'relative', aspectRatio:'4/3', border:'1px solid var(--hops-border)', boxShadow:'var(--hops-shadow-card)', transition:'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--hops-shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--hops-shadow-card)' }}>
              {c.img
                ? <img src={c.img} alt={c.label} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                : <div style={{ width:'100%', height:'100%', background:'var(--hops-purple-light)' }} />
              }
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)' }} />
              <div style={{ position:'absolute', bottom:18, left:18 }}>
                <p style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:5 }}>{c.label}</p>
                <span style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:3, padding:'3px 12px', fontSize:12, fontWeight:700, color:'#fff', backdropFilter:'blur(4px)' }}>{c.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      <section style={{ background:'var(--hops-gray-light)', borderTop:'1px solid var(--hops-border)', borderBottom:'1px solid var(--hops-border)', padding:'48px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:14 }}>
            <div>
              <h2 className="hops-section-title">Trending Now</h2>
            </div>
            {/* FILTER PILLS — Hopscotch style */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding:'7px 16px', borderRadius:3, fontSize:13, fontWeight:700,
                    border:'1.5px solid',
                    borderColor: activeFilter === f.id ? 'var(--hops-purple)' : 'var(--hops-border-dark)',
                    background:  activeFilter === f.id ? 'var(--hops-purple)' : '#fff',
                    color:       activeFilter === f.id ? '#fff' : '#555',
                    cursor:'pointer', transition:'all 0.15s',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="prod-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <div style={{ textAlign:'center', marginTop:32 }}>
            <Link to="/shop" className="hops-btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:14, fontWeight:800, background:'var(--hops-purple)', color:'#fff', padding:'12px 32px', borderRadius:4, textDecoration:'none' }}>
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section style={{ maxWidth:1280, margin:'48px auto', padding:'0 24px' }}>
        <div style={{ background:'linear-gradient(135deg, var(--hops-purple) 0%, #9b35b8 100%)', borderRadius:8, padding:'42px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
          <div style={{ color:'#fff' }}>
            <p style={{ fontSize:12, fontWeight:800, opacity:0.8, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Limited Time Offer</p>
            <h2 style={{ fontSize:34, fontWeight:900, lineHeight:1.2, marginBottom:10 }}>Get 20% OFF Your First Order!</h2>
            <p style={{ fontSize:14, opacity:0.9, fontWeight:600, marginBottom:20 }}>
              Use code{' '}
              <strong style={{ background:'rgba(255,255,255,0.2)', padding:'2px 10px', borderRadius:3 }}>BASHABOS20</strong>
              {' '}at checkout
            </p>
            <Link to="/shop" style={{ background:'#fff', color:'var(--hops-purple)', padding:'12px 28px', borderRadius:4, fontSize:14, fontWeight:800, display:'inline-flex', alignItems:'center', gap:7 }}>
              Shop Now <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ fontSize:72 }}>🎉</div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px 64px' }}>
        <SecHead title="New Arrivals" link="/shop?new=true" linkLabel="See All" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="prod-grid">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── WHY BASHABOS ── */}
      <section style={{ background:'var(--hops-gray-light)', borderTop:'1px solid var(--hops-border)', padding:'52px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <h2 style={{ fontSize:26, fontWeight:900, color:'#222', marginBottom:8 }}>Why Parents Love BashaBos</h2>
            <p style={{ fontSize:14, color:'#888', fontWeight:600 }}>Trusted by 10,000+ happy parents across India</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="why-grid">
            {[
              { e:'🌿', t:'TENCEL™ Fabric',       d:"Ultra-soft, breathable fabric gentle on your child's sensitive skin." },
              { e:'🎨', t:'Puff Print Technology', d:'Vibrant prints that stay bright and raised even after many washes.' },
              { e:'📏', t:'Perfect Fit',           d:'Thoughtfully designed for active kids with easy movement.' },
              { e:'🛡️', t:'Safe & Certified',      d:'All fabrics tested and certified — no harmful chemicals.' },
              { e:'🚚', t:'Fast Delivery',          d:'Quick 4–7 day delivery across India with tracking.' },
              { e:'↩️', t:'Easy Returns',           d:"30-day hassle-free returns if you're not satisfied." },
            ].map(w => (
              <div key={w.t} style={{ background:'#fff', border:'1px solid var(--hops-border)', borderRadius:6, padding:22, boxShadow:'var(--hops-shadow-card)' }}>
                <div style={{ fontSize:34, marginBottom:12 }}>{w.e}</div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#333', marginBottom:7 }}>{w.t}</h3>
                <p style={{ fontSize:13, color:'#888', fontWeight:600, lineHeight:1.7 }}>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:1024px){ .prod-grid{grid-template-columns:repeat(3,1fr)!important} }
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;text-align:center}
          .hero-img-col{display:none!important}
          .trust-grid{grid-template-columns:repeat(2,1fr)!important}
          .col-grid{grid-template-columns:1fr!important}
          .prod-grid{grid-template-columns:repeat(2,1fr)!important}
          .why-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:480px){
          .prod-grid{gap:10px!important}
          .why-grid{grid-template-columns:1fr!important}
          .trust-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </div>
  )
}
