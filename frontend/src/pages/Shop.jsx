import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid2X2, List } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const SORT = [
  { v:'popular', l:'Popularity' }, { v:'new', l:'Newest First' },
  { v:'asc', l:'Price: Low to High' }, { v:'desc', l:'Price: High to Low' },
  { v:'discount', l:'Discount' }, { v:'rating', l:'Rating' },
]
const PRICES = [
  { l:'Under ₹499',  min:0,   max:499 },
  { l:'₹499 – ₹699', min:499, max:699 },
  { l:'₹699 – ₹849', min:699, max:849 },
  { l:'Above ₹849',  min:849, max:Infinity },
]

function Acc({ title, children, def=true }) {
  const [o, setO] = useState(def)
  return (
    <div style={{ borderBottom:'1px solid var(--hops-border)', paddingBottom:14, marginBottom:14 }}>
      <button onClick={() => setO(!o)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', padding:'4px 0 10px', fontSize:13, fontWeight:800, color:'#444', textTransform:'uppercase', letterSpacing:0.5 }}>
        {title} {o ? <ChevronUp size={14} color="#999"/> : <ChevronDown size={14} color="#999"/>}
      </button>
      {o && children}
    </div>
  )
}

function RadioItem({ label, checked, onChange }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 0', cursor:'pointer' }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ accentColor:'var(--hops-purple)', width:15, height:15 }} />
      <span style={{ fontSize:13, fontWeight:600, color:'#444' }}>{label}</span>
    </label>
  )
}

