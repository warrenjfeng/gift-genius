import React from 'react'
import './GiftGuideResult.css'

function GiftGuideResult({ guide, onGenerateAnother }) {
  const handleDownload = () => {
    // Create a printable/downloadable version of the guide
    const printWindow = window.open('', '_blank')
    const content = document.querySelector('.magazine-guide').innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gift Guide for ${guide.recipientName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
            .magazine-guide { max-width: 1200px; margin: 0 auto; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="header-content">
          <h2>Your Gift Guide is Ready! 🎁</h2>
          <p className="occasion-badge">{guide.occasion}</p>
        </div>
        <div className="result-actions">
          <button onClick={handleDownload} className="download-button">
            📥 Print/Download
          </button>
          <button onClick={onGenerateAnother} className="generate-another-button">
            ✨ Generate Another
          </button>
        </div>
      </div>

      <div className="magazine-guide">
        <div className="magazine-header">
          <h1 className="magazine-title">Gift Guide for {guide.recipientName || 'Your Recipient'}</h1>
          <p className="magazine-subtitle">Curated with care for {guide.occasion}</p>
        </div>

        <div className="magazine-grid">
          {guide.recommendations?.map((gift, idx) => (
            <article key={idx} className="magazine-item">
              <div className="magazine-item-image">
                {gift.product_image_url ? (
                  <>
                    <img 
                      src={gift.product_image_url} 
                      alt={gift.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.target.style.display = 'none'
                        const placeholder = e.target.nextElementSibling
                        if (placeholder) placeholder.style.display = 'flex'
                      }}
                    />
                    <div className="product-image-placeholder" style={{ display: 'none' }}>
                      <div className="placeholder-content">
                        <span className="placeholder-icon">📦</span>
                        <span className="placeholder-text">{gift.name}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="product-image-placeholder">
                    <div className="placeholder-content">
                      <span className="placeholder-icon">📦</span>
                      <span className="placeholder-text">{gift.name}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="magazine-item-content">
                <div className="item-header">
                  <h3 className="item-name">{gift.name}</h3>
                  <span className="item-price">${gift.price}</span>
                </div>
                
                {gift.brand && (
                  <div className="item-brand">{gift.brand}</div>
                )}
                
                <p className="item-description">
                  {gift.reasoning || gift.product_description}
                </p>
                
                <div className="item-footer">
                  <span className="item-category">{gift.category}</span>
                  {gift.purchase_link && (
                    <a 
                      href={gift.purchase_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="item-purchase-link"
                    >
                      Shop Now →
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GiftGuideResult

