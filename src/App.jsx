import React, { useState } from 'react'
import './App.css'
import GiftGuideForm from './components/GiftGuideForm'
import LoadingState from './components/LoadingState'
import GiftGuideResult from './components/GiftGuideResult'
import { generateGiftGuide } from './services/giftGuideService'

function App() {
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      setLoadingStage('Analyzing recipient details and generating recommendations...')
      const guide = await generateGiftGuide(formData, (stage) => setLoadingStage(stage))
      
      // Ensure we have recommendations even if some steps failed
      if (!guide.recommendations || guide.recommendations.length === 0) {
        throw new Error('No recommendations were generated. Please try again.')
      }
      
      setResult(guide)
    } catch (err) {
      console.error('Error generating gift guide:', err)
      setError(err.message || 'Failed to generate gift guide. The app will use demo data. Please check your API keys in the .env file.')
    } finally {
      setLoading(false)
      setLoadingStage('')
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎁 GiftGenius</h1>
        <p className="subtitle">AI-Powered Holiday Gift Guide Generator</p>
      </header>

      <main className="app-main">
        {!result && !loading && (
          <GiftGuideForm onSubmit={handleGenerate} error={error} />
        )}

        {loading && (
          <LoadingState stage={loadingStage} />
        )}

        {result && !loading && (
          <GiftGuideResult 
            guide={result} 
            onGenerateAnother={handleReset}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Gemini 3 & Nano Banana Pro</p>
      </footer>
    </div>
  )
}

export default App

