import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StudyPage from './pages/StudyPage'
import PricingPage from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen bg-brain-darker bg-grid">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </div>
  )
}

export default App
