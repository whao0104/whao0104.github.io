import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ServiceMarket from './pages/ServiceMarket'
import MCPWorkshop from './pages/MCPWorkshop'
import ServiceManagement from './pages/ServiceManagement'
import MetadataExplorer from './pages/MetadataExplorer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/explorer" replace />} />
        <Route path="explorer" element={<MetadataExplorer />} />
        <Route path="market" element={<ServiceMarket />} />
        <Route path="workshop" element={<MCPWorkshop />} />
        <Route path="management" element={<ServiceManagement />} />
      </Route>
    </Routes>
  )
}

export default App
