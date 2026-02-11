import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { uploadPDF } from '../lib/api'
import { useStudyStore } from '../lib/store'

interface FileUploadProps {
  onUploadComplete: () => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setUploadedData = useStudyStore((state) => state.setUploadedData)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadPDF(file)
      setUploadedData(result.chunks, result.filename)
      onUploadComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [setUploadedData, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`
          relative p-8 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 group
          ${isDragActive 
            ? 'border-brain-pink bg-brain-pink/10 scale-105' 
            : 'border-brain-purple/50 hover:border-brain-cyan bg-brain-dark/50'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} data-testid="file-input" />
        
        <div className="flex flex-col items-center gap-4 text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-16 h-16 text-brain-pink animate-spin" />
              <p className="text-lg font-medium">{t('upload.processing')}</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brain-purple/20 to-brain-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isDragActive ? (
                  <FileText className="w-10 h-10 text-brain-pink" />
                ) : (
                  <Upload className="w-10 h-10 text-brain-cyan" />
                )}
              </div>
              
              <div>
                <p className="text-xl font-bold mb-1">
                  {isDragActive ? t('upload.drop') : t('upload.dragDrop')}
                </p>
                <p className="text-white/60 text-sm">
                  {t('upload.hint')}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>📄 PDF</span>
                <span>•</span>
                <span>{t('upload.maxSize')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200"
        >
          ⚠️ {error}
        </motion.div>
      )}

      <p className="mt-4 text-center text-xs text-white/40">
        {t('upload.disclaimer')}
      </p>
    </motion.div>
  )
}
