import { API_CONFIG } from '../config'

/**
 * Generate a complete gift guide using Gemini 3 and Nano Banana Pro
 */
export async function generateGiftGuide(formData, onProgress) {
  try {
    // Stage 1: Use Gemini 3 to analyze and generate recommendations
    onProgress?.('Analyzing recipient details with Gemini 3...')
    const analysis = await analyzeWithGemini(formData)
    
    onProgress?.('Generating gift recommendations...')
    const recommendations = await generateRecommendationsWithGemini(formData, analysis)
    
    // Stage 2: Fetch product links from Gemini
    onProgress?.('Finding product links and purchase options...')
    const recommendationsWithLinks = await addProductLinks(recommendations)
    
    // Stage 3: Create enhanced design brief for Nano Banana Pro
    onProgress?.('Creating detailed design brief with product specifications...')
    const designBrief = await createDesignBriefWithGemini(formData, recommendationsWithLinks)
    
    // Stage 4: Generate individual product images with Nano Banana Pro
    const recipientName = extractRecipientName(formData.description)
    const recommendationsWithImages = await generateProductImages(
      recommendationsWithLinks, 
      designBrief,
      (progress) => onProgress?.(progress)
    )
    
    return {
      recipientName: recipientName,
      recommendations: recommendationsWithImages,
      designBrief: designBrief,
      occasion: formData.occasion
    }
  } catch (error) {
    console.error('Error in generateGiftGuide:', error)
    throw error
  }
}

/**
 * Analyze recipient details using Gemini 3
 */
async function analyzeWithGemini(formData) {
  const prompt = `Analyze the following gift recipient description and extract key information:

Description: "${formData.description}"
Occasion: ${formData.occasion}
Budget Range: $${formData.budgetMin} - $${formData.budgetMax}

Please extract and return a JSON object with:
- age (number or null if not specified)
- interests (array of strings)
- personality_traits (array of strings)
- aesthetic_preferences (array of strings describing style preferences)
- lifestyle (string describing their lifestyle)

Return ONLY valid JSON, no additional text.`

  const response = await callGeminiAPI(prompt)
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse Gemini response:', e)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

/**
 * Generate gift recommendations using Gemini 3
 */
async function generateRecommendationsWithGemini(formData, analysis) {
  const prompt = `Based on the following recipient analysis, generate 6-8 specific gift recommendations:

Recipient Analysis: ${JSON.stringify(analysis)}
Occasion: ${formData.occasion}
Budget Range: $${formData.budgetMin} - $${formData.budgetMax}

For each gift, provide:
- name: Specific gift name
- price: Estimated price (number)
- reasoning: 1-2 sentences explaining why this gift fits
- category: Product category/type

Return a JSON array of gift objects. Each gift should be:
- Personalized and thoughtful
- Within the budget range
- Appropriate for the occasion
- Aligned with their interests and personality

Return ONLY valid JSON array, no additional text.`

  const response = await callGeminiAPI(prompt)
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse Gemini response:', e)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

/**
 * Add product links using Gemini 3
 */
async function addProductLinks(recommendations) {
  const prompt = `For each of the following gift recommendations, provide a purchase link (Amazon, Target, or other major retailer) and a brief product description:

${recommendations.map((g, i) => `${i + 1}. ${g.name} - $${g.price} (${g.category})`).join('\n')}

For each gift, return:
- purchase_link: A real URL to purchase this product (prefer Amazon, Target, Best Buy, or other major retailers)
- product_description: 1-2 sentences describing the specific product features
- brand: Brand name if applicable

Return a JSON array where each object matches the original gift order and includes the original fields plus the new fields above. Return ONLY valid JSON array, no additional text.`

  const response = await callGeminiAPI(prompt)
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const linksData = JSON.parse(jsonMatch[0])
      // Merge with original recommendations
      return recommendations.map((rec, idx) => ({
        ...rec,
        purchase_link: linksData[idx]?.purchase_link || null,
        product_description: linksData[idx]?.product_description || rec.reasoning,
        brand: linksData[idx]?.brand || null
      }))
    }
    // If parsing fails, return original recommendations
    return recommendations
  } catch (e) {
    console.error('Failed to parse product links:', e)
    return recommendations
  }
}

/**
 * Create enhanced design brief for Nano Banana Pro using Gemini 3
 */
