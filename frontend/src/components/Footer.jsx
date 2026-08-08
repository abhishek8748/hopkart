import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background:'var(--bb-navy)', color:'#aaa', marginTop:64, fontFamily:'var(--bb-font)' }}>

      {/* NEWSLETTER STRIP — BB blue */}
      <div style={{ background:'var(--bb-blue)', padding:'28px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:900, color:'#fff', marginBottom:4 }}>Get 10% OFF your first order!</h3>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>Subscribe for exclusive deals & new arrivals</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <input placeholder="Enter your email" style={{ padding:'10px 16px', borderRadius:6, border:'none', outline:'none', fontSize:13, fontWeight:600, fontFamily:'var(--bb-font)', width:220 }} />
            <button style={{ background:'var(--bb-yellow)', color:'var(--bb-navy)', border:'none', padding:'10px 20px', borderRadius:6, fontSize:13, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER GRID */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'44px 24px 36px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.2fr', gap:36 }} className="ft-grid">

        {/* BRAND */}
        <div>
          {/* Logo + name */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <img src="/bb-logo.png" alt="BashaBos" style={{ height:50, width:'auto', objectFit:'contain' }} />
            <span style={{
              fontFamily:'var(--bb-font-logo)',
              fontWeight:900,
              fontSize:22,
              WebkitTextStroke:'0.6px #000',
              textShadow:'0 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000',
            }}>
              <span style={{ color:'var(--bb-red)' }}>Basha</span><span style={{ color:'var(--bb-orange)' }}>Bos</span>
            </span>
          </div>
          <p style={{ fontSize:13, lineHeight:1.8, fontWeight:600, color:'#888', marginBottom:18 }}>
            Premium kids fashion brand. BashaBos — Comfort. Quality. Style. Trusted by parents for stylish, breathable & long-lasting kids wear across India.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            {['📸','👍','🐦','▶️'].map((s, i) => (
              <a key={i} href="#" style={{ width:34, height:34, borderRadius:6, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, textDecoration:'none' }}>{s}</a>
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
                onMouseEnter={e => e.target.style.color='var(--bb-yellow)'} onMouseLeave={e => e.target.style.color='#888'}>{x.l}</Link></li>
            ))}
          </ul>
        </div>

        {/* HELP */}
        <div>
          <p style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Help</p>
          <ul style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {['Size Guide','Shipping Policy','Return & Refund','Track Order','Contact Us'].map(x => (
              <li key={x}><a href="#" style={{ fontSize:13, fontWeight:600, color:'#888', transition:'color 0.15s' }}
                onMouseEnter={e => e.target.style.color='var(--bb-yellow)'} onMouseLeave={e => e.target.style.color='#888'}>{x}</a></li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <p style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Contact</p>
          <ul style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {[
              { icon:'📧', text:'hello@bashabos.com' },
              { icon:'📞', text:'+91 98765 43210' },
              { icon:'📍', text:'Meerut, Uttar Pradesh' },
              { icon:'🕒', text:'Mon–Sat 10am–6pm' },
            ].map(x => (
              <li key={x.text} style={{ display:'flex', gap:8, fontSize:13, fontWeight:600, color:'#888', alignItems:'flex-start' }}>
                <span>{x.icon}</span><span>{x.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'18px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:12, color:'#666', fontWeight:600 }}>
            © 2026 BashaBos Kids Wear. All rights reserved. &nbsp;|&nbsp; Design by <span style={{ color:'var(--bb-yellow)' }}>Ercetsoftsol</span>
          </p>
          <div style={{ display:'flex', gap:16 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(x => (
              <a key={x} href="#" style={{ fontSize:11, color:'#555', fontWeight:600, transition:'color 0.15s' }}
                onMouseEnter={e => e.target.style.color='var(--bb-yellow)'} onMouseLeave={e => e.target.style.color='#555'}>{x}</a>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {['💳','🏦','📱'].map((i,k) => (
              <span key={k} style={{ background:'rgba(255,255,255,0.07)', borderRadius:4, padding:'4px 8px', fontSize:14 }}>{i}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){ .ft-grid{grid-template-columns:1fr 1fr!important} }
        @media(max-width:560px){ .ft-grid{grid-template-columns:1fr!important} }
      `}</style>
    </footer>
  )
}
