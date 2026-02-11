import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { getProducts, createCheckout, Product } from '../lib/api'

export default function PricingPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(data => {
        setProducts(data.products)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load products')
        setLoading(false)
      })
  }, [])

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId)
    setError(null)

    try {
      const { checkout_url } = await createCheckout(productId)
      window.location.href = checkout_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setPurchasing(null)
    }
  }

  const features = [
    t('pricing.features.brainrot'),
    t('pricing.features.quiz'),
    t('pricing.features.tts'),
    t('pricing.features.languages'),
    t('pricing.features.export'),
  ]

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brain-pink animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">{t('pricing.title')}</span> 🚀
          </h1>
          <p className="text-xl text-white/70">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product, index) => {
            const isPopular = index === 1
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative card-glass p-6 ${
                  isPopular ? 'ring-2 ring-brain-pink' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brain-purple to-brain-pink text-sm font-bold">
                    {t('pricing.popular')} 🔥
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-display font-bold text-brain-cyan">
                      ${product.price}
                    </span>
                    <span className="text-white/50">USD</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    {product.tokens} {t('pricing.conversions')}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-brain-lime flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(product.id)}
                  disabled={purchasing !== null}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isPopular
                      ? 'btn-primary'
                      : 'bg-brain-dark/50 border border-brain-purple/50 hover:border-brain-pink'
                  }`}
                >
                  {purchasing === product.id ? (
                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      {t('pricing.buy')}
                    </>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ or Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/50 text-sm">
            🔒 {t('pricing.secure')} • 💳 {t('pricing.refund')}
          </p>
        </motion.div>
      </div>
    </main>
  )
}
