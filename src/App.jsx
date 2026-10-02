import { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'

function App() {
  const [caixa, setCaixa] = useState(null)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [resumo, setResumo] = useState(null)
  const [valorRetirada, setValorRetirada] = useState('')
  const [motivo, setMotivo] = useState('')
 
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
      amount: valor,
      payment_method: formaPagamento
    })
  })
  await resposta.json()
  setValor('')
  buscarStatus()
}

async function registrarRetirada() {
  const resposta = await fetch('http://127.0.0.1:5000/withdrawals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: valorRetirada,
      reason: motivo
    })
  })
  await resposta.json()
  setValorRetirada('')
  setMotivo('')
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
    <div className="app">
      <h1>Registro de Caixa</h1>

      <div className={`status status-${caixa.status}`}>
        Status: {caixa.status}
      </div>

      {caixa.status === 'fechado' && (
        <button onClick={abrirCaixa}>Abrir Caixa</button>
      )}
      {caixa.status === 'aberto' && (
        <button onClick={fecharCaixa}>Fechar Caixa</button>
      )}

      <form onSubmit={(e) => { e.preventDefault(); registrarVenda() }}>
      <h3>Registrar Venda</h3>
      <NumericFormat
        value={valor}
        onValueChange={(values) => setValor(values.floatValue)}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        prefix="R$ "
        placeholder="R$ 0,00"
      />
      <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
        <option value="pix">Pix</option>
        <option value="debito">Débito</option>
        <option value="credito">Crédito</option>
        <option value="dinheiro">Dinheiro</option>
      </select>
      <button type="submit">Registrar Venda</button>
    </form>

      <form onSubmit={(e) => { e.preventDefault(); registrarRetirada() }}>
      <h3>Registrar Retirada</h3>
      <NumericFormat
        value={valorRetirada}
        onValueChange={(values) => setValorRetirada(values.floatValue)}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        prefix="R$ "
        placeholder="R$ 0,00"
      />
      <input
        type="text"
        placeholder="Motivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      <button type="submit">Registrar Retirada</button>
    </form>

      {resumo && (
  <div className="resumo">
    <h2>Resumo do dia</h2>
    <p>
      Vendas:{' '}
      <NumericFormat
        value={resumo.total_sales}
        displayType="text"
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        prefix="R$ "
      />
    </p>
    <p>
      Retiradas:{' '}
      <NumericFormat
        value={resumo.total_withdrawals}
        displayType="text"
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        prefix="R$ "
      />
    </p>
    <p>
      <strong>
        Total líquido:{' '}
        <NumericFormat
          value={resumo.net_total}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          prefix="R$ "
        />
      </strong>
    </p>
  </div>
)}
  </div>
)
}

export default App
