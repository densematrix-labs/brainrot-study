import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Volume2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import type { BrainrotContent } from '../lib/api'
import { getTTS } from '../lib/api'

interface BrainrotCardProps {
  content: BrainrotContent
  onNext: () => void
  language: string
}

export default function BrainrotCard({ content, onNext, language }: BrainrotCardProps) {
  const { t } = useTranslation()
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentView, setCurrentView] = useState<'nuggets' | 'quiz'>('nuggets')

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowExplanation(true)
  }

  const isCorrect = selectedAnswer === content.quiz.correct

  const playTTS = async (text: string) => {
    try {
      setIsPlaying(true)
      const audioBlob = await getTTS(text, language)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      await audio.play()
    } catch {
      setIsPlaying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="card-glass p-6 neon-border">
        {/* Title */}
        <h2 className="text-2xl font-display font-bold gradient-text mb-2">
          {content.title}
        </h2>
        <p className="text-brain-cyan text-sm mb-6">{content.hook}</p>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentView('nuggets')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              currentView === 'nuggets'
                ? 'bg-gradient-to-r from-brain-purple to-brain-pink text-white'
                : 'bg-brain-dark/50 text-white/60 hover:text-white'
            }`}
          >
            📚 {t('card.learn')}
          </button>
          <button
            onClick={() => setCurrentView('quiz')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              currentView === 'quiz'
                ? 'bg-gradient-to-r from-brain-pink to-brain-cyan text-white'
                : 'bg-brain-dark/50 text-white/60 hover:text-white'
            }`}
          >
            🎮 {t('card.quiz')}
          </button>
        </div>

        {currentView === 'nuggets' ? (
          /* Learning Nuggets */
          <div className="space-y-4">
            {content.nuggets.map((nugget, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-brain-purple/10 border border-brain-purple/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{nugget.emoji}</span>
                  <button
                    onClick={() => playTTS(nugget.vibe)}
                    disabled={isPlaying}
                    className="p-2 rounded-lg bg-brain-dark/50 hover:bg-brain-pink/30 transition-colors"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-brain-pink' : ''}`} />
                  </button>
                </div>
                <p className="text-white/80 text-sm mb-2">{nugget.fact}</p>
                <p className="text-brain-lime font-medium">{nugget.vibe}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Quiz Section */
          <div>
            <p className="text-lg font-bold mb-4">{content.quiz.question}</p>
            <div className="space-y-3">
              {content.quiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`quiz-option w-full text-left ${
                    selectedAnswer !== null
                      ? index === content.quiz.correct
                        ? 'correct'
                        : index === selectedAnswer
                        ? 'wrong'
                        : ''
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-brain-purple/30 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {selectedAnswer !== null && index === content.quiz.correct && (
                      <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                    )}
                    {selectedAnswer === index && index !== content.quiz.correct && (
                      <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                <p className="font-bold mb-2">
                  {isCorrect ? '🎉 ' + t('card.correct') : '😅 ' + t('card.incorrect')}
                </p>
                <p className="text-sm text-white/80">{content.quiz.explanation}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={onNext}
          className="mt-6 w-full btn-primary flex items-center justify-center gap-2"
        >
          {t('card.next')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
