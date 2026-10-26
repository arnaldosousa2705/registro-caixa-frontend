import { Routes, Route } from 'react-router-dom'
import Caixa from './pages/Caixa.jsx'
import Relatorios from './pages/Relatorios.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Caixa />} />
      <Route path="/relatorios" element={<Relatorios />} />
    </Routes>
  )
}

export default App