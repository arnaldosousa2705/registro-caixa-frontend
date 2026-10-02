import { useState, useEffect } from 'react'

function App() {
  const [caixa, setCaixa] = useState(null)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
 
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
    console.log("Resumo do dia", dados)
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
    </div>
  )
}
export default App
