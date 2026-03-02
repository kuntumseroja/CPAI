import { Routes, Route } from 'react-router-dom'
import { DemoProvider } from './demo/DemoContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import SubmitFinding from './pages/SubmitFinding'
import AnalysisResult from './pages/AnalysisResult'

function App() {
  return (
    <DemoProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitFinding />} />
          <Route path="/analysis" element={<AnalysisResult />} />
        </Routes>
      </Layout>
    </DemoProvider>
  )
}

export default App
