import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Brain, Zap, Gamepad2, Sparkles, ArrowRight } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { getTokenStatus } from '../lib/api'
import { useStudyStore } from '../lib/store'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)
  const setTokenStatus = useStudyStore((state) => state.setTokenStatus)

  useEffect(() => {
    getTokenStatus().then(setTokenStatus).catch(console.error)
  }, [setTokenStatus])

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: t('home.features.brainrot.title'),
      desc: t('home.features.brainrot.desc'),
      color: 'from-brain-purple to-brain-pink',
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: t('home.features.quiz.title'),
      desc: t('home.features.quiz.desc'),
      color: 'from-brain-pink to-brain-cyan',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('home.features.tts.title'),
      desc: t('home.features.tts.desc'),
      color: 'from-brain-cyan to-brain-lime',
    },
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brain-purple/20 border border-brain-purple/40 mb-6">
            <Sparkles className="w-4 h-4 text-brain-pink" />
            <span className="text-sm font-medium">{t('home.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">{t('home.title.part1')}</span>
            <br />
            <span className="text-white">{t('home.title.part2')}</span>
            <span className="text-6xl md:text-8xl ml-4">🧠💀</span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>

          {!showUpload ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              {t('home.cta')}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <FileUpload onUploadComplete={() => navigate('/study')} />
          )}

          <p className="mt-4 text-sm text-white/40">
            {t('home.freeTrial')}
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card-glass p-6 group hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:animate-float`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-display font-bold mb-12">
            {t('home.howItWorks.title')} <span className="text-brain-pink">✨</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { step: '1', text: t('home.howItWorks.step1'), emoji: '📤' },
              { step: '2', text: t('home.howItWorks.step2'), emoji: '🤖' },
              { step: '3', text: t('home.howItWorks.step3'), emoji: '🎮' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brain-purple to-brain-pink flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                  <span className="absolute -top-2 -right-2 text-2xl">{item.emoji}</span>
                </div>
                <p className="text-white/80">{item.text}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-brain-purple/50" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
