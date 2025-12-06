import React from 'react'
import './LoadingState.css'

function LoadingState({ stage }) {
  // Determine which step is active based on stage text
  const getActiveStep = () => {
    if (!stage) return 0
    if (stage.includes('Analyzing') || stage.includes('Generating gift recommendations')) return 1
    if (stage.includes('Finding product links') || stage.includes('Creating')) return 2
    if (stage.includes('Rendering')) return 3
    return 0
  }

  const activeStep = getActiveStep()

  return (
    <div className="loading-container">
      <div className="loading-card">
        <div className="spinner"></div>
        <h2>Generating Your Immersive Gift Guide</h2>
        <p className="loading-stage">{stage || 'Processing...'}</p>
        <div className="loading-steps">
          <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
            <div className="step-icon">🧠</div>
            <div className="step-text">Analyzing with Gemini 3</div>
          </div>
          <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
            <div className="step-icon">🔗</div>
            <div className="step-text">Finding Product Links</div>
          </div>
          <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
            <div className="step-icon">🎨</div>
            <div className="step-text">Rendering with Nano Banana Pro</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingState

