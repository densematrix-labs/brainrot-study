import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, Sparkles } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brain-darker/80 backdrop-blur-lg border-b border-brain-purple/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brain-purple to-brain-pink flex items-center justify-center group-hover:animate-shake">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">
            Brainrot Study
          </span>
          <span className="text-2xl">💀</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            to="/pricing" 
            className="flex items-center gap-1 text-white/70 hover:text-brain-pink transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{t('nav.pricing')}</span>
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