async function createDesignBriefWithGemini(formData, recommendations) {
  const prompt = `Create a detailed, immersive design brief for a magazine-style gift guide with high-quality product visualizations.

Recipient: ${formData.description}
Occasion: ${formData.occasion}
Gifts: ${JSON.stringify(recommendations.map(g => ({ 
  name: g.name, 
  price: g.price, 
  category: g.category,
  product_description: g.product_description || g.reasoning
})))}

The design brief should specify:
- Layout: Magazine-style, one-page layout with elegant header and gift grid (2-3 columns)
- Color palette: Colors matching the recipient's aesthetic (provide 5-6 hex codes)
- Typography: Specific font choices and hierarchy for header, gift names, prices, and descriptions
- Background: Style, texture, and visual elements
- Product_visualization_style: Detailed description of how each product should be visualized (e.g., "photorealistic product images", "lifestyle photography", "3D renders")
- Product_image_requirements: Specific requirements for each product image (lighting, angle, context)
- Overall aesthetic: Design mood, style, and visual language
- Visual_elements: Additional decorative elements, patterns, or graphics to enhance the design

Return a JSON object with these fields. Return ONLY valid JSON, no additional text.`

  const response = await callGeminiAPI(prompt)
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse Gemini response:', e)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

/**
 * Generate individual product images using Nano Banana Pro
 */
async function generateProductImages(recommendations, designBrief, onProgress) {
  const productImages = []
  
  for (let i = 0; i < recommendations.length; i++) {
    const gift = recommendations[i]
    onProgress?.(`Generating product image ${i + 1} of ${recommendations.length}: ${gift.name}...`)
    
    const prompt = `Create a photorealistic, high-quality product image of: ${gift.name}

Product Details:
- Category: ${gift.category}
- Description: ${gift.product_description || gift.reasoning}
- Price: $${gift.price}

Image Requirements:
- Photorealistic product photography
- Professional studio lighting
- Clean, minimalist background (white or subtle gradient)
- Show the actual product clearly from an appealing angle
- High resolution (1024x1024px minimum)
- Product should be the main focus, well-lit and detailed
- If it's electronics (like headphones), show the actual product with realistic materials and textures
- If it's a physical product, show it in a lifestyle-appropriate context

Style: Professional e-commerce product photography, magazine-quality, crisp and clear.`

    const imageUrl = await callNanoBananaAPI(prompt)
    productImages.push({
      ...gift,
      product_image_url: imageUrl
    })
  }
  
  return productImages
}

/**
 * Call Gemini 3 API
 */
async function callGeminiAPI(prompt) {
  if (!API_CONFIG.GEMINI_API_KEY) {
    // Fallback for demo: return mock data
    console.warn('Gemini API key not configured, using mock data')
    return await getMockGeminiResponse(prompt)
  }

  try {
    // Use x-goog-api-key header as per Gemini 3 API documentation
    // https://ai.google.dev/gemini-api/docs/gemini-3
    const response = await fetch(API_CONFIG.GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_CONFIG.GEMINI_API_KEY
      },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`Gemini API error (${response.status}): ${errorText}`)
      // Fallback to mock data on API errors
      return await getMockGeminiResponse(prompt)
    }

    const data = await response.json()
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    }
    throw new Error('Unexpected response format from Gemini API')
  } catch (error) {
    console.warn('Gemini API call failed, using mock data:', error.message)
    // Fallback to mock data
    return await getMockGeminiResponse(prompt)
  }
}

/**
 * Call Gemini 3 Pro Image API (Nano Banana Pro) for image generation
 * Documentation: https://ai.google.dev/gemini-api/docs/gemini-3
 */
