import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background:'#2d1246', color:'#aaa', marginTop:64, fontFamily:'var(--hops-font)' }}>

      {/* NEWSLETTER STRIP */}
      <div style={{ background:'var(--hops-purple)', padding:'28px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:900, color:'#fff', marginBottom:4 }}>Get 10% OFF your first order!</h3>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>Subscribe for exclusive deals & new arrivals</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <input placeholder="Enter your email" style={{ padding:'10px 16px', borderRadius:4, border:'none', outline:'none', fontSize:13, fontWeight:600, fontFamily:'var(--hops-font)', width:220 }} />
            <button style={{ background:'#fff', color:'var(--hops-purple)', border:'none', padding:'10px 20px', borderRadius:4, fontSize:13, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER GRID */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'44px 24px 36px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.2fr', gap:36 }} className="ft-grid">

        {/* BRAND */}
        <div>
          <div style={{ fontFamily:'var(--hops-font-logo)', fontSize:26, marginBottom:14 }}>
            <span style={{ color:'#c084f5' }}>Basha</span><span style={{ color:'var(--hops-pink)' }}>Bos</span>
          </div>
          <p style={{ fontSize:13, lineHeight:1.8, fontWeight:600, color:'#888', marginBottom:18 }}>
            Premium kids fashion brand. BashaBos — Comfort. Quality. Style. Trusted by parents for stylish, breathable & long-lasting kids wear across India.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            {['📸','👍','🐦','▶️'].map((s, i) => (
              <a key={i} href="#" style={{ width:34, height:34, borderRadius:3, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, textDecoration:'none' }}>{s}</a>
            ))}
          </div>
        </div>

        {/* SHOP LINKS */}
        <div>
          <p style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Shop</p>
          <ul style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {[
              { l:'Co-ord Sets',  p:'/shop?sub=coord-set' },
              { l:'T-Shirts',     p:'/shop?sub=tshirt' },
              { l:'Polo Shirts',  p:'/shop?sub=polo' },
              { l:'New Arrivals', p:'/shop?new=true' },
              { l:'Sale 🔥',      p:'/shop?sale=true' },
            ].map(x => (
              <li key={x.l}><Link to={x.p} style={{ fontSize:13, fontWeight:600, color:'#888', transition:'color 0.15s' }}
                onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='#888'}>{x.l}</Link></li>
            ))}
          </ul>
        </div>

        {/* HELP */}
        <div>
          <p style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Help</p>
          <ul style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {['Size Guide','Track Order','Returns & Refunds','Contact Us','FAQs','Shipping Policy'].map(l => (
              <li key={l}><a href="#" style={{ fontSize:13, fontWeight:600, color:'#888' }}>{l}</a></li>
            ))}
          </ul>
        </div>

        {/* ABOUT + PAYMENTS */}
        <div>
          <p style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>About</p>
          <ul style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:22 }}>
            {['Our Story','Careers','Blog','Privacy Policy','Terms & Conditions'].map(l => (
              <li key={l}><a href="#" style={{ fontSize:13, fontWeight:600, color:'#888' }}>{l}</a></li>
            ))}
          </ul>
          <p style={{ fontSize:11, fontWeight:800, color:'#fff', textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>We Accept</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {['💳 Visa','💳 MC','🏦 UPI','📱 Paytm','💰 COD'].map(p => (
              <span key={p} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3, padding:'3px 8px', fontSize:11, fontWeight:700, color:'#ccc' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', maxWidth:1280, margin:'0 auto', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <p style={{ fontSize:13, fontWeight:600, color:'#666' }}>
          Design by <strong style={{ color:'#c084f5' }}>Ercetsoftsol</strong> © 2026
        </p>
        <p style={{ fontSize:13, fontWeight:600, color:'#666' }}>All prices inclusive of taxes</p>
      </div>

      <style>{`
        @media(max-width:1024px){ .ft-grid{grid-template-columns:1fr 1fr!important} }
        @media(max-width:600px){ .ft-grid{grid-template-columns:1fr 1fr!important;padding:28px 16px 20px!important;gap:20px!important} }
        @media(max-width:400px){ .ft-grid{grid-template-columns:1fr!important} }
      `}</style>
    </footer>
  )
}
