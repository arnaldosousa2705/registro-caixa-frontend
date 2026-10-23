import { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'

function App() {
  const [caixa, setCaixa] = useState(null)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [resumo, setResumo] = useState(null)
  const [valorRetirada, setValorRetirada] = useState('')
  const [motivo, setMotivo] = useState('')
  const [dadosDoDia, setDadosDoDia] = useState({ sales: [], withdrawals: [] })
  const [editandoVendaId, setEditandoVendaId] = useState(null)
  const [editValor, setEditValor] = useState('')
  const [editForma, setEditForma] = useState('pix')
 
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

  async function buscarDadosDoDia() {
  const resposta = await fetch('http://127.0.0.1:5000/sales')
  const dados = await resposta.json()
  setDadosDoDia(dados)
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
  buscarDadosDoDia()
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
  buscarDadosDoDia()
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
    buscarDadosDoDia() 
  }, [])

  if (!caixa) return <p>Carregando...</p>

  async function apagarVenda(id) {
    if (window.confirm(`Tem certeza que deseja apagar a venda #${id}?`)) {
      await fetch(`http://127.0.0.1:5000/sales/${id}`, {method: 'DELETE'})
      buscarDadosDoDia()
    }
  }

    async function apagarRetirada(id) {
    if (window.confirm(`Tem certeza que deseja apagar a retirada #${id}?`)) {
      await fetch(`http://127.0.0.1:5000/withdrawals/${id}`, {method: 'DELETE'})
      buscarDadosDoDia()
    }
  }

  async function salvarEdicaoVenda(id) {
    await fetch(`http://127.0.0.1:5000/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: editValor,
        payment_method: editForma
      })
    })
    setEditandoVendaId(null)
    setEditValor('')
    setEditForma('pix')
    buscarDadosDoDia()
  }

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

            {/* --- LISTA DE VENDAS --- */}
      <div className="lista-dados">
        <h3>Vendas do Dia</h3>
        {dadosDoDia.sales.length === 0 ? (
          <p>Nenhuma venda registrada hoje.</p>
        ) : (
          <ul>
            {dadosDoDia.sales.map((venda) => (
  <li key={venda.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
    
    {editandoVendaId === venda.id ? (
      // --- MODO DE EDIÇÃO ---
      <div style={{ display: 'flex', gap: '10px' }}>
        <NumericFormat
          value={editValor}
          onValueChange={(values) => setEditValor(values.floatValue)}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          prefix="R$ "
        />
        <select value={editForma} onChange={(e) => setEditForma(e.target.value)}>
          <option value="pix">Pix</option>
          <option value="debito">Débito</option>
          <option value="credito">Crédito</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
        <button onClick={() => salvarEdicaoVenda(venda.id)} style={{ background: '#10b981' }}>Salvar</button>
        <button onClick={() => setEditandoVendaId(null)} style={{ background: '#6b7280' }}>Cancelar</button>
      </div>
    ) : (
      // --- MODO DE VISUALIZAÇÃO ---
      <>
        <span>#{venda.id} | {venda.date} | R$ {venda.amount} ({venda.payment_method})</span>
        <div>
          <button 
            onClick={() => {
              setEditandoVendaId(venda.id); 
              setEditValor(venda.amount); 
              setEditForma(venda.payment_method);
            }} 
            style={{ background: '#3b82f6', marginRight: '5px' }}
          >
            Editar
          </button>
          <button onClick={() => apagarVenda(venda.id)} style={{ background: '#ef4444' }}>
            Apagar
          </button>
        </div>
      </>
    )}
  </li>
))}
          </ul>
        )}
      </div>

      {/* --- LISTA DE RETIRADAS --- */}
      <div className="lista-dados">
        <h3>Retiradas do Dia</h3>
        {dadosDoDia.withdrawals.length === 0 ? (
          <p>Nenhuma retirada registrada hoje.</p>
        ) : (
          <ul>
            {dadosDoDia.withdrawals.map((retirada) => (
              <li key={retirada.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>#{retirada.id} | {retirada.date} | R$ {retirada.amount} ({retirada.reason})</span>
                <button onClick={() => apagarRetirada(retirada.id)} style={{ background: '#ef4444', padding: '5px 10px', marginLeft: '10px' }}>
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {resumo && (
        <div className="resumo">
          <h2>Resumo do dia</h2>
          <p>Vendas: <NumericFormat value={resumo.total_sales} displayType="text" thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="R$ " /></p>
          <p>Retiradas: <NumericFormat value={resumo.total_withdrawals} displayType="text" thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="R$ " /></p>
          <p><strong>Total líquido: <NumericFormat value={resumo.net_total} displayType="text" thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="R$ " /></strong></p>
        </div>
      )}
    </div>
  )
}
export default App