async function callNanoBananaAPI(prompt) {
  if (!API_CONFIG.NANO_BANANA_API_KEY) {
    // Fallback: generate placeholder image
    console.warn('Gemini 3 Pro Image API key not configured, using placeholder')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const productMatch = prompt.match(/product image of:\s*([^\n]+)/i) || 
                         prompt.match(/Create a photorealistic.*?of:\s*([^\n]+)/i)
    const productName = productMatch ? productMatch[1].trim() : 'Product'
    const encodedName = encodeURIComponent(productName.substring(0, 30))
    return `https://via.placeholder.com/1024x1024/f5f7fa/667eea?text=${encodedName}`
  }

  try {
    // Extract product name for better image generation
    const productMatch = prompt.match(/product image of:\s*([^\n]+)/i) || 
                         prompt.match(/Create a photorealistic.*?of:\s*([^\n]+)/i)
    const productName = productMatch ? productMatch[1].trim() : 'product'
    
    // Use Gemini 3 Pro Image API for image generation
    // Based on: https://ai.google.dev/gemini-api/docs/gemini-3
    const response = await fetch(API_CONFIG.NANO_BANANA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_CONFIG.NANO_BANANA_API_KEY
      },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "2K" // 2048x2048
            }
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.warn(`Gemini 3 Pro Image API error (${response.status}):`, errorData)
      // Fallback to placeholder
      const encodedName = encodeURIComponent(productName.substring(0, 30))
      return `https://via.placeholder.com/1024x1024/f5f7fa/667eea?text=${encodedName}`
    }

    const data = await response.json()
    
    // Extract image from response
    // Gemini 3 Pro Image returns images in inline_data format
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      for (const part of parts) {
        if (part.inlineData) {
          // Convert base64 to data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        }
      }
    }
    
    // If no image found, return placeholder
    const encodedName = encodeURIComponent(productName.substring(0, 30))
    return `https://via.placeholder.com/1024x1024/f5f7fa/667eea?text=${encodedName}`
  } catch (error) {
    console.warn('Gemini 3 Pro Image API call failed, using placeholder:', error.message)
    // Fallback to placeholder
    const productMatch = prompt.match(/product image of:\s*([^\n]+)/i) || 
                         prompt.match(/Create a photorealistic.*?of:\s*([^\n]+)/i)
    const productName = productMatch ? productMatch[1].trim() : 'Product'
    const encodedName = encodeURIComponent(productName.substring(0, 30))
    return `https://via.placeholder.com/1024x1024/f5f7fa/667eea?text=${encodedName}`
  }
}

/**
 * Extract recipient name from description (simple heuristic)
 */
function extractRecipientName(description) {
  // Try multiple patterns
  const patterns = [
    /(?:my|for)\s+([a-z]+)/i,
    /([A-Z][a-z]+),?\s+\d+/,
    /([A-Z][a-z]+)\s+(?:loves|enjoys|is into)/i
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1)
    }
  }
  
  return 'Your Recipient'
}

/**
 * Mock Gemini response for demo purposes
 * Simulates API delay and returns appropriate mock data
 */
