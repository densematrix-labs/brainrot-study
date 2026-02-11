import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { getTokenStatus, TokenStatus } from '../lib/api'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const [tokens, setTokens] = useState<TokenStatus | null>(null)

  useEffect(() => {
    getTokenStatus().then(setTokens).catch(console.error)
  }, [])

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass p-8 max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-brain-cyan flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold mb-4 gradient-text">
          {t('success.title')} 🎉
        </h1>

        <p className="text-white/70 mb-6">
          {t('success.message')}
        </p>

        {tokens && (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brain-purple/20 border border-brain-purple/50 mb-6">
            <Sparkles className="w-5 h-5 text-brain-lime" />
            <span className="font-bold text-lg">
              {tokens.remaining_tokens} {t('success.conversions')}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/" className="btn-primary w-full inline-flex items-center justify-center gap-2">
            {t('success.startStudying')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/40">
          {t('success.receipt')}
        </p>
      </motion.div>
    </main>
  )
}
