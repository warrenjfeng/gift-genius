import React, { useState } from 'react'
import './GiftGuideForm.css'

const OCCASIONS = [
  'Christmas',
  'Hanukkah',
  'Birthday',
  'General',
  'Valentine\'s Day',
  'Anniversary',
  'Graduation',
  'Mother\'s Day',
  'Father\'s Day'
]

const EXAMPLE_DESCRIPTIONS = [
  "My mom, 58, loves gardening, murder mystery podcasts, and trying new recipes. Budget: $50-200",
  "My brother, 25, is into video games, craft beer, and hiking. Budget: $30-100",
  "My girlfriend, 28, enjoys yoga, reading fantasy novels, and minimalist design. Budget: $40-150",
  "My dad, 62, loves classic cars, woodworking, and jazz music. Budget: $50-300"
]

function GiftGuideForm({ onSubmit, error }) {
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState(50)
  const [budgetMax, setBudgetMax] = useState(200)
  const [occasion, setOccasion] = useState('Christmas')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      description,
      budgetMin,
      budgetMax,
      occasion
    })
  }

  const handleExampleClick = (example) => {
    setDescription(example)
    // Try to extract budget from example
    const budgetMatch = example.match(/Budget:\s*\$\s*(\d+)\s*-\s*(\d+)/i)
    if (budgetMatch) {
      setBudgetMin(parseInt(budgetMatch[1]))
      setBudgetMax(parseInt(budgetMatch[2]))
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="gift-guide-form">
        <div className="form-section">
          <label htmlFor="description" className="form-label">
            Recipient Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the gift recipient... (e.g., age, interests, hobbies, personality)"
            className="form-textarea"
            rows="5"
            required
          />
          <div className="example-descriptions">
            <p className="example-label">Quick examples:</p>
            <div className="example-buttons">
              {EXAMPLE_DESCRIPTIONS.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="example-button"
                  onClick={() => handleExampleClick(example)}
                >
                  Example {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-section">
            <label htmlFor="budgetMin" className="form-label">
              Budget: ${budgetMin} - ${budgetMax}
            </label>
            <div className="budget-inputs">
              <input
                type="range"
                id="budgetMin"
                min="0"
                max="500"
                step="10"
                value={budgetMin}
                onChange={(e) => setBudgetMin(parseInt(e.target.value))}
                className="budget-slider"
              />
              <input
                type="range"
                id="budgetMax"
                min="0"
                max="1000"
                step="10"
                value={budgetMax}
                onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                className="budget-slider"
              />
            </div>
            <div className="budget-values">
              <span>Min: ${budgetMin}</span>
              <span>Max: ${budgetMax}</span>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="occasion" className="form-label">
              Occasion
            </label>
            <select
              id="occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="form-select"
            >
              {OCCASIONS.map(occ => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button type="submit" className="submit-button">
          Generate Gift Guide
        </button>
      </form>
    </div>
  )
}

export default GiftGuideForm

