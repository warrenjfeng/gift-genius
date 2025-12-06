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
          <title>Gift Guide for ${guide.recipientName || 'Your Recipient'}</title>
          <style>
            @media print {
              @page { size: letter; margin: 0.5in; }
              body { margin: 0; padding: 0; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            .magazine-guide { 
              max-width: 100%;
              margin: 0 auto;
            }
            .magazine-header {
              text-align: center;
              margin-bottom: 20px;
              page-break-after: avoid;
            }
            .magazine-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              page-break-inside: avoid;
            }
            .magazine-item {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .magazine-item-image {
              height: 150px !important;
              margin-bottom: 10px;
            }
            .magazine-item-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .magazine-item-content {
              padding: 10px;
            }
            .item-name {
              font-size: 14px !important;
              margin-bottom: 5px;
            }
            .item-price {
              font-size: 18px !important;
            }
            .item-description {
              font-size: 11px !important;
              line-height: 1.4;
              margin: 8px 0;
            }
            .item-footer {
              margin-top: 8px;
              padding-top: 8px;
              font-size: 10px;
            }
            .item-purchase-link {
              display: none;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleShare = async () => {
    try {
      // Create a shareable data URL
      const guideData = {
        recipientName: guide.recipientName,
        occasion: guide.occasion,
        recommendations: guide.recommendations.map(g => ({
          name: g.name,
          price: g.price,
          reasoning: g.reasoning,
          category: g.category,
          purchase_link: g.purchase_link
        }))
      }
      
      const dataStr = JSON.stringify(guideData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: `${guide.recipientName || 'Gift'}'s Gift Guide`,
          text: `Check out this personalized gift guide for ${guide.occasion}!`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        const shareText = `${guide.recipientName || 'Gift'}'s Gift Guide for ${guide.occasion}\n\n` +
          guide.recommendations.map(g => `• ${g.name} - $${g.price}`).join('\n') +
          `\n\nView full guide: ${window.location.href}`
        
        await navigator.clipboard.writeText(shareText)
        alert('Gift guide copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Fallback: copy JSON to clipboard
      try {
        const dataStr = JSON.stringify(guideData, null, 2)
        await navigator.clipboard.writeText(dataStr)
        alert('Gift guide data copied to clipboard!')
      } catch (e) {
        alert('Share not available. Please use Print/Download instead.')
      }
    }
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="header-content">
          <h2>Your Gift Guide is Ready! 🎁</h2>
          <p className="occasion-badge">{guide.occasion}</p>
        </div>
        <div className="result-actions">
          <button onClick={handleShare} className="share-button">
            🔗 Share
          </button>
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
          <h1 className="magazine-title">
            {guide.recipientName 
              ? `${guide.recipientName}'s Gift Guide`
              : 'Your Gift Guide'}
          </h1>
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

