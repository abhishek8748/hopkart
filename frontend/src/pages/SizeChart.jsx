import { Link } from 'react-router-dom'
import { sizeChart } from '../data/products'

export default function SizeChart() {
  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px 80px', fontFamily:'var(--hops-font)' }}>
      <div style={{ fontSize:12, color:'#aaa', fontWeight:600, marginBottom:20 }}>
        <Link to="/" style={{color:'#aaa'}}>Home</Link> › Size Chart
      </div>
      <h1 style={{ fontSize:26, fontWeight:900, color:'#333', marginBottom:6 }}>Size Guide 📏</h1>
      <p style={{ fontSize:14, color:'#888', fontWeight:600, marginBottom:32 }}>Use our size guide to find the perfect fit for your child</p>
      {Object.entries(sizeChart).map(([key, chart]) => (
        <div key={key} style={{ marginBottom:40 }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:'var(--hops-purple)', marginBottom:14, paddingBottom:8, borderBottom:'2px solid var(--hops-purple)' }}>
            {chart.title}
          </h2>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>{chart.headers.map(h => <th key={h} style={{ background:'var(--hops-purple)', color:'#fff', padding:'10px 14px', textAlign:'center', fontWeight:800 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {chart.rows.map((row, i) => (
                  <tr key={i} style={{ background: i%2===0 ? '#fff' : 'var(--hops-purple-light)' }}>
                    {row.map((cell, j) => <td key={j} style={{ padding:'10px 14px', textAlign:'center', fontWeight:600, color:'#333', border:'1px solid var(--hops-border)' }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:11, color:'#aaa', marginTop:8, fontWeight:600 }}>* Measurements may vary ±0.5 to 1 inch due to manual measurement</p>
        </div>
      ))}
    </div>
  )
}
