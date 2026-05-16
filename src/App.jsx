import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import { OrderSuccess } from './pages/OrderSuccess'
import SizeChart from './pages/SizeChart'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ScrollTop />
      <main style={{ minHeight: '60vh' }}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/shop"          element={<Shop />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/wishlist"      element={<Wishlist />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/size-chart"    element={<SizeChart />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
              <p style={{ fontSize: 72, marginBottom: 16 }}>😕</p>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#333' }}>Page not found</h2>
              <Link to="/" style={{ color: 'var(--hops-purple)', fontWeight: 700, display: 'block', marginTop: 12 }}>← Back to Home</Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout />
      </CartProvider>
    </BrowserRouter>
  )
}