export default function Shop() {
  const [params] = useSearchParams()
  const [sort, setSort]     = useState('popular')
  const [sub, setSub]       = useState(params.get('sub') || 'all')
  const [price, setPrice]   = useState(null)
  const [sidebar, setSidebar] = useState(false)
  const [view, setView]     = useState('grid')

  const list = useMemo(() => {
    let l = [...products]
    if (sub !== 'all')             l = l.filter(p => p.sub === sub)
    if (price)                     l = l.filter(p => p.price >= price.min && p.price < price.max)
    if (params.get('q'))           { const q = params.get('q').toLowerCase(); l = l.filter(p => p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)) }
    if (params.get('new')==='true') l = l.filter(p => p.isNew)
    if (params.get('sale')==='true') l = l.filter(p => ((p.mrp-p.price)/p.mrp) > 0.3)
    switch (sort) {
      case 'asc':      l.sort((a,b) => a.price - b.price); break
      case 'desc':     l.sort((a,b) => b.price - a.price); break
      case 'discount': l.sort((a,b) => (b.mrp-b.price)/b.mrp - (a.mrp-a.price)/a.mrp); break
      case 'rating':   l.sort((a,b) => b.rating - a.rating); break
      case 'new':      l.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0)); break
      default:         l.sort((a,b) => b.sold - a.sold)
    }
    return l
  }, [sub, price, sort, params])

  const FilterContent = () => (
    <>
      <Acc title="Collection">
        {['all','coord-set','tshirt','polo'].map(c => (
          <RadioItem key={c} label={c==='all'?'All Products':c.replace('-',' ')} checked={sub===c} onChange={() => setSub(c)} />
        ))}
      </Acc>
      <Acc title="Price Range">
        {PRICES.map(p => (
          <RadioItem key={p.l} label={p.l} checked={price?.l===p.l} onChange={() => setPrice(price?.l===p.l ? null : p)} />
        ))}
        {price && <button onClick={() => setPrice(null)} style={{ fontSize:11, color:'var(--hops-pink)', fontWeight:800, background:'none', border:'none', cursor:'pointer', marginTop:4, padding:0 }}>Clear ×</button>}
      </Acc>
      <Acc title="Fabric">
        {['TENCEL™','Cotton','Cotton Pique'].map(f => (
          <label key={f} style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 0', cursor:'pointer' }}>
            <input type="checkbox" style={{ accentColor:'var(--hops-purple)', width:15, height:15 }} />
            <span style={{ fontSize:13, fontWeight:600, color:'#444' }}>{f}</span>
          </label>
        ))}
      </Acc>
      <Acc title="Fit">
        {['Regular Fit','Oversized'].map(f => (
          <label key={f} style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 0', cursor:'pointer' }}>
            <input type="checkbox" style={{ accentColor:'var(--hops-purple)', width:15, height:15 }} />
            <span style={{ fontSize:13, fontWeight:600, color:'#444' }}>{f}</span>
          </label>
        ))}
      </Acc>
    </>
  )

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'22px 20px 80px' }}>

      {/* BREADCRUMB */}
      <p style={{ fontSize:12, color:'#aaa', fontWeight:600, marginBottom:16 }}>
        Home › Shop {sub!=='all' && <> › <span style={{ color:'#555', textTransform:'capitalize' }}>{sub.replace('-',' ')}</span></>}
      </p>

      {/* ACTIVE FILTER CHIPS */}
      {(sub!=='all' || price) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#aaa' }}>Filters:</span>
          {[sub!=='all' && { l: sub.replace('-',' '), clear: () => setSub('all') }, price && { l: price.l, clear: () => setPrice(null) }]
            .filter(Boolean)
            .map(f => (
              <span key={f.l} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--hops-purple-light)', color:'var(--hops-purple)', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:3, border:'1px solid #e0c8f0', textTransform:'capitalize' }}>
                {f.l} <X size={11} style={{ cursor:'pointer' }} onClick={f.clear} />
              </span>
          ))}
          <button onClick={() => { setSub('all'); setPrice(null) }} style={{ fontSize:11, color:'#aaa', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Clear All</button>
        </div>
      )}

      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* SIDEBAR — Hopscotch style */}
        <aside style={{ width:220, flexShrink:0, background:'#fff', border:'1px solid var(--hops-border)', borderRadius:6, padding:'18px 16px', position:'sticky', top:148 }} className="desk-sidebar">
          <h3 style={{ fontSize:15, fontWeight:900, color:'#333', marginBottom:18, paddingBottom:10, borderBottom:'2px solid var(--hops-purple)' }}>
            Filters
          </h3>
          <FilterContent />
        </aside>

        <div style={{ flex:1, minWidth:0 }}>
          {/* TOOLBAR */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10, padding:'12px 16px', background:'#fff', border:'1px solid var(--hops-border)', borderRadius:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setSidebar(true)} style={{ display:'none', alignItems:'center', gap:6, background:'var(--hops-purple-light)', border:'1px solid #e0c8f0', padding:'8px 14px', borderRadius:4, fontSize:13, fontWeight:700, cursor:'pointer', color:'var(--hops-purple)' }} className="mob-filter-btn">
                <SlidersHorizontal size={14}/> Filters
              </button>
              <p style={{ fontSize:13, color:'#888', fontWeight:600 }}>
                Showing <strong style={{ color:'#333' }}>{list.length}</strong> products
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* Grid/List toggle */}
              <div style={{ display:'flex', gap:3, border:'1px solid var(--hops-border)', borderRadius:4, overflow:'hidden' }}>
                {[{ic:<Grid2X2 size={14}/>,v:'grid'},{ic:<List size={14}/>,v:'list'}].map(b => (
                  <button key={b.v} onClick={() => setView(b.v)}
                    style={{ width:32,height:32,border:'none',background: view===b.v ? 'var(--hops-purple)' : '#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color: view===b.v ? '#fff' : '#888',transition:'all 0.15s' }}>
                    {b.ic}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ border:'1px solid var(--hops-border)', borderRadius:4, padding:'7px 12px', fontSize:13, fontWeight:700, color:'#333', outline:'none', background:'#fff', cursor:'pointer', fontFamily:'var(--hops-font)' }}>
                {SORT.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>

          {/* PRODUCTS */}
          {list.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
              <h3 style={{ fontSize:20, fontWeight:800, marginBottom:8, color:'#333' }}>No products found</h3>
              <p style={{ color:'#aaa', fontWeight:600, marginBottom:20 }}>Try different filters or search terms</p>
              <button onClick={() => { setSub('all'); setPrice(null) }} className="hops-btn-primary">Reset Filters</button>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="shop-grid">
              {list.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {list.map(p => <ProductCard key={p.id} product={p} layout="list" />)}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {sidebar && (
        <>
          <div onClick={() => setSidebar(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.42)',zIndex:500 }} />
          <div style={{ position:'fixed',top:0,left:0,width:280,height:'100vh',background:'#fff',zIndex:600,padding:22,overflowY:'auto',boxShadow:'4px 0 20px rgba(0,0,0,0.1)' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <h3 style={{ fontSize:17,fontWeight:900,color:'#333' }}>Filters</h3>
              <button onClick={() => setSidebar(false)} style={{ background:'#f5f5f5',border:'none',width:32,height:32,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16}/></button>
            </div>
            <FilterContent />
            <button onClick={() => setSidebar(false)} className="hops-btn-primary" style={{ width:'100%',marginTop:16,textAlign:'center' }}>Apply Filters</button>
          </div>
        </>
      )}

      <style>{`
        @media(max-width:900px){ .desk-sidebar{display:none!important} .mob-filter-btn{display:flex!important} .shop-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:480px){ .shop-grid{gap:10px!important} }
      `}</style>
    </div>
  )
}
