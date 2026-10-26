import { useState, useEffect, useRef } from 'react'
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
  const [editandoRetiradaId, setEditandoRetiradaId] = useState(null)
  const [editValorRetirada, setEditValorRetirada] = useState('')
  const [editMotivo, setEditMotivo] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const timerMensagem = useRef(null)
 
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

    if (resposta.ok) {
      mostrarMensagem('Caixa aberto com sucesso!', 'sucesso')
      setResumo(null)
    } else {
      mostrarMensagem(dados.error || 'Erro ao abrir o caixa.', 'erro')
    }
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
  const dados = await resposta.json()
  if (resposta.ok) {
    mostrarMensagem('Venda registrada com sucesso!', 'sucesso')
    setValor('')
    buscarStatus()
    buscarDadosDoDia()
  } else {
    mostrarMensagem(dados.error || 'Erro ao registrar venda.', 'erro')
  }
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
  const dados = await resposta.json()
  if (resposta.ok) {
    mostrarMensagem('Retirada registrada com sucesso!', 'sucesso')
    setValorRetirada('')
    setMotivo('')
    buscarStatus()
    buscarDadosDoDia()
  } else {
    mostrarMensagem(dados.error || 'Erro ao registrar retirada.', 'erro')
  }
}

  async function fecharCaixa() {
    const resposta = await fetch('http://127.0.0.1:5000/daily/close', {
      method: 'POST'
    })
    const dados = await resposta.json()
    if (resposta.ok) {
      mostrarMensagem('Caixa fechado com sucesso!', 'sucesso')
    setResumo(dados)
    } else {
      mostrarMensagem(dados.error || 'Erro ao fechar o caixa.', 'erro')
    }
    buscarStatus()
  }

  useEffect(() => {
    buscarStatus()
    buscarDadosDoDia() 
  }, [])

  if (!caixa) return <p>Carregando...</p>

  async function apagarVenda(id) {
    if (window.confirm(`Tem certeza que deseja apagar a venda #${id}?`)) {
      
      const resposta = await fetch(`http://127.0.0.1:5000/sales/${id}`, {method: 'DELETE'})
      const dados = await resposta.json()
      
      if (resposta.ok) {
        mostrarMensagem('Venda apagada com sucesso!', 'sucesso')
      } else {
        mostrarMensagem(dados.error || 'Erro ao apagar venda.', 'erro')
    }
    buscarDadosDoDia()
    }
  }

    async function apagarRetirada(id) {
    if (window.confirm(`Tem certeza que deseja apagar a retirada #${id}?`)) {
      const resposta = await fetch(`http://127.0.0.1:5000/withdrawals/${id}`, {method: 'DELETE'})
      const dados = await resposta.json()
      if (resposta.ok) {
        mostrarMensagem('Retirada apagada com sucesso!', 'sucesso')
      } else {
        mostrarMensagem(dados.error || 'Erro ao apagar retirada.', 'erro')
      }
      buscarDadosDoDia()
    }
  }

  async function salvarEdicaoVenda(id) {
    const resposta = await fetch(`http://127.0.0.1:5000/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: editValor,
        payment_method: editForma
      })
    })
    const dados = await resposta.json()

    if (resposta.ok) {
      mostrarMensagem('Venda editada com sucesso!', 'sucesso')
      setEditandoVendaId(null)
      setEditValor('')
      setEditForma('pix')
      buscarDadosDoDia()
    } else {
      mostrarMensagem(dados.error || 'Erro ao editar venda.', 'erro')
    }
  }

  async function salvarEdicaoRetirada(id) {
    const resposta = await fetch(`http://127.0.0.1:5000/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: editValorRetirada,
        reason: editMotivo
      })
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      mostrarMensagem('Retirada editada com sucesso!', 'sucesso')
      setEditandoRetiradaId(null)
      setEditValorRetirada('')
      setEditMotivo('')
      buscarDadosDoDia()
    } else {
      mostrarMensagem(dados.error || 'Erro ao editar retirada.', 'erro')
    }
  }

  function mostrarMensagem(texto, tipo) {
    setMensagem({ tipo, texto })
    clearTimeout(timerMensagem.current)
    timerMensagem.current = setTimeout(() => {
      setMensagem(null)
    }, 3000)
  }

return (
    <div className="app">
      <h1>Registro de Caixa</h1>

      {mensagem && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

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
                {editandoRetiradaId === retirada.id ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <NumericFormat
                  value={editValorRetirada}
                  onValueChange={(values) => setEditValorRetirada(values.floatValue)}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="R$ "
                />
                <input
                  type="text"
                  value={editMotivo}
                  onChange={(e) => setEditMotivo(e.target.value)}
                  placeholder="Motivo"
                />
                <button onClick={() => salvarEdicaoRetirada(retirada.id)} style={{ background: '#10b981' }}>
                  Salvar
                </button>
                <button onClick={() => setEditandoRetiradaId(null)} style={{ background: '#6b7280' }}>
                  Cancelar
                </button>
              </div>
                ) : (
                  <>
                    <span>#{retirada.id} | {retirada.date} | R$ {retirada.amount} ({retirada.reason})</span>
                    <button onClick={() => {
                      setEditandoRetiradaId(retirada.id);
                      setEditValorRetirada(retirada.amount);
                      setEditMotivo(retirada.reason);
                    }} style={{ background: '#3b82f6', padding: '5px 10px', marginLeft: '10px' }}>
                      Editar
                    </button>
                    <button onClick={() => apagarRetirada(retirada.id)} style={{ background: '#ef4444', padding: '5px 10px', marginLeft: '10px' }}>
                      Apagar
                    </button>
                  </>
              )}
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
