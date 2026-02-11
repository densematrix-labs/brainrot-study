import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import BrainrotCard from '../components/BrainrotCard'
import { convertToBrainrot, getTokenStatus } from '../lib/api'
import { useStudyStore } from '../lib/store'

export default function StudyPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    uploadedChunks,
    filename,
    currentChunkIndex,
    convertedContent,
    isConverting,
    tokenStatus,
    setIsConverting,
    addConvertedContent,
    nextChunk,
    setTokenStatus,
    reset,
  } = useStudyStore()

  const [error, setError] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Redirect if no data
  useEffect(() => {
    if (uploadedChunks.length === 0) {
      navigate('/')
    }
  }, [uploadedChunks, navigate])

  // Refresh token status
  useEffect(() => {
    getTokenStatus().then(setTokenStatus).catch(console.error)
  }, [setTokenStatus])

  // Convert next chunk
  const convertNextChunk = async () => {
    if (currentChunkIndex >= uploadedChunks.length) return
    if (tokenStatus && tokenStatus.remaining_tokens <= 0) {
      setError(t('study.noTokens'))
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const result = await convertToBrainrot(
        uploadedChunks[currentChunkIndex],
        i18n.language
      )
      addConvertedContent(result.content)
      nextChunk()
      setTokenStatus({ ...tokenStatus!, remaining_tokens: result.remaining_tokens })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed'
      setError(message)
      
      // If payment required, show specific message
      if (message.toLowerCase().includes('token') || message.toLowerCase().includes('payment')) {
        setError(t('study.noTokens'))
      }
    } finally {
      setIsConverting(false)
    }
  }

  // Auto-convert first chunk
  useEffect(() => {
    if (uploadedChunks.length > 0 && convertedContent.length === 0 && !isConverting) {
      convertNextChunk()
    }
  }, [uploadedChunks])

  const handleNext = () => {
    if (currentCardIndex < convertedContent.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else if (currentChunkIndex < uploadedChunks.length) {
      // Convert more content
      convertNextChunk()
    } else {
      // All done
      reset()
      navigate('/')
    }
  }

  const progress = uploadedChunks.length > 0 
    ? ((currentChunkIndex) / uploadedChunks.length) * 100 
    : 0

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold mb-2">
            📚 {filename}
          </h1>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mt-4">
            <div className="h-2 bg-brain-dark/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-brain-purple to-brain-pink"
              />
            </div>
            <p className="text-sm text-white/50 mt-2">
              {t('study.progress', { current: currentChunkIndex, total: uploadedChunks.length })}
            </p>
          </div>

          {/* Token Status */}
          {tokenStatus && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brain-dark/50 border border-brain-purple/30">
              <Sparkles className="w-4 h-4 text-brain-lime" />
              <span className="text-sm">
                {t('study.tokensLeft', { count: tokenStatus.remaining_tokens })}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-glass p-8 text-center"
          >
            <AlertTriangle className="w-16 h-16 text-brain-orange mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('study.error')}</h2>
            <p className="text-white/60 mb-6">{error}</p>
            {error === t('study.noTokens') ? (
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary"
              >
                {t('study.getPremium')}
              </button>
            ) : (
              <button
                onClick={convertNextChunk}
                className="btn-primary"
              >
                {t('study.retry')}
              </button>
            )}
          </motion.div>
        ) : isConverting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-glass p-12 text-center"
          >
            <Loader2 className="w-16 h-16 text-brain-pink mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold mb-2">{t('study.converting')}</h2>
            <p className="text-white/60">{t('study.convertingDesc')}</p>
            <div className="mt-6 text-4xl animate-brainrot">🧠</div>
          </motion.div>
        ) : convertedContent.length > 0 ? (
          <BrainrotCard
            content={convertedContent[currentCardIndex]}
            onNext={handleNext}
            language={i18n.language}
          />
        ) : null}
      </div>
    </main>
  )
}
