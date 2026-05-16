import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer({ open, onClose }) {
  const { cart, remove, setQty, total, clearCart } = useCart()
  const navigate = useNavigate()
  const shipping = total >= 499 ? 0 : 49
  const grand = total + shipping

  const goCheckout = () => { onClose(); navigate('/checkout') }

  return (
    <>
      {open && <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:700 }} />}

      <aside style={{
        position:'fixed', top:0, right:0, width:400, maxWidth:'100vw', height:'100vh',
        background:'#fff', zIndex:800,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.3s cubic-bezier(.4,0,.2,1)',
        display:'flex', flexDirection:'column',
        boxShadow:'-4px 0 24px rgba(0,0,0,0.1)',
        fontFamily:'var(--hops-font)',
      }}>
        {/* HEADER */}
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--hops-border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:'var(--hops-purple)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <ShoppingCart size={19} color="#fff" />
            <span style={{ fontSize:17, fontWeight:900, color:'#fff' }}>My Cart</span>
            {cart.length > 0 && (
              <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', borderRadius:3, padding:'2px 9px', fontSize:12, fontWeight:800 }}>
                {cart.reduce((n,i)=>n+i.qty,0)} items
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* FREE SHIPPING PROGRESS */}
        {cart.length > 0 && (
          <div style={{ padding:'10px 20px', background:'var(--hops-purple-light)', borderBottom:'1px solid #e0c8f0', flexShrink:0 }}>
            {total >= 499 ? (
              <p style={{ fontSize:13, fontWeight:700, color:'var(--hops-green)', textAlign:'center' }}>🎉 You've unlocked FREE Shipping!</p>
            ) : (
              <>
                <p style={{ fontSize:12, fontWeight:600, color:'#666', marginBottom:5 }}>
                  Add <strong style={{ color:'var(--hops-purple)' }}>₹{499 - total}</strong> more for FREE delivery
                </p>
                <div style={{ background:'#e0c8f0', borderRadius:3, height:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--hops-purple)', width:`${Math.min((total/499)*100,100)}%`, transition:'width 0.4s', borderRadius:3 }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ITEMS */}
        <div style={{ flex:1, overflowY:'auto', padding: cart.length ? '16px 20px' : 0 }}>
          {cart.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:40 }}>
              <ShoppingCart size={64} color="#e0c8f0" strokeWidth={1} />
              <p style={{ fontSize:18, fontWeight:800, color:'#333', marginTop:14, marginBottom:7 }}>Your cart is empty!</p>
              <p style={{ fontSize:13, color:'#aaa', fontWeight:600, marginBottom:22 }}>Add some amazing BashaBos kids wear.</p>
              <button onClick={onClose} className="hops-btn-primary">Continue Shopping</button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {cart.map((item, i) => {
                const disc = Math.round(((item.mrp - item.price)/item.mrp)*100)
                return (
                  <div key={i} style={{ display:'flex', gap:12, background:'var(--hops-gray-light)', borderRadius:6, padding:12, border:'1px solid var(--hops-border)' }}>
                    <div style={{ width:76, height:86, borderRadius:4, overflow:'hidden', flexShrink:0, background:'#f0f0f0' }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} alt={item.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }} />
                        : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26 }}>👕</div>
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:800, color:'#222', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:2 }}>{item.color}</p>
                      <p style={{ fontSize:11, color:'#888', fontWeight:600, marginBottom:7 }}>Size: <strong style={{color:'#555'}}>{item.size}</strong></p>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
                        <span style={{ fontSize:14, fontWeight:900, color:'#222' }}>₹{item.price}</span>
                        <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through', fontWeight:600 }}>₹{item.mrp}</span>
                        <span style={{ fontSize:10, color:'var(--hops-green)', fontWeight:800 }}>{disc}% off</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1px solid var(--hops-border)', borderRadius:3, overflow:'hidden' }}>
                          <button onClick={() => setQty(item.id,item.size,item.qty-1)} style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'none',cursor:'pointer',color:'#555',borderRight:'1px solid var(--hops-border)' }}><Minus size={11}/></button>
                          <span style={{ fontSize:13,fontWeight:800,minWidth:24,textAlign:'center',color:'#222' }}>{item.qty}</span>
                          <button onClick={() => setQty(item.id,item.size,item.qty+1)} style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'none',cursor:'pointer',color:'#555',borderLeft:'1px solid var(--hops-border)' }}><Plus size={11}/></button>
                        </div>
                        <button onClick={() => remove(item.id,item.size)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--hops-red)',display:'flex',padding:4 }}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--hops-border)', background:'#fff', flexShrink:0 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'#666' }}>
                <span>Subtotal</span><span>₹{total}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'#666' }}>
                <span>Delivery</span>
                <span style={{ color: shipping===0 ? 'var(--hops-green)' : '#666', fontWeight: shipping===0 ? 800 : 600 }}>
                  {shipping===0 ? 'FREE 🎉' : `₹${shipping}`}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:900, color:'#222', borderTop:'1px dashed var(--hops-border)', paddingTop:9, marginTop:3 }}>
                <span>Total</span><span>₹{grand}</span>
              </div>
            </div>
            <button onClick={goCheckout} className="hops-btn-primary" style={{ width:'100%', fontSize:15, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:4 }}>
              Proceed to Checkout <ArrowRight size={16}/>
            </button>
            <button onClick={clearCart} style={{ width:'100%', background:'none', border:'none', color:'#aaa', fontSize:12, fontWeight:700, marginTop:8, cursor:'pointer', padding:6 }}>
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
