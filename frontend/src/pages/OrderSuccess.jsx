// OrderSuccess.jsx
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react'

export function OrderSuccess() {
  const { state } = useLocation()
  if (!state) return <div style={{textAlign:'center',padding:'80px 20px'}}><Link to="/" style={{color:'var(--purple)',fontWeight:800}}>Go Home</Link></div>
  const { paymentId, amount, items, address } = state
  const orderId = 'BB' + Date.now().toString().slice(-8)
  const steps = [
    { icon:<CheckCircle size={18}/>, label:'Order Placed',  done:true },
    { icon:<Package size={18}/>,     label:'Processing',    done:false },
    { icon:<Truck size={18}/>,       label:'Shipped',       done:false },
    { icon:<Home size={18}/>,        label:'Delivered',     done:false },
  ]
  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'linear-gradient(135deg,#f3e6fa 0%,#fff 50%,#f0fdf4 100%)' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:40, maxWidth:640, width:'100%', boxShadow:'0 16px 60px rgba(103,33,140,0.1)', border:'1px solid #f0e0fa' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:88, height:88, borderRadius:'50%', background:'#f0fdf4', border:'3px solid #22c55e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'pop 0.5s ease' }}>
            <CheckCircle size={46} color="#22c55e"/>
          </div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#111', marginBottom:8 }}>Order Placed! 🎉</h1>
          <p style={{ fontSize:14, color:'#666', fontWeight:600 }}>Your order has been placed successfully.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {[['Order ID',orderId],['Amount Paid',`₹${amount}`], paymentId&&['Payment ID',paymentId],['Delivery','5–7 Business Days']].filter(Boolean).map(([k,v]) => (
            <div key={k} style={{ background:'var(--purple-light)', border:'1px solid #e0c8f0', borderRadius:10, padding:'12px 14px' }}>
              <p style={{ fontSize:10, fontWeight:800, color:'#999', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{k}</p>
              <p style={{ fontSize:13, fontWeight:900, color: k==='Amount Paid' ? 'var(--purple)' : '#111', wordBreak:'break-all' }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:13, fontWeight:800, color:'#111', marginBottom:16 }}>Order Tracking</p>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, position:'relative' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background: s.done ? 'var(--purple)' : '#f0f0f0', color: s.done ? '#fff' : '#999', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, marginBottom:8 }}>{s.icon}</div>
                <p style={{ fontSize:10, fontWeight:700, color: s.done ? 'var(--purple)' : '#bbb', textAlign:'center' }}>{s.label}</p>
                {i < steps.length-1 && <div style={{ position:'absolute', top:20, left:'50%', width:'100%', height:2, background: s.done ? 'var(--purple)' : '#f0f0f0', zIndex:0 }} />}
              </div>
            ))}
          </div>
        </div>
        {items?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:800, color:'#111', marginBottom:12 }}>Items Ordered</p>
            {items.map((item, i) => (
              <div key={i} style={{ display:'flex', gap:10, background:'#fafafa', borderRadius:10, padding:10, border:'1px solid #f0f0f0', marginBottom:8 }}>
                <div style={{ width:52, height:60, borderRadius:7, overflow:'hidden', background:'#f5f5f5', flexShrink:0 }}>
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }}/> : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:22}}>👕</div>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:'#111' }}>{item.name}</p>
                  <p style={{ fontSize:11, color:'#999', fontWeight:600 }}>{item.color} · Size: {item.size} · Qty: {item.qty}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:900, color:'var(--purple)', flexShrink:0 }}>₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>
        )}
        {address && (
          <div style={{ background:'var(--purple-light)', borderRadius:10, padding:14, marginBottom:22, border:'1px solid #e0c8f0' }}>
            <p style={{ fontSize:12, fontWeight:800, color:'var(--purple)', marginBottom:6 }}>📦 Delivery Address</p>
            <p style={{ fontSize:12, color:'#555', fontWeight:600, lineHeight:1.8 }}>{address.name}<br/>{address.address}, {address.city}<br/>{address.state} — {address.pincode}<br/>📞 {address.phone}</p>
          </div>
        )}
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/shop" style={{ flex:1, background:'var(--purple)', color:'#fff', padding:'13px', borderRadius:50, fontSize:14, fontWeight:800, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <ShoppingBag size={15}/> Continue Shopping
          </Link>
          <Link to="/" style={{ flex:1, background:'var(--purple-light)', color:'var(--purple)', padding:'13px', borderRadius:50, fontSize:14, fontWeight:800, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8, border:'2px solid #e0c8f0' }}>
            <Home size={15}/> Back to Home
          </Link>
        </div>
        <p style={{ fontSize:11, color:'#bbb', fontWeight:600, textAlign:'center', marginTop:14 }}>📧 Confirmation sent to <strong>{address?.email}</strong></p>
      </div>
      <style>{`@keyframes pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
