import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wish } = useCart()
  return (
    <div style={{ maxWidth:1300, margin:'0 auto', padding:'28px 20px 80px' }}>
      <h1 style={{ fontSize:26, fontWeight:900, color:'#111', marginBottom:6 }}>My Wishlist</h1>
      <p style={{ fontSize:13, color:'#999', fontWeight:600, marginBottom:26 }}>{wish.length} item{wish.length!==1?'s':''} saved</p>
      {wish.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <Heart size={72} color="#e5e7eb" strokeWidth={1} style={{ margin:'0 auto 18px' }}/>
          <h2 style={{ fontSize:22, fontWeight:900, color:'#111', marginBottom:8 }}>Your wishlist is empty!</h2>
          <p style={{ fontSize:14, color:'#999', fontWeight:600, marginBottom:22 }}>Save your favourite BashaBos items here.</p>
          <Link to="/shop" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--purple)', color:'#fff', padding:'13px 28px', borderRadius:50, fontSize:14, fontWeight:800, textDecoration:'none' }}>
            <ShoppingBag size={16}/> Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }} className="wl-grid">
          {wish.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <style>{`@media(max-width:900px){.wl-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:480px){.wl-grid{gap:10px!important}}`}</style>
    </div>
  )
}
