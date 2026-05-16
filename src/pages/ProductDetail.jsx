import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart, ShoppingBag, Star, Truck, RefreshCw, Shield,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Share2, MapPin, CheckCircle, ZoomIn, X
} from 'lucide-react'
import { products, sizeChart, reviews } from '../data/products'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const { add, toggleWish, isWished } = useCart()

  const [imgIdx, setImgIdx]       = useState(0)
  const [zoom, setZoom]           = useState(false)
  const [size, setSize]           = useState(null)
  const [sizeErr, setSizeErr]     = useState(false)
  const [pincode, setPincode]     = useState('')
  const [pinRes, setPinRes]       = useState(null)
  const [checkingPin, setChkPin]  = useState(false)
  const [added, setAdded]         = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [tab, setTab]             = useState('details')
  const [helpfuls, setHelpfuls]   = useState({})
  const [copied, setCopied]       = useState(false)
  const [openSec, setOpenSec]     = useState({ desc:true, care:false, returns:false })

  if (!product) return (
    <div style={{ textAlign:'center', padding:'100px 20px' }}>
      <p style={{ fontSize:64, marginBottom:16 }}>😕</p>
      <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Product not found</h2>
      <Link to="/shop" style={{ color:'var(--purple)', fontWeight:700 }}>← Back to Shop</Link>
    </div>
  )

  const disc    = Math.round(((product.mrp - product.price) / product.mrp) * 100)
  const wished  = isWished(product.id)
  const chart   = sizeChart[product.sub] || sizeChart.tshirt
  const related = products.filter(p => p.sub === product.sub && p.id !== product.id).slice(0, 4)

  // Save = original - selling price × qty (assume 1)
  const savings = product.mrp - product.price

  const handleAdd = () => {
    if (!size) { setSizeErr(true); setTimeout(() => setSizeErr(false), 2500); return }
    add({ ...product, size })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  const handleBuyNow = () => {
    if (!size) { setSizeErr(true); setTimeout(() => setSizeErr(false), 2500); return }
    add({ ...product, size })
    window.location.href = '/checkout'
  }
  const checkPin = () => {
    if (pincode.length !== 6) return
    setChkPin(true); setPinRes(null)
    setTimeout(() => {
      setChkPin(false)
      const ok = ['4','5','6','1','2','3','7','8'].includes(pincode[0])
      setPinRes(ok
        ? { ok:true,  msg:`✅ Delivery in ${product.deliveryDays||5}–${(product.deliveryDays||5)+2} business days` }
        : { ok:false, msg:'❌ Delivery not available at this pincode' }
      )
    }, 900)
  }
  const share = () => {
    if (navigator.share) { navigator.share({ title: product.name, url: window.location.href }) }
    else { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  const markHelpful = (rid) => setHelpfuls(h => ({ ...h, [rid]: true }))

  const toggleSec = key => setOpenSec(s => ({ ...s, [key]: !s[key] }))

  /* ─── rating breakdown ─── */
  const ratingDist = { 5:62, 4:22, 3:10, 2:4, 1:2 }

  return (
    <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 20px 80px' }}>

      {/* BREADCRUMB */}
      <nav style={{ display:'flex', alignItems:'center', gap:5, padding:'14px 0', fontSize:12, color:'#999', fontWeight:600, flexWrap:'wrap' }}>
        <Link to="/" style={{ color:'#999' }}>Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" style={{ color:'#999' }}>Shop</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?sub=${product.sub}`} style={{ color:'#999', textTransform:'capitalize' }}>{product.sub.replace('-',' ')}</Link>
        <ChevronRight size={12} />
        <span style={{ color:'#333' }}>{product.name}</span>
      </nav>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'flex-start' }} className="pdp-grid">

        {/* ── LEFT: IMAGE GALLERY ── */}
        <div>
          {/* MAIN IMAGE */}
          <div style={{ position:'relative', borderRadius:16, overflow:'hidden', background:'#f7f7f7', aspectRatio:'1/1', cursor:'zoom-in' }}
            onClick={() => setZoom(true)}>
            {product.images?.[imgIdx]
              ? <img src={product.images[imgIdx]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', transition:'transform 0.4s' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:100, opacity:0.12, color:'var(--purple)', fontWeight:900 }}>B</div>
            }
            {disc > 0 && <span style={{ position:'absolute', top:14, left:14, background:'var(--pink)', color:'#fff', fontSize:13, fontWeight:800, padding:'4px 12px', borderRadius:6 }}>{disc}% OFF</span>}
            {product.isNew && <span style={{ position:'absolute', top: disc>0 ? 50:14, left:14, background:'var(--orange)', color:'#fff', fontSize:13, fontWeight:800, padding:'4px 12px', borderRadius:6 }}>NEW</span>}
            <button style={{ position:'absolute', bottom:14, right:14, background:'rgba(255,255,255,0.85)', border:'none', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:5, cursor:'pointer', color:'#555' }}>
              <ZoomIn size={14} /> Zoom
            </button>
            {/* PREV/NEXT */}
            {product.images?.length > 1 && <>
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i-1+product.images.length)%product.images.length) }}
                style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.88)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                <ChevronLeft size={17} />
              </button>
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i+1)%product.images.length) }}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.88)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                <ChevronRight size={17} />
              </button>
            </>}
          </div>

          {/* THUMBNAILS */}
          {product.images?.length > 1 && (
            <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)}
                  style={{ width:76, height:76, borderRadius:9, overflow:'hidden', cursor:'pointer', border:`2px solid ${i===imgIdx ? 'var(--purple)' : '#e5e7eb'}`, background:'#f7f7f7', flexShrink:0, transition:'border-color 0.15s' }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                </div>
              ))}
            </div>
          )}

          {/* SHARE BUTTONS */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:16 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#999' }}>Share:</span>
            <button onClick={share} style={{ display:'flex', alignItems:'center', gap:6, background:'#f5f5f7', border:'none', borderRadius:50, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', color:'#555' }}>
              <Share2 size={13} /> {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* ── RIGHT: PRODUCT INFO ── */}
        <div>
          {/* BRAND + RATING STRIP */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <Link to={`/shop?brand=${product.brand}`} style={{ fontSize:13, fontWeight:800, color:'var(--purple)', textTransform:'uppercase', letterSpacing:0.6 }}>{product.brand}</Link>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#f59e0b', color:'#fff', borderRadius:6, padding:'3px 9px', fontWeight:800, fontSize:12 }}>
                <Star size={11} fill="#fff" color="#fff" /> {product.rating}
              </div>
              <span style={{ fontSize:12, color:'#999', fontWeight:600 }}>{product.reviews} ratings</span>
            </div>
          </div>

          {/* NAME */}
          <h1 style={{ fontSize:24, fontWeight:900, color:'#111', lineHeight:1.2, marginBottom:6 }}>{product.name}</h1>
          <p style={{ fontSize:13, color:'#666', fontWeight:600, marginBottom:14 }}>
            Color: <strong style={{ color:'#333' }}>{product.color}</strong>
            &nbsp;·&nbsp;{product.ageRange}
            &nbsp;·&nbsp;{product.fabric}
          </p>

          {/* PRICE BOX */}
          <div style={{ background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:12, padding:'16px 18px', marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:8 }}>
              <span style={{ fontSize:32, fontWeight:900, color:'#111' }}>₹{product.price}</span>
              <span style={{ fontSize:18, color:'#bbb', textDecoration:'line-through', fontWeight:600 }}>₹{product.mrp}</span>
              <span style={{ background:'var(--pink-light)', color:'var(--pink)', fontSize:14, fontWeight:800, padding:'4px 12px', borderRadius:6 }}>{disc}% off</span>
            </div>
            <div style={{ display:'flex', gap:16, fontSize:13, fontWeight:700 }}>
              <span style={{ color:'var(--green)' }}>✅ You save ₹{savings}</span>
              <span style={{ color:'#999' }}>Incl. all taxes</span>
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <p style={{ fontSize:14, fontWeight:800, color:'#111' }}>
                Size {size && <span style={{ color:'var(--purple)', marginLeft:6 }}>— {size}</span>}
              </p>
              <button onClick={() => setShowChart(!showChart)}
                style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'var(--purple)', background:'var(--purple-light)', border:'none', padding:'5px 12px', borderRadius:50, cursor:'pointer' }}>
                📏 Size Chart
              </button>
            </div>

            {sizeErr && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'9px 14px', marginBottom:10, fontSize:12, color:'var(--red)', fontWeight:700 }}>
                ⚠️ Please select a size to add to cart
              </div>
            )}

            <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  style={{
                    padding:'9px 18px', borderRadius:8, fontSize:14, fontWeight:800, cursor:'pointer', transition:'all 0.15s',
                    background: size===s ? 'var(--purple)' : '#fff',
                    color:      size===s ? '#fff' : '#333',
                    border:     size===s ? '2px solid var(--purple)' : '2px solid #e5e7eb',
                    transform:  size===s ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  {s}
                </button>
              ))}
            </div>

            {/* SIZE CHART TABLE */}
            {showChart && (
              <div style={{ marginTop:14, background:'#fafafa', borderRadius:12, padding:16, border:'1px solid #e5e7eb', overflowX:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#111' }}>📏 {chart.title}</p>
                  <button onClick={() => setShowChart(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#999' }}><X size={16}/></button>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>{chart.headers.map(h => <th key={h} style={{ background:'var(--purple)', color:'#fff', padding:'8px 10px', textAlign:'center', fontWeight:800, fontSize:11 }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, i) => (
                      <tr key={i} style={{ background: i%2===0 ? '#fff' : '#f9f5ff' }}>
                        {row.map((cell, j) => <td key={j} style={{ padding:'8px 10px', textAlign:'center', fontWeight:600, color:'#333', border:'1px solid #e5e7eb' }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize:10, color:'#999', marginTop:8, fontWeight:600 }}>* Measurements may vary ±0.5 to 1 inch due to manual measurement</p>
              </div>
            )}
          </div>

          {/* PINCODE CHECKER */}
          <div style={{ background:'#f9f9f9', borderRadius:12, padding:14, marginBottom:20, border:'1px solid #e5e7eb' }}>
            <p style={{ fontSize:13, fontWeight:800, color:'#333', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <MapPin size={14} color="var(--purple)" /> Check Delivery
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <input
                value={pincode}
                onChange={e => { setPincode(e.target.value.replace(/\D/g,'').slice(0,6)); setPinRes(null) }}
                onKeyDown={e => e.key==='Enter' && checkPin()}
                placeholder="Enter 6-digit pincode" maxLength={6}
                style={{ flex:1, border:'1.5px solid #e5e7eb', borderRadius:8, padding:'9px 13px', fontSize:13, fontWeight:600, outline:'none', background:'#fff', transition:'border-color 0.2s', fontFamily:'Nunito, sans-serif' }}
                onFocus={e => e.target.style.borderColor='var(--purple)'}
                onBlur={e => e.target.style.borderColor='#e5e7eb'}
              />
              <button onClick={checkPin} disabled={pincode.length!==6||checkingPin}
                style={{ background: pincode.length===6 ? '#111' : '#e5e7eb', color: pincode.length===6 ? '#fff' : '#999', border:'none', borderRadius:8, padding:'9px 18px', fontSize:13, fontWeight:800, cursor: pincode.length===6 ? 'pointer' : 'not-allowed', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                {checkingPin ? '...' : 'Check'}
              </button>
            </div>
            {pinRes && <p style={{ fontSize:12, fontWeight:700, color: pinRes.ok ? 'var(--green)' : 'var(--red)', marginTop:8 }}>{pinRes.msg}</p>}
          </div>

          {/* CART + WISHLIST BUTTONS */}
          <div style={{ display:'flex', gap:12, marginBottom:12 }}>
            <button onClick={handleAdd}
              style={{ flex:1, background: added ? 'var(--green)' : 'transparent', color: added ? '#fff' : 'var(--purple)', border:`2px solid ${added ? 'var(--green)' : 'var(--purple)'}`, padding:'14px', borderRadius:50, fontSize:15, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s' }}>
              <ShoppingBag size={18} /> {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            <button onClick={() => toggleWish(product)}
              style={{ width:52, height:52, borderRadius:'50%', border:`2px solid ${wished ? 'var(--pink)' : '#e5e7eb'}`, background: wished ? 'var(--pink-light)' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
              <Heart size={20} fill={wished ? 'var(--pink)' : 'none'} color={wished ? 'var(--pink)' : '#999'} />
            </button>
          </div>

          <button onClick={handleBuyNow}
            style={{ width:'100%', background:'var(--purple)', color:'#fff', border:'none', padding:'16px', borderRadius:50, fontSize:16, fontWeight:900, cursor:'pointer', marginBottom:20, transition:'background 0.2s' }}>
            Buy Now
          </button>

          {/* TRUST BADGES */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:22 }}>
            {[
              { icon:<Truck size={17} color="var(--purple)"/>, title:'Free Delivery', sub:'above ₹499' },
              { icon:<RefreshCw size={17} color="var(--purple)"/>, title:'30 Day Returns', sub:'Easy returns' },
              { icon:<Shield size={17} color="var(--purple)"/>, title:'100% Authentic', sub:'BashaBos original' },
            ].map(g => (
              <div key={g.title} style={{ background:'var(--purple-light)', borderRadius:10, padding:'12px 10px', textAlign:'center' }}>
                <div style={{ marginBottom:5, display:'flex', justifyContent:'center' }}>{g.icon}</div>
                <p style={{ fontSize:11, fontWeight:800, color:'#333' }}>{g.title}</p>
                <p style={{ fontSize:10, color:'#999', fontWeight:600, marginTop:1 }}>{g.sub}</p>
              </div>
            ))}
          </div>

          {/* HIGHLIGHTS */}
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'13px 16px', marginBottom:18 }}>
            <p style={{ fontSize:12, fontWeight:800, color:'var(--green)', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Product Highlights</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {product.highlights.map(h => (
                <span key={h} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#333' }}>
                  <CheckCircle size={12} color="var(--green)" /> {h}
                </span>
              ))}
            </div>
          </div>

          {/* ACCORDION SECTIONS */}
          {[
            { key:'desc',    label:'Product Description', content: product.desc },
            { key:'care',    label:'Care Instructions',   content: product.care },
            { key:'returns', label:'Returns & Exchange',  content: 'Easy 30-day returns. Item must be unused, unwashed, with original tags. Initiate return through My Orders. Refund processed in 3–5 business days.' },
          ].map(sec => (
            <div key={sec.key} style={{ borderTop:'1px solid #f0f0f0', paddingTop:14, marginTop:14 }}>
              <button onClick={() => toggleSec(sec.key)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                <span style={{ fontSize:14, fontWeight:800, color:'#111' }}>{sec.label}</span>
                {openSec[sec.key] ? <ChevronUp size={17} color="#999"/> : <ChevronDown size={17} color="#999"/>}
              </button>
              {openSec[sec.key] && <p style={{ fontSize:13, color:'#666', fontWeight:600, lineHeight:1.75, marginTop:10 }}>{sec.content}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS: DETAILS / REVIEWS ── */}
      <div style={{ marginTop:52, borderTop:'2px solid #f0f0f0', paddingTop:32 }}>
        <div style={{ display:'flex', borderBottom:'2px solid #f0f0f0', marginBottom:30, gap:0 }}>
          {['details','reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'12px 28px', fontSize:15, fontWeight:800, color: tab===t ? 'var(--purple)' : '#999', background:'none', border:'none', cursor:'pointer', borderBottom: tab===t ? '3px solid var(--purple)' : '3px solid transparent', marginBottom:-2, textTransform:'capitalize', transition:'color 0.15s' }}>
              {t==='reviews' ? `Reviews (${product.reviews})` : 'Product Details'}
            </button>
          ))}
        </div>

        {/* DETAILS TAB */}
        {tab === 'details' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }} className="tab-grid">
            <div>
              <h3 style={{ fontSize:16, fontWeight:900, color:'#111', marginBottom:14 }}>Product Information</h3>
              {[
                ['Brand', product.brand],
                ['Category', product.sub.replace('-',' ')],
                ['Fabric', product.fabric],
                ['Fit', product.fit],
                ['Print', product.print],
                ['Age Range', product.ageRange],
                ['Color', product.color],
                ['Care', product.care],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', padding:'10px 0', borderBottom:'1px solid #f5f5f5', gap:16 }}>
                  <span style={{ width:130, fontWeight:700, color:'#999', fontSize:13, flexShrink:0 }}>{k}</span>
                  <span style={{ fontWeight:700, color:'#333', fontSize:13, textTransform: k==='Category' ? 'capitalize' : 'none' }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ fontSize:16, fontWeight:900, color:'#111', marginBottom:14 }}>Size Chart</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>{chart.headers.map(h => <th key={h} style={{ background:'var(--purple)', color:'#fff', padding:'9px 12px', textAlign:'center', fontWeight:800 }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, i) => (
                      <tr key={i} style={{ background: i%2===0 ? '#fff' : '#f9f5ff' }}>
                        {row.map((cell, j) => <td key={j} style={{ padding:'9px 12px', textAlign:'center', fontWeight:600, color:'#333', border:'1px solid #e5e7eb' }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize:11, color:'#999', marginTop:8, fontWeight:600 }}>* Measurements may vary ±0.5–1 inch</p>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div>
            {/* RATING SUMMARY */}
            <div style={{ display:'flex', gap:36, alignItems:'flex-start', marginBottom:36, flexWrap:'wrap' }}>
              <div style={{ textAlign:'center', minWidth:120 }}>
                <p style={{ fontSize:64, fontWeight:900, color:'#111', lineHeight:1 }}>{product.rating}</p>
                <div style={{ display:'flex', justifyContent:'center', gap:3, margin:'6px 0' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={18} fill={i<=Math.round(product.rating)?'#f59e0b':'none'} color={i<=Math.round(product.rating)?'#f59e0b':'#ddd'}/>)}
                </div>
                <p style={{ fontSize:12, color:'#999', fontWeight:600 }}>{product.reviews} ratings</p>
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                {[5,4,3,2,1].map(star => (
                  <div key={star} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#666', width:8, flexShrink:0 }}>{star}</span>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <div style={{ flex:1, background:'#f0f0f0', borderRadius:50, height:8, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:'#f59e0b', width:`${ratingDist[star]}%`, borderRadius:50 }} />
                    </div>
                    <span style={{ fontSize:11, color:'#999', fontWeight:600, width:28, flexShrink:0 }}>{ratingDist[star]}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* INDIVIDUAL REVIEWS */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background:'#fafafa', borderRadius:12, padding:20, border:'1px solid #f0f0f0' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:15, flexShrink:0 }}>{r.avatar}</div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:800, color:'#111' }}>{r.name}</p>
                        <div style={{ display:'flex', gap:2, marginTop:2 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i<=r.rating?'#f59e0b':'none'} color={i<=r.rating?'#f59e0b':'#ddd'}/>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {r.verified && <span style={{ fontSize:11, color:'var(--green)', fontWeight:700, background:'var(--green-light)', padding:'2px 9px', borderRadius:50, border:'1px solid #bbf7d0' }}>✓ Verified Purchase</span>}
                      <span style={{ fontSize:11, color:'#bbb', fontWeight:600 }}>{r.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize:14, fontWeight:800, color:'#111', marginBottom:5 }}>{r.title}</p>
                  <p style={{ fontSize:13, color:'#555', fontWeight:600, lineHeight:1.7, marginBottom:10 }}>{r.body}</p>
                  {r.images?.length > 0 && (
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      {r.images.map((img,i) => (
                        <div key={i} style={{ width:64, height:64, borderRadius:7, overflow:'hidden' }}>
                          <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'#999', fontWeight:600 }}>Was this helpful?</span>
                    {helpfuls[r.id]
                      ? <span style={{ fontSize:11, color:'var(--green)', fontWeight:700 }}>✓ Thanks!</span>
                      : <button onClick={() => markHelpful(r.id)} style={{ fontSize:11, color:'var(--purple)', fontWeight:700, background:'var(--purple-light)', border:'none', padding:'3px 10px', borderRadius:50, cursor:'pointer' }}>👍 Yes ({r.helpful})</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div style={{ marginTop:56 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <h2 style={{ fontSize:22, fontWeight:900, color:'#111' }}>You May Also Like</h2>
            <Link to={`/shop?sub=${product.sub}`} style={{ fontSize:13, fontWeight:800, color:'var(--purple)' }}>View All →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="rel-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoom && (
        <div onClick={() => setZoom(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out' }}>
          <img src={product.images?.[imgIdx]} alt={product.name} style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain', borderRadius:12 }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setZoom(false)} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <X size={20} />
          </button>
        </div>
      )}

      <style>{`
        @media(max-width:900px){.pdp-grid{grid-template-columns:1fr!important;gap:24px!important}.tab-grid{grid-template-columns:1fr!important}.rel-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:480px){.rel-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}}
      `}</style>
    </div>
  )
}
