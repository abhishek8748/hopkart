import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, MapPin, Lock, ChevronRight, Tag, User, Phone, Mail } from 'lucide-react'
import { useCart } from '../context/CartContext'

const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Goa','Jammu & Kashmir']
const COUPONS = { BASHABOS20:20, KIDSFUN20:20, BASHABOS10:10 }

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', state:'', pincode:'' })
  const [errs, setErrs] = useState({})
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)

  const shipping = total >= 499 ? 0 : 49
  const disc     = applied ? Math.round(total * applied.pct / 100) : 0
  const grand    = total + shipping - disc

  const ch = e => { setForm(f => ({...f, [e.target.name]: e.target.value})); setErrs(v => ({...v, [e.target.name]:''})) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name    = 'Required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone || !/^\d{10}$/.test(form.phone))     e.phone = '10-digit phone required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim())    e.city    = 'Required'
    if (!form.state)          e.state   = 'Required'
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (COUPONS[code]) setApplied({ code, pct: COUPONS[code] })
    else alert('Invalid coupon! Try: BASHABOS20 or KIDSFUN20')
  }

  const loadRz = () => new Promise(res => {
    if (window.Razorpay) return res(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => res(true); s.onerror = () => res(false)
    document.body.appendChild(s)
  })

  const pay = async () => {
    if (!validate()) { window.scrollTo(0,0); return }
    setLoading(true)
    const ok = await loadRz()
    if (!ok) { alert('Payment gateway failed to load. Please check your internet.'); setLoading(false); return }
    const opts = {
      key: 'rzp_test_YOUR_KEY_HERE',  // ← Replace with your Razorpay key
      amount: grand * 100,
      currency: 'INR',
      name: 'BashaBos Kids Wear',
      description: `${cart.length} item(s)`,
      theme: { color: '#67218C' },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      notes: { address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}` },
      handler: resp => {
        clearCart()
        navigate('/order-success', { state: { paymentId: resp.razorpay_payment_id, amount: grand, items: cart, address: form } })
      },
      modal: { ondismiss: () => setLoading(false) },
    }
    const rzp = new window.Razorpay(opts)
    rzp.on('payment.failed', () => { alert('Payment failed. Please try again.'); setLoading(false) })
    rzp.open()
    setLoading(false)
  }

  if (cart.length === 0) return (
    <div style={{ textAlign:'center', padding:'100px 20px' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🛒</div>
      <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Cart is empty!</h2>
      <Link to="/shop" style={{ background:'var(--purple)', color:'#fff', padding:'12px 28px', borderRadius:50, fontWeight:800, fontSize:14, textDecoration:'none', display:'inline-block', marginTop:8 }}>Browse Products</Link>
    </div>
  )

  const inp = (err) => ({
    width:'100%', padding:'11px 13px', border:`1.5px solid ${err?'var(--red)':'#e5e7eb'}`, borderRadius:8,
    fontSize:13, fontWeight:600, outline:'none', fontFamily:'Nunito,sans-serif', color:'#111',
    background: err ? '#fef2f2' : '#fafafa', transition:'border-color 0.2s'
  })

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 20px 80px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#999', fontWeight:600, marginBottom:22, flexWrap:'wrap' }}>
        <Link to="/" style={{color:'#999'}}>Home</Link><ChevronRight size={12}/>
        <Link to="/shop" style={{color:'#999'}}>Shop</Link><ChevronRight size={12}/>
        <span style={{color:'#333'}}>Checkout</span>
      </div>

      <h1 style={{ fontSize:26, fontWeight:900, color:'#111', marginBottom:26 }}>Checkout</h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:26, alignItems:'flex-start' }} className="co-grid">

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* ADDRESS */}
          <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:14, padding:24 }}>
            <h2 style={{ fontSize:16, fontWeight:900, color:'#111', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <MapPin size={17} color="var(--purple)"/> Delivery Address
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { n:'name',    l:'Full Name *',        ph:'Rahul Sharma',   ic:<User size={14} color="#bbb"/>,  full:false },
                { n:'phone',   l:'Phone Number *',     ph:'9876543210',     ic:<Phone size={14} color="#bbb"/>, full:false, t:'tel', max:10 },
                { n:'email',   l:'Email Address *',    ph:'rahul@email.com',ic:<Mail size={14} color="#bbb"/>,  full:true,  t:'email' },
              ].map(f => (
                <div key={f.n} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                  <label style={{ fontSize:11, fontWeight:800, color:'#666', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 }}>{f.l}</label>
                  <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                    <div style={{ position:'absolute', left:11, pointerEvents:'none' }}>{f.ic}</div>
                    <input name={f.n} type={f.t||'text'} placeholder={f.ph} value={form[f.n]} onChange={ch} maxLength={f.max}
                      style={{ ...inp(errs[f.n]), paddingLeft:32 }}
                      onFocus={e => e.target.style.borderColor='var(--purple)'}
                      onBlur={e => e.target.style.borderColor=errs[f.n]?'var(--red)':'#e5e7eb'} />
                  </div>
                  {errs[f.n] && <p style={{ fontSize:11, color:'var(--red)', fontWeight:700, marginTop:3 }}>{errs[f.n]}</p>}
                </div>
              ))}

              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, fontWeight:800, color:'#666', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 }}>Full Address *</label>
                <textarea name="address" placeholder="House No, Street, Area, Landmark" value={form.address} onChange={ch} rows={3}
                  style={{ ...inp(errs.address), resize:'vertical', minHeight:78 }}
                  onFocus={e => e.target.style.borderColor='var(--purple)'}
                  onBlur={e => e.target.style.borderColor=errs.address?'var(--red)':'#e5e7eb'} />
                {errs.address && <p style={{ fontSize:11, color:'var(--red)', fontWeight:700, marginTop:3 }}>{errs.address}</p>}
              </div>

              {[
                { n:'city',    l:'City *',    ph:'Mumbai' },
                { n:'pincode', l:'Pincode *', ph:'400001', max:6, t:'tel' },
              ].map(f => (
                <div key={f.n}>
                  <label style={{ fontSize:11, fontWeight:800, color:'#666', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 }}>{f.l}</label>
                  <input name={f.n} type={f.t||'text'} placeholder={f.ph} value={form[f.n]} onChange={ch} maxLength={f.max}
                    style={inp(errs[f.n])}
                    onFocus={e => e.target.style.borderColor='var(--purple)'}
                    onBlur={e => e.target.style.borderColor=errs[f.n]?'var(--red)':'#e5e7eb'} />
                  {errs[f.n] && <p style={{ fontSize:11, color:'var(--red)', fontWeight:700, marginTop:3 }}>{errs[f.n]}</p>}
                </div>
              ))}

              <div>
                <label style={{ fontSize:11, fontWeight:800, color:'#666', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 }}>State *</label>
                <select name="state" value={form.state} onChange={ch} style={{ ...inp(errs.state), cursor:'pointer' }}
                  onFocus={e => e.target.style.borderColor='var(--purple)'}
                  onBlur={e => e.target.style.borderColor=errs.state?'var(--red)':'#e5e7eb'}>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errs.state && <p style={{ fontSize:11, color:'var(--red)', fontWeight:700, marginTop:3 }}>{errs.state}</p>}
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:14, padding:24 }}>
            <h2 style={{ fontSize:16, fontWeight:900, color:'#111', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Lock size={17} color="var(--purple)"/> Payment Method
            </h2>
            <p style={{ fontSize:13, color:'#999', fontWeight:600, marginBottom:14 }}>All payments processed securely via Razorpay</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { ic:'💳', l:'Credit / Debit Card', s:'Visa, Mastercard, RuPay, Amex' },
                { ic:'📱', l:'UPI',                  s:'GPay, PhonePe, Paytm, BHIM' },
                { ic:'🏦', l:'Net Banking',           s:'All major banks' },
                { ic:'👛', l:'Wallets',               s:'Paytm, Amazon Pay, Mobikwik' },
                { ic:'📦', l:'Buy Now Pay Later',     s:'Simpl, LazyPay' },
              ].map(m => (
                <div key={m.l} style={{ display:'flex', alignItems:'center', gap:12, background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:10, padding:'11px 14px' }}>
                  <span style={{ fontSize:20 }}>{m.ic}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:800, color:'#111' }}>{m.l}</p>
                    <p style={{ fontSize:11, color:'#999', fontWeight:600 }}>{m.s}</p>
                  </div>
                  <span style={{ color:'var(--green)', fontWeight:800 }}>✓</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize:12, color:'#555', fontWeight:600, marginTop:14, background:'var(--green-light)', padding:'10px 13px', borderRadius:8, lineHeight:1.6 }}>
              🔒 Your payment is 256-bit SSL encrypted and processed securely via <strong>Razorpay</strong>. Card details are never stored.
            </p>
          </div>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:14, padding:22, position:'sticky', top:80 }}>
          <h2 style={{ fontSize:16, fontWeight:900, color:'#111', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <ShoppingBag size={17} color="var(--purple)"/> Order Summary
          </h2>

          {/* ITEMS */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:240, overflowY:'auto', marginBottom:18, paddingRight:2 }}>
            {cart.map((item, i) => {
              const d = Math.round(((item.mrp-item.price)/item.mrp)*100)
              return (
                <div key={i} style={{ display:'flex', gap:10, background:'#fafafa', borderRadius:10, padding:10, border:'1px solid #f0f0f0' }}>
                  <div style={{ width:58, height:65, borderRadius:7, overflow:'hidden', flexShrink:0, background:'#f0f0f0' }}>
                    {item.images?.[0] && <img src={item.images[0]} alt={item.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:800, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{item.name}</p>
                    <p style={{ fontSize:10, color:'#999', fontWeight:600, marginBottom:4 }}>{item.color} · Size: {item.size} · Qty: {item.qty}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:14, fontWeight:900, color:'#111' }}>₹{item.price * item.qty}</span>
                      <span style={{ fontSize:10, color:'var(--green)', fontWeight:800 }}>{d}% off</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* COUPON */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', gap:7, background:'#f5f5f7', borderRadius:8, padding:'0 12px', border:'1.5px solid #e5e7eb' }}>
                <Tag size={13} color="#999"/>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code"
                  onKeyDown={e => e.key==='Enter' && applyCoupon()}
                  style={{ background:'none', border:'none', outline:'none', fontSize:12, fontWeight:700, color:'#111', flex:1, padding:'9px 0', fontFamily:'Nunito,sans-serif' }} />
              </div>
              <button onClick={applyCoupon} style={{ background:'#111', color:'#fff', border:'none', padding:'9px 14px', borderRadius:8, fontSize:12, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap' }}>Apply</button>
            </div>
            {applied && <p style={{ fontSize:11, color:'var(--green)', fontWeight:800, marginTop:5 }}>🎉 {applied.code} applied! {applied.pct}% off</p>}
            <p style={{ fontSize:10, color:'#bbb', fontWeight:600, marginTop:4 }}>Try: BASHABOS20 · KIDSFUN20</p>
          </div>

          {/* PRICE */}
          <div style={{ borderTop:'1px dashed #e5e7eb', paddingTop:12, display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'#666' }}>
              <span>Subtotal ({cart.reduce((n,i)=>n+i.qty,0)} items)</span><span>₹{total}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'#666' }}>
              <span>Shipping</span>
              <span style={{ color: shipping===0 ? 'var(--green)' : '#666', fontWeight: shipping===0 ? 800 : 600 }}>{shipping===0?'FREE 🎉':`₹${shipping}`}</span>
            </div>
            {disc > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, color:'var(--green)' }}>
                <span>Coupon Discount</span><span>−₹{disc}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900, color:'#111', borderTop:'1px solid #e5e7eb', paddingTop:10, marginTop:4 }}>
              <span>Total</span><span>₹{grand}</span>
            </div>
            {disc > 0 && <p style={{ fontSize:11, color:'var(--green)', fontWeight:700 }}>✅ You're saving ₹{disc + (total>=499?49:0)} on this order!</p>}
          </div>

          <button onClick={pay} disabled={loading}
            style={{ width:'100%', background: loading ? '#ccc' : 'var(--purple)', color:'#fff', border:'none', padding:'15px', borderRadius:50, fontSize:15, fontWeight:900, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10, transition:'background 0.2s' }}>
            <Lock size={16}/> {loading ? 'Opening Payment...' : `Pay ₹${grand} Securely`}
          </button>
          <div style={{ display:'flex', justifyContent:'center', gap:18, fontSize:11, fontWeight:700, color:'#bbb' }}>
            <span>🔐 SSL Secured</span><span>🏦 Razorpay</span><span>✅ Safe</span>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.co-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
