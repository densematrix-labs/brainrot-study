import { useTranslation } from 'react-i18next'

export default function TermsPage() {
  const { t } = useTranslation()
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto card-glass p-8">
        <h1 className="text-3xl font-display font-bold mb-6 gradient-text">
          {t('terms.title')}
        </h1>
        
        <div className="prose prose-invert">
          <p className="text-white/70 mb-6">{t('terms.lastUpdated')}: February 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('terms.sections.acceptance.title')}</h2>
          <p className="text-white/70 mb-4">{t('terms.sections.acceptance.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('terms.sections.service.title')}</h2>
          <p className="text-white/70 mb-4">{t('terms.sections.service.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('terms.sections.content.title')}</h2>
          <p className="text-white/70 mb-4">{t('terms.sections.content.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('terms.sections.disclaimer.title')}</h2>
          <p className="text-white/70 mb-4">{t('terms.sections.disclaimer.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('terms.sections.liability.title')}</h2>
          <p className="text-white/70">{t('terms.sections.liability.content')}</p>
        </div>
      </div>
    </main>
  )
}
