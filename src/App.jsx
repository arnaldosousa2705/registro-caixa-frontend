import { useState, useEffect } from 'react'

function App() {
  const [caixa, setCaixa] = useState(null)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [resumo, setResumo] = useState(null)
 
  async function buscarStatus() {
    const resposta = await fetch('http://127.0.0.1:5000/daily/status')
    const dados = await resposta.json()
    setCaixa(dados)
  }

  async function abrirCaixa() {
    const resposta = await fetch('http://127.0.0.1:5000/daily/open', {
      method: 'POST'
    })
    const dados = await resposta.json()
    setCaixa(dados)
    setResumo(null)
    buscarStatus()
  }
  async function registrarVenda() {
    const resposta = await fetch('http://127.0.0.1:5000/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: parseFloat(valor),
        payment_method: formaPagamento 
      })
    })
    await resposta.json()
    setValor('')
    buscarStatus()
  }

  async function fecharCaixa() {
    const resposta = await fetch('http://127.0.0.1:5000/daily/close', {
      method: 'POST'
    })
    const dados = await resposta.json()
    setResumo(dados)
    buscarStatus()
  }

  useEffect(() => {
    buscarStatus()
  }, [])

  if (!caixa) return <p>Carregando...</p>

  return (
    <div>
      <h1>Registro de Caixa</h1>
      <p>Status: {caixa.status}</p>
      {caixa.status === 'fechado' && (
        <button onClick={abrirCaixa}>Abrir Caixa</button>
      )}
      {caixa.status === 'aberto' && (
        <button onClick={fecharCaixa}>Fechar Caixa</button>
      )}
      <form onSubmit={(e) => { e.preventDefault(); registrarVenda() }}>
  <input
    type="number"
    placeholder="Valor"
    value={valor}
    onChange={(e) => setValor(e.target.value)}
  />
  <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
    <option value="pix">Pix</option>
    <option value="debito">Débito</option>
    <option value="credito">Crédito</option>
    <option value="dinheiro">Dinheiro</option>
  </select>
  <button type="submit">Registrar Venda</button>
</form>

{resumo && (
  <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
    <h2>Resumo do dia</h2>
    <p>Vendas: R$ {resumo.total_sales.toFixed(2)}</p>
    <p>Retiradas: R$ {resumo.total_withdrawals.toFixed(2)}</p>
    <p><strong>Total líquido: R$ {resumo.net_total.toFixed(2)}</strong></p>
  </div>
)}
    </div>
  )
}
export default App
