import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumericFormat } from 'react-number-format'

// Mostra um valor em R$ no padrão brasileiro
function Moeda({ valor }) {
  return (
    <NumericFormat
      value={valor}
      displayType="text"
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      prefix="R$ "
    />
  )
}

function Relatorios() {
  // --- Relatório diário ---
  const [dataRelatorio, setDataRelatorio] = useState('')
  const [relatorioDiario, setRelatorioDiario] = useState(null)

  // --- Relatório mensal ---
  const [relatorioAno, setRelatorioAno] = useState(new Date().getFullYear())
  const [relatorioMes, setRelatorioMes] = useState(new Date().getMonth() + 1)
  const [relatorioMensal, setRelatorioMensal] = useState(null)

  // --- Relatório anual (NOVO) ---
  const [anoAnual, setAnoAnual] = useState(new Date().getFullYear())
  const [relatorioAnual, setRelatorioAnual] = useState(null)

  async function buscarRelatorioDiario() {
    try {
      const resposta = await fetch(`http://127.0.0.1:5000/reports/daily?date=${dataRelatorio}`)
      const dados = await resposta.json()

      if (resposta.ok) {
        setRelatorioDiario(dados)
      } else {
        console.error('Erro ao buscar relatório diário:', dados)
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro)
    }
  }

  async function buscarRelatorioMensal() {
    try {
      const resposta = await fetch(
        `http://127.0.0.1:5000/reports/monthly?year=${relatorioAno}&month=${relatorioMes}`
      )
      const dados = await resposta.json()

      if (resposta.ok) {
        setRelatorioMensal(dados)
      } else {
        console.error('Erro ao buscar relatório mensal:', dados)
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro)
    }
  }

  // NOVO
  async function buscarRelatorioAnual() {
    try {
      const resposta = await fetch(`http://127.0.0.1:5000/reports/yearly?year=${anoAnual}`)
      const dados = await resposta.json()

      if (resposta.ok) {
        setRelatorioAnual(dados)
      } else {
        console.error('Erro ao buscar relatório anual:', dados)
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro)
    }
  }

  return (
    <div className="app">
      <h1>Relatórios</h1>
      <Link to="/">Voltar para o Caixa</Link>

      {/* ---------- RELATÓRIO DO DIA ---------- */}
      <h3>Relatório do Dia</h3>
      <input
        type="date"
        value={dataRelatorio}
        onChange={(e) => setDataRelatorio(e.target.value)}
      />
      <button onClick={buscarRelatorioDiario}>Ver Relatório</button>

      {relatorioDiario && (
        relatorioDiario.registers.length === 0 ? (
          <p>Nenhum caixa neste dia.</p>
        ) : (
          <ul>
            {relatorioDiario.registers.map((caixa) => (
              <li key={caixa.id} style={{ marginBottom: '16px' }}>
                <strong>Caixa #{caixa.id}</strong> ({caixa.status})
                <div>Abertura: {caixa.opened_at}</div>
                <div>Fechamento: {caixa.closed_at || 'Ainda aberto'}</div>
                <div>Vendas: <Moeda valor={caixa.total_sales} /></div>
                <div>Retiradas: <Moeda valor={caixa.total_withdrawals} /></div>
                <div><strong>Líquido: <Moeda valor={caixa.net_total} /></strong></div>
              </li>
            ))}
          </ul>
        )
      )}

      {/* ---------- RELATÓRIO DO MÊS ---------- */}
      <h3>Relatório do Mês</h3>
      <select
        value={relatorioMes}
        onChange={(e) => setRelatorioMes(Number(e.target.value))}
      >
        <option value={1}>Janeiro</option>
        <option value={2}>Fevereiro</option>
        <option value={3}>Março</option>
        <option value={4}>Abril</option>
        <option value={5}>Maio</option>
        <option value={6}>Junho</option>
        <option value={7}>Julho</option>
        <option value={8}>Agosto</option>
        <option value={9}>Setembro</option>
        <option value={10}>Outubro</option>
        <option value={11}>Novembro</option>
        <option value={12}>Dezembro</option>
      </select>
      <input
        type="number"
        value={relatorioAno}
        onChange={(e) => setRelatorioAno(Number(e.target.value))}
      />
      <button onClick={buscarRelatorioMensal}>Ver Relatório</button>

      {relatorioMensal && (
        <div className="resumo">
          <h2>{relatorioMensal.month}/{relatorioMensal.year}</h2>
          <p>Vendas: <Moeda valor={relatorioMensal.total_sales} /></p>
          <p>Retiradas: <Moeda valor={relatorioMensal.total_withdrawals} /></p>
          <p><strong>Total líquido: <Moeda valor={relatorioMensal.net_total} /></strong></p>
        </div>
      )}

      {/* ---------- RELATÓRIO DO ANO (NOVO) ---------- */}
      <h3>Relatório do Ano</h3>
      <input
        type="number"
        value={anoAnual}
        onChange={(e) => setAnoAnual(Number(e.target.value))}
      />
      <button onClick={buscarRelatorioAnual}>Ver Relatório</button>

      {relatorioAnual && (
        <div className="resumo">
          <h2>{relatorioAnual.year}</h2>
          <p>Vendas: <Moeda valor={relatorioAnual.total_sales} /></p>
          <p>Retiradas: <Moeda valor={relatorioAnual.total_withdrawals} /></p>
          <p><strong>Total líquido: <Moeda valor={relatorioAnual.net_total} /></strong></p>
        </div>
      )}
    </div>
  )
}

export default Relatorios