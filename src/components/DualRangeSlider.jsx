import React, { useRef, useEffect, useState } from 'react'
import './DualRangeSlider.css'

function DualRangeSlider({ min, max, value, onChange, step = 5 }) {
  const [minVal, setMinVal] = useState(value.min)
  const [maxVal, setMaxVal] = useState(value.max)
  const minValRef = useRef(value.min)
  const maxValRef = useRef(value.max)
  const range = useRef(null)

  // Convert to percentage
  const getPercent = (val) => Math.round(((val - min) / (max - min)) * 100)

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal)
    const maxPercent = getPercent(maxValRef.current)

    if (range.current) {
      range.current.style.left = `${minPercent}%`
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [minVal, min, max])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current)
    const maxPercent = getPercent(maxVal)

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [maxVal, min, max])

  // Update parent when values change
  useEffect(() => {
    onChange({ min: minVal, max: maxVal })
  }, [minVal, maxVal, onChange])

  return (
    <div className="dual-range-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - step)
          setMinVal(value)
          minValRef.current = value
        }}
        className="dual-range-thumb dual-range-thumb--left"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + step)
          setMaxVal(value)
          maxValRef.current = value
        }}
        className="dual-range-thumb dual-range-thumb--right"
      />
      <div className="dual-range-slider">
        <div className="dual-range-slider__track" />
        <div ref={range} className="dual-range-slider__range" />
        <div className="dual-range-slider__left-value">${minVal}</div>
        <div className="dual-range-slider__right-value">${maxVal}</div>
      </div>
    </div>
  )
}

export default DualRangeSlider

