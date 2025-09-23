import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SidebarLayout from './components/SidebarLayout'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </SidebarLayout>
    </Router>
  )
}

export default App