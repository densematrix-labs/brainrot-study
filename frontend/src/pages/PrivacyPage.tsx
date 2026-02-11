import { useTranslation } from 'react-i18next'

export default function PrivacyPage() {
  const { t } = useTranslation()
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto card-glass p-8">
        <h1 className="text-3xl font-display font-bold mb-6 gradient-text">
          {t('privacy.title')}
        </h1>
        
        <div className="prose prose-invert">
          <p className="text-white/70 mb-6">{t('privacy.lastUpdated')}: February 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('privacy.sections.collection.title')}</h2>
          <p className="text-white/70 mb-4">{t('privacy.sections.collection.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('privacy.sections.usage.title')}</h2>
          <p className="text-white/70 mb-4">{t('privacy.sections.usage.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('privacy.sections.storage.title')}</h2>
          <p className="text-white/70 mb-4">{t('privacy.sections.storage.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('privacy.sections.rights.title')}</h2>
          <p className="text-white/70 mb-4">{t('privacy.sections.rights.content')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">{t('privacy.sections.contact.title')}</h2>
          <p className="text-white/70">
            {t('privacy.sections.contact.content')}: privacy@densematrix.ai
          </p>
        </div>
      </div>
    </main>
  )
}
