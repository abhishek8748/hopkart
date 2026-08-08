import { createContext, useContext, useReducer } from 'react'
const Ctx = createContext(null)
function reducer(s, a) {
  switch(a.type) {
    case 'ADD': {
      const e = s.cart.find(i => i.id===a.item.id && i.size===a.item.size)
      if(e) return {...s, cart: s.cart.map(i => i.id===a.item.id && i.size===a.item.size ? {...i, qty:i.qty+1} : i)}
      return {...s, cart:[...s.cart, {...a.item, qty:1}]}
    }
    case 'REMOVE': return {...s, cart: s.cart.filter(i => !(i.id===a.id && i.size===a.size))}
    case 'QTY': return {...s, cart: s.cart.map(i => i.id===a.id && i.size===a.size ? {...i,qty:a.qty} : i).filter(i=>i.qty>0)}
    case 'WISH': {
      const has = s.wish.find(i=>i.id===a.item.id)
      return {...s, wish: has ? s.wish.filter(i=>i.id!==a.item.id) : [...s.wish,a.item]}
    }
    case 'CLEAR': return {...s, cart:[]}
    default: return s
  }
}
export function CartProvider({children}) {
  const [s,d] = useReducer(reducer,{cart:[],wish:[]})
  return <Ctx.Provider value={{
    cart:s.cart, wish:s.wish,
    add: item => d({type:'ADD',item}),
    remove: (id,size) => d({type:'REMOVE',id,size}),
    setQty: (id,size,qty) => d({type:'QTY',id,size,qty}),
    toggleWish: item => d({type:'WISH',item}),
    clearCart: () => d({type:'CLEAR'}),
    isWished: id => s.wish.some(i=>i.id===id),
    count: s.cart.reduce((n,i)=>n+i.qty,0),
    total: s.cart.reduce((n,i)=>n+i.price*i.qty,0),
  }}>{children}</Ctx.Provider>
}
export const useCart = () => useContext(Ctx)