async function getMockGeminiResponse(prompt) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Extract interests from description if available
  const descriptionMatch = prompt.match(/Description:\s*"([^"]+)"/)
  const description = descriptionMatch ? descriptionMatch[1] : ''
  
  // Simple heuristics to return appropriate mock data
  if (prompt.includes('Analyze the following')) {
    // Extract age if mentioned
    const ageMatch = description.match(/(\d+)/)
    const age = ageMatch ? parseInt(ageMatch[1]) : null
    
    // Extract interests from description
    const interests = []
    if (description.toLowerCase().includes('garden')) interests.push('gardening')
    if (description.toLowerCase().includes('podcast') || description.toLowerCase().includes('mystery')) interests.push('murder mystery podcasts')
    if (description.toLowerCase().includes('recipe') || description.toLowerCase().includes('cook')) interests.push('cooking')
    if (description.toLowerCase().includes('game')) interests.push('video games')
    if (description.toLowerCase().includes('beer')) interests.push('craft beer')
    if (description.toLowerCase().includes('hiking')) interests.push('hiking')
    if (description.toLowerCase().includes('yoga')) interests.push('yoga')
    if (description.toLowerCase().includes('read')) interests.push('reading')
    if (description.toLowerCase().includes('car')) interests.push('classic cars')
    if (description.toLowerCase().includes('wood')) interests.push('woodworking')
    if (description.toLowerCase().includes('jazz')) interests.push('jazz music')
    
    if (interests.length === 0) {
      interests.push('hobbies', 'learning new things')
    }
    
    return JSON.stringify({
      age: age,
      interests: interests,
      personality_traits: ['thoughtful', 'curious', 'creative'],
      aesthetic_preferences: ['natural', 'cozy', 'traditional'],
      lifestyle: 'Active, enjoys hobbies and learning new things'
    })
  }
  
  if (prompt.includes('generate 6-8 specific gift recommendations')) {
    // Extract budget from prompt
    const budgetMatch = prompt.match(/\$(\d+)\s*-\s*\$(\d+)/)
    const budgetMin = budgetMatch ? parseInt(budgetMatch[1]) : 50
    const budgetMax = budgetMatch ? parseInt(budgetMatch[2]) : 200
    
    // Generate gifts based on interests in the analysis
    const analysisMatch = prompt.match(/Recipient Analysis:\s*({[^}]+})/)
    let interests = ['gardening', 'cooking', 'reading']
    if (analysisMatch) {
      try {
        const analysis = JSON.parse(analysisMatch[1])
        if (analysis.interests) {
          interests = analysis.interests
        }
      } catch (e) {
        // Use default interests
      }
    }
    
    const gifts = []
    
    if (interests.some(i => i.includes('garden'))) {
      gifts.push({
        name: 'Premium Gardening Tool Set',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3),
        reasoning: 'Perfect for their gardening passion, these high-quality tools will make their hobby even more enjoyable.',
        category: 'Gardening Tools'
      })
    }
    
    if (interests.some(i => i.includes('mystery') || i.includes('podcast'))) {
      gifts.push({
        name: 'Murder Mystery Book Collection',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.2),
        reasoning: 'A curated selection of acclaimed mystery novels to fuel their interest.',
        category: 'Books'
      })
    }
    
    if (interests.some(i => i.includes('cook') || i.includes('recipe'))) {
      gifts.push({
        name: 'Artisan Recipe Cookbook',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.15),
        reasoning: 'Inspires their love of trying new recipes with beautiful photography and unique dishes.',
        category: 'Cookbook'
      })
    }
    
    if (interests.some(i => i.includes('game'))) {
      gifts.push({
        name: 'Premium Gaming Accessories',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4),
        reasoning: 'Enhances their gaming experience with high-quality accessories.',
        category: 'Gaming'
      })
    }
    
    if (interests.some(i => i.includes('beer'))) {
      gifts.push({
        name: 'Craft Beer Tasting Set',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3),
        reasoning: 'Perfect for exploring new craft beers and flavors.',
        category: 'Beverages'
      })
    }
    
    if (interests.some(i => i.includes('hiking'))) {
      gifts.push({
        name: 'Outdoor Adventure Gear',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.5),
        reasoning: 'Essential gear for their hiking adventures and outdoor activities.',
        category: 'Outdoor Gear'
      })
    }
    
    // Fill to 6-8 gifts
    const defaultGifts = [
      { name: 'Premium Coffee Subscription', price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3), reasoning: 'Perfect for enjoying during leisure time.', category: 'Subscription' },
      { name: 'Noise-Cancelling Headphones', price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.6), reasoning: 'Enhances their listening experience with superior audio quality.', category: 'Electronics' },
      { name: 'Personalized Gift Basket', price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4), reasoning: 'A thoughtful collection of items tailored to their interests.', category: 'Gift Set' }
    ]
    
    while (gifts.length < 6 && defaultGifts.length > 0) {
      gifts.push(defaultGifts.shift())
    }
    
    return JSON.stringify(gifts.slice(0, 8))
  }
  
  if (prompt.includes('Create a detailed, immersive design brief')) {
    return JSON.stringify({
      layout: 'Magazine-style one-page layout with elegant header and 2-3 column gift grid',
      color_palette: ['#8B7355', '#D4A574', '#F5E6D3', '#2C5530', '#FFFFFF', '#E8D5C4'],
      typography: {
        header: 'Playfair Display, serif, bold, 48px',
        gift_name: 'Montserrat, sans-serif, semi-bold, 20px',
        price: 'Montserrat, sans-serif, bold, 24px',
        body: 'Open Sans, sans-serif, regular, 14px',
        caption: 'Open Sans, sans-serif, italic, 12px'
      },
      background: 'Soft cream with subtle texture, warm and inviting, with elegant decorative elements',
      product_visualization_style: 'Photorealistic product photography with professional lighting, showcasing actual products in appealing contexts',
      product_image_requirements: 'High-resolution product images, well-lit, clear product details, subtle lifestyle context, professional composition',
      overall_aesthetic: 'Cozy, traditional, elegant magazine style with natural tones and premium feel',
      visual_elements: 'Subtle decorative borders, elegant spacing, premium paper texture effect, sophisticated color accents'
    })
  }
  
  if (prompt.includes('For each of the following gift recommendations')) {
    // Extract gift information from prompt
    const giftMatches = prompt.matchAll(/(\d+)\.\s+([^-]+)\s+-\s+\$(\d+)\s+\(([^)]+)\)/g)
    const gifts = []
    for (const match of giftMatches) {
      gifts.push({
        name: match[2].trim(),
        price: parseInt(match[3]),
        category: match[4]
      })
    }
    
    // Generate mock product links
    const mockLinks = gifts.map((g) => ({
      purchase_link: `https://www.amazon.com/s?k=${encodeURIComponent(g.name)}`,
      product_description: `Premium ${g.name} with excellent quality and thoughtful design. Perfect gift choice.`,
      brand: g.category
    }))
    return JSON.stringify(mockLinks)
  }
  
  return JSON.stringify({})
}

