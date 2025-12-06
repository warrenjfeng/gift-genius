import React, { useState } from 'react'
import './GiftGuideForm.css'
import DualRangeSlider from './DualRangeSlider'

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
  "My girlfriend, 31, enjoys snowboarding, coffee, and traveling. Budget: $70-100",
  "My mom, 63, loves gardening, true crime documentaries, and trying new recipes. Budget: $50-70",
  "My brother, 27, is into triathlons, training, and fashion. Budget: $30-50"
]

function GiftGuideForm({ onSubmit, error }) {
  const [description, setDescription] = useState('')
  const [budgetRange, setBudgetRange] = useState({ min: 30, max: 100 })
  const [occasion, setOccasion] = useState('Christmas')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      description,
      budgetMin: budgetRange.min,
      budgetMax: budgetRange.max,
      occasion
    })
  }

  const handleExampleClick = (example) => {
    setDescription(example)
    // Try to extract budget from example
    const budgetMatch = example.match(/Budget:\s*\$\s*(\d+)\s*-\s*(\d+)/i)
    if (budgetMatch) {
      setBudgetRange({
        min: parseInt(budgetMatch[1]),
        max: parseInt(budgetMatch[2])
      })
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
            placeholder="Describe the gift recipient... (e.g. age, interests, hobbies, personality)"
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
            <label htmlFor="budget" className="form-label">
              Budget Range: ${budgetRange.min} - ${budgetRange.max}
            </label>
            <DualRangeSlider
              min={0}
              max={200}
              step={5}
              value={budgetRange}
              onChange={setBudgetRange}
            />
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

