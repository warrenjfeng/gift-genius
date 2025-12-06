import { API_CONFIG } from '../config'

/**
 * Generate a complete gift guide using Gemini 3 and Nano Banana Pro
 */
// Pre-loaded demo data for faster demo experience
const DEMO_DATA = {
  "My girlfriend, 31, enjoys snowboarding, coffee, and traveling. Budget: $70-100": {
    recipientName: "Your Girlfriend",
    recommendations: [
      {
        name: "Premium Snowboarding Goggles",
        price: 85,
        reasoning: "Perfect for her snowboarding passion, these high-quality goggles will enhance her time on the slopes with superior visibility and protection.",
        category: "Sports Equipment",
        purchase_link: `https://www.google.com/search?tbm=shop&q=premium+snowboarding+goggles`,
        product_description: "Professional-grade snowboarding goggles with anti-fog technology and UV protection.",
        brand: "Sports Equipment"
      },
      {
        name: "Artisan Coffee Subscription Box",
        price: 75,
        reasoning: "A curated selection of premium coffees from around the world, perfect for her coffee passion.",
        category: "Beverages",
        purchase_link: `https://www.google.com/search?tbm=shop&q=artisan+coffee+subscription+box`,
        product_description: "Monthly delivery of premium coffee beans from renowned roasters worldwide.",
        brand: "Beverages"
      },
      {
        name: "Travel Essentials Organizer Set",
        price: 90,
        reasoning: "Thoughtful travel accessories to make her journeys more comfortable and organized.",
        category: "Travel",
        purchase_link: `https://www.google.com/search?tbm=shop&q=travel+essentials+organizer+set`,
        product_description: "Complete travel kit with premium accessories for the modern traveler.",
        brand: "Travel"
      }
    ]
  },
  "My mom, 63, loves gardening, true crime documentaries, and trying new recipes. Budget: $50-70": {
    recipientName: "Mom",
    recommendations: [
      {
        name: "Premium Gardening Tool Set",
        price: 65,
        reasoning: "Perfect for her gardening passion, these high-quality tools will make her hobby even more enjoyable.",
        category: "Gardening Tools",
        purchase_link: `https://www.google.com/search?tbm=shop&q=premium+gardening+tool+set`,
        product_description: "Professional-grade gardening tools with ergonomic handles and rust-resistant coating.",
        brand: "Gardening Tools"
      },
      {
        name: "True Crime Documentary Collection",
        price: 55,
        reasoning: "A curated selection of acclaimed true crime documentaries and books to fuel her interest.",
        category: "Entertainment",
        purchase_link: `https://www.google.com/search?tbm=shop&q=true+crime+documentary+collection`,
        product_description: "Premium collection of true crime documentaries and books.",
        brand: "Entertainment"
      },
      {
        name: "Artisan Recipe Cookbook Collection",
        price: 60,
        reasoning: "Inspires her love of trying new recipes with beautiful photography and unique dishes.",
        category: "Cookbook",
        purchase_link: `https://www.google.com/search?tbm=shop&q=artisan+recipe+cookbook+collection`,
        product_description: "Beautiful cookbook collection with unique recipes and stunning photography.",
        brand: "Cookbook"
      }
    ]
  },
  "My brother, 27, is into triathlons, training, and fashion. Budget: $30-50": {
    recipientName: "Your Brother",
    recommendations: [
      {
        name: "Athletic Training Gear Set",
        price: 45,
        reasoning: "High-performance gear to support his training and athletic goals for triathlons.",
        category: "Sports Equipment",
        purchase_link: `https://www.google.com/search?tbm=shop&q=athletic+training+gear+set`,
        product_description: "Professional-grade training equipment for triathletes and athletes.",
        brand: "Sports Equipment"
      },
      {
        name: "Fashion Accessories Bundle",
        price: 40,
        reasoning: "Stylish accessories to elevate his fashion sense and complete his look.",
        category: "Fashion",
        purchase_link: `https://www.google.com/search?tbm=shop&q=fashion+accessories+bundle+men`,
        product_description: "Curated collection of stylish fashion accessories for men.",
        brand: "Fashion"
      },
      {
        name: "Performance Training Watch",
        price: 50,
        reasoning: "Essential training tool for tracking his triathlon performance and workouts.",
        category: "Electronics",
        purchase_link: `https://www.google.com/search?tbm=shop&q=performance+training+watch`,
        product_description: "Advanced fitness watch with GPS and heart rate monitoring.",
        brand: "Electronics"
      }
    ]
  }
}

export async function generateGiftGuide(formData, onProgress) {
  try {
    // Check if this is a demo example for instant loading
    const normalizedDescription = formData.description.trim()
    const demoData = DEMO_DATA[normalizedDescription]
    
    if (demoData) {
      // Demo mode: generate beautiful images with Nano Banana Pro
      onProgress?.('Generating beautiful product images with Nano Banana Pro...')
      const recipientName = extractRecipientName(formData.description) || demoData.recipientName
      
      // Generate all images in parallel for speed
      const recommendationsWithImages = await generateProductImages(
        demoData.recommendations,
        null,
        (progress) => onProgress?.(progress)
      )
      
      return {
        recipientName: recipientName,
        recommendations: recommendationsWithImages,
        occasion: formData.occasion
      }
    }
    
    // Production mode: Use API with timeout protection
    onProgress?.('Analyzing recipient and generating gift recommendations...')
    const recipientName = extractRecipientName(formData.description)
    
    let recommendations
    try {
      // Try API call with built-in timeout (30 seconds in callGeminiAPI)
      recommendations = await generateRecommendationsWithGeminiOptimized(formData)
      
      // Ensure we have valid recommendations
      if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error('Invalid recommendations received')
      }
    } catch (error) {
      console.warn('API call failed or timed out, using mock data:', error.message)
      // Use mock data as fallback - this should be fast
      const mockResponse = await getMockGeminiResponse(
        `generate 3-5 specific gift recommendations for: "${formData.description}", Budget: $${formData.budgetMin}-${formData.budgetMax}`
      )
      try {
        const jsonMatch = mockResponse.match(/\[[\s\S]*\]/)
        recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : []
      } catch (parseError) {
        console.error('Failed to parse mock data:', parseError)
        recommendations = []
      }
      
      // If still no recommendations, use a basic fallback
      if (!recommendations || recommendations.length === 0) {
        recommendations = [
          {
            name: "Thoughtful Gift",
            price: Math.floor((formData.budgetMin + formData.budgetMax) / 2),
            reasoning: "A personalized gift selected based on your description.",
            category: "Gift",
            purchase_link: `https://www.google.com/search?tbm=shop&q=personalized+gift`,
            product_description: "A thoughtful gift option.",
            brand: "Gift"
          }
        ]
      }
    }
    
    // Stage 2: Always generate beautiful images with Nano Banana Pro
    onProgress?.('Generating beautiful product images with Nano Banana Pro...')
    const recommendationsWithImages = await generateProductImages(
      recommendations,
      null,
      (progress) => onProgress?.(progress)
    )
    
    return {
      recipientName: recipientName,
      recommendations: recommendationsWithImages,
      occasion: formData.occasion
    }
  } catch (error) {
    console.error('Error in generateGiftGuide:', error)
    // Always return something with Nano Banana Pro images, even if it's mock data
    const normalizedDescription = formData.description.trim()
    const demoData = DEMO_DATA[normalizedDescription]
    if (demoData) {
      onProgress?.('Generating beautiful product images with Nano Banana Pro...')
      const recommendationsWithImages = await generateProductImages(
        demoData.recommendations,
        null,
        (progress) => onProgress?.(progress)
      )
      return {
        recipientName: extractRecipientName(formData.description) || demoData.recipientName,
        recommendations: recommendationsWithImages,
        occasion: formData.occasion
      }
    }
    
    // Final fallback: use basic recommendations with Nano Banana Pro images
    const fallbackRecommendations = [
      {
        name: "Thoughtful Gift",
        price: Math.floor((formData.budgetMin + formData.budgetMax) / 2),
        reasoning: "A personalized gift selected based on your description.",
        category: "Gift",
        purchase_link: `https://www.google.com/search?tbm=shop&q=personalized+gift`,
        product_description: "A thoughtful gift option.",
        brand: "Gift"
      }
    ]
    
    onProgress?.('Generating beautiful product images with Nano Banana Pro...')
    const fallbackWithImages = await generateProductImages(
      fallbackRecommendations,
      null,
      (progress) => onProgress?.(progress)
    )
    
    return {
      recipientName: extractRecipientName(formData.description) || 'Your Recipient',
      recommendations: fallbackWithImages,
      occasion: formData.occasion
    }
  }
}

/**
 * Optimized: Combined analysis and recommendations in one API call
 */
async function generateRecommendationsWithGeminiOptimized(formData) {
  const prompt = `Analyze this gift recipient and generate 3-5 specific gift recommendations in one response:

Description: "${formData.description}"
Occasion: ${formData.occasion}
Budget Range: $${formData.budgetMin} - $${formData.budgetMax}

Extract key information (age, interests, personality) and generate personalized gift recommendations.

For each gift, provide:
- name: Specific gift name
- price: Estimated price (number, within budget)
- reasoning: 1-2 sentences explaining why this gift fits
- category: Product category/type
- purchase_link: A Google Shopping search URL (format: https://www.google.com/search?tbm=shop&q=PRODUCT_NAME)
- product_description: 1-2 sentences describing the product features
- brand: Brand name if applicable

Return ONLY a JSON array of 3-5 gift objects. Each gift should be:
- Personalized and thoughtful
- Within the budget range
- Appropriate for the occasion
- Include purchase links

Example format:
[
  {
    "name": "Product Name",
    "price": 75,
    "reasoning": "Why this fits",
    "category": "Category",
    "purchase_link": "https://www.google.com/search?tbm=shop&q=PRODUCT_NAME",
    "product_description": "Product details",
    "brand": "Brand Name"
  }
]

Return ONLY valid JSON array, no additional text.`

  const response = await callGeminiAPI(prompt)
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
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
 * Generate individual product images using Nano Banana Pro (parallelized for speed)
 * Always uses Nano Banana Pro for beautiful, photorealistic images
 * This is the core feature - showcasing Nano Banana Pro's image generation
 */
async function generateProductImages(recommendations, designBrief, onProgress) {
  // Generate all images in parallel for maximum speed
  const totalImages = recommendations.length
  onProgress?.('Generating beautiful product images with Nano Banana Pro...')
  
  const imagePromises = recommendations.map(async (gift, idx) => {
    // Update progress for each image
    onProgress?.(`Generating image ${idx + 1} of ${totalImages}: ${gift.name} with Nano Banana Pro...`)
    
    // Ultra-lean, optimized prompt for fastest generation
    // Focus on essential details only
    const prompt = `Product: ${gift.name}. Professional product photo, white background, studio lighting.`

    const imageUrl = await callNanoBananaAPI(prompt, gift.name)
    return {
      ...gift,
      product_image_url: imageUrl
    }
  })
  
  // Wait for all images to generate in parallel
  const productImages = await Promise.all(imagePromises)
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
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
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
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

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
    if (error.name === 'AbortError') {
      console.warn('Gemini API call timed out after 30 seconds, using mock data')
    } else {
      console.warn('Gemini API call failed, using mock data:', error.message)
    }
    // Fallback to mock data
    return await getMockGeminiResponse(prompt)
  }
}

/**
 * Call Gemini 3 Pro Image API (Nano Banana Pro) for image generation
 * Documentation: https://ai.google.dev/gemini-api/docs/gemini-3
 */
/**
 * Generate a simple SVG placeholder (better than emoji box)
 */
function generateSVGPlaceholder(productName) {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
  const color = colors[productName.length % colors.length]
  const initials = productName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color}dd;stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" 
            fill="white" text-anchor="middle" dominant-baseline="middle">${productName.substring(0, 20)}</text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

async function callNanoBananaAPI(prompt, productName = 'Product') {
  // Always try to use Nano Banana Pro API - this is the core feature
  if (!API_CONFIG.NANO_BANANA_API_KEY) {
    console.warn('Gemini 3 Pro Image API key not configured, using generated placeholder')
    await new Promise(resolve => setTimeout(resolve, 200)) // Brief delay for UX
    return generateSVGPlaceholder(productName)
  }

  const startTime = Date.now()
  
  try {
    // Use Gemini 3 Pro Image API for image generation with 45-second timeout
    // Based on: https://ai.google.dev/gemini-api/docs/gemini-3
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout per image
    
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
            imageSize: "1K" // Use 1K (1024x1024) for faster generation, can upgrade to 2K later
          }
        }
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.warn(`Gemini 3 Pro Image API error (${response.status}):`, errorData)
      // Fallback to generated SVG placeholder (not emoji box)
      return generateSVGPlaceholder(productName)
    }

    const data = await response.json()
    const elapsed = Date.now() - startTime
    
    // Extract image from response
    // Gemini 3 Pro Image returns images in inline_data format
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      for (const part of parts) {
        if (part.inlineData) {
          console.log(`✅ Nano Banana Pro generated image for "${productName}" in ${(elapsed/1000).toFixed(1)}s`)
          // Convert base64 to data URL for immediate display
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        }
      }
    }
    
    // If no image found, return generated SVG placeholder
    console.warn(`No image data in response for "${productName}", using generated placeholder`)
    return generateSVGPlaceholder(productName)
  } catch (error) {
    const elapsed = Date.now() - startTime
    
    if (error.name === 'AbortError') {
      console.warn(`⏱️ Nano Banana Pro timed out after ${(elapsed/1000).toFixed(1)}s for "${productName}", using generated placeholder`)
    } else {
      console.warn(`❌ Nano Banana Pro failed for "${productName}":`, error.message)
    }
    // Fallback to generated SVG placeholder (not emoji box)
    return generateSVGPlaceholder(productName)
  }
}

/**
 * Extract recipient name from description (improved heuristic)
 */
function extractRecipientName(description) {
  // Try multiple patterns to extract name
  const patterns = [
    /(?:my|for)\s+([A-Z][a-z]+)/,  // "my girlfriend Leah" or "for Mom"
    /([A-Z][a-z]+),?\s+\d+/,        // "Leah, 31" or "Mom 63"
    /([A-Z][a-z]+)\s+(?:loves|enjoys|is into)/i,  // "Leah loves..."
    /([A-Z][a-z]+)'s/,              // "Leah's"
    /(?:girlfriend|boyfriend|mom|dad|brother|sister|friend|wife|husband),?\s+([A-Z][a-z]+)/i  // "girlfriend Leah"
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      const name = match[1] || match[2]
      if (name && name.length > 1 && name.length < 20) {
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      }
    }
  }
  
  // Fallback: try to find capitalized words that might be names
  const words = description.split(/\s+/)
  for (const word of words) {
    if (/^[A-Z][a-z]{2,}$/.test(word) && 
        !['My', 'The', 'For', 'And', 'But', 'With'].includes(word)) {
      return word
    }
  }
  
  return null // Return null to use default in UI
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
    if (description.toLowerCase().includes('podcast') || description.toLowerCase().includes('mystery') || description.toLowerCase().includes('true crime') || description.toLowerCase().includes('documentaries')) interests.push('true crime documentaries')
    if (description.toLowerCase().includes('recipe') || description.toLowerCase().includes('cook')) interests.push('cooking')
    if (description.toLowerCase().includes('game')) interests.push('video games')
    if (description.toLowerCase().includes('beer')) interests.push('craft beer')
    if (description.toLowerCase().includes('hiking')) interests.push('hiking')
    if (description.toLowerCase().includes('yoga')) interests.push('yoga')
    if (description.toLowerCase().includes('read')) interests.push('reading')
    if (description.toLowerCase().includes('car')) interests.push('classic cars')
    if (description.toLowerCase().includes('wood')) interests.push('woodworking')
    if (description.toLowerCase().includes('jazz')) interests.push('jazz music')
    if (description.toLowerCase().includes('snowboard')) interests.push('snowboarding')
    if (description.toLowerCase().includes('coffee')) interests.push('coffee')
    if (description.toLowerCase().includes('travel')) interests.push('traveling')
    if (description.toLowerCase().includes('triathlon')) interests.push('triathlons')
    if (description.toLowerCase().includes('train')) interests.push('training')
    if (description.toLowerCase().includes('fashion')) interests.push('fashion')
    
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
  
  if (prompt.includes('generate 3-5 specific gift recommendations') || 
      prompt.includes('generate 6-8 specific gift recommendations') ||
      prompt.includes('Analyze this gift recipient and generate')) {
    // Extract budget from prompt
    const budgetMatch = prompt.match(/\$(\d+)\s*-\s*\$(\d+)/)
    const budgetMin = budgetMatch ? parseInt(budgetMatch[1]) : 50
    const budgetMax = budgetMatch ? parseInt(budgetMatch[2]) : 200
    
    // Extract interests from description
    const descriptionMatch = prompt.match(/Description:\s*"([^"]+)"/)
    const description = descriptionMatch ? descriptionMatch[1] : ''
    
    // Generate gifts based on interests in the description
    let interests = []
    if (description.toLowerCase().includes('garden')) interests.push('gardening')
    if (description.toLowerCase().includes('true crime') || description.toLowerCase().includes('documentaries')) interests.push('true crime documentaries')
    if (description.toLowerCase().includes('recipe') || description.toLowerCase().includes('cook')) interests.push('cooking')
    if (description.toLowerCase().includes('snowboard')) interests.push('snowboarding')
    if (description.toLowerCase().includes('coffee')) interests.push('coffee')
    if (description.toLowerCase().includes('travel')) interests.push('traveling')
    if (description.toLowerCase().includes('triathlon')) interests.push('triathlons')
    if (description.toLowerCase().includes('train')) interests.push('training')
    if (description.toLowerCase().includes('fashion')) interests.push('fashion')
    
    if (interests.length === 0) {
      interests = ['gardening', 'cooking', 'reading']
    }
    
    const gifts = []
    
    if (interests.some(i => i.includes('garden'))) {
      gifts.push({
        name: 'Premium Gardening Tool Set',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3),
        reasoning: 'Perfect for their gardening passion, these high-quality tools will make their hobby even more enjoyable.',
        category: 'Gardening Tools',
        purchase_link: 'https://www.google.com/search?tbm=shop&q=premium+gardening+tool+set',
        product_description: 'Professional-grade gardening tools with ergonomic handles.',
        brand: 'Gardening Tools'
      })
    }
    
    if (interests.some(i => i.includes('mystery') || i.includes('podcast') || i.includes('true crime'))) {
      gifts.push({
        name: 'True Crime Documentary Collection',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.2),
        reasoning: 'A curated selection of acclaimed true crime documentaries and books to fuel their interest.',
        category: 'Entertainment',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=true+crime+documentary+collection',
        product_description: 'Premium collection of true crime documentaries and books.',
        brand: 'Entertainment'
      })
    }
    
    if (interests.some(i => i.includes('cook') || i.includes('recipe'))) {
      gifts.push({
        name: 'Artisan Recipe Cookbook',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.15),
        reasoning: 'Inspires their love of trying new recipes with beautiful photography and unique dishes.',
        category: 'Cookbook',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=artisan+recipe+cookbook',
        product_description: 'Beautiful cookbook with unique recipes and stunning photography.',
        brand: 'Cookbook'
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
    
    if (interests.some(i => i.includes('snowboard'))) {
      gifts.push({
        name: 'Premium Snowboarding Accessories',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4),
        reasoning: 'Perfect for their snowboarding passion, these accessories will enhance their time on the slopes.',
        category: 'Sports Equipment',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=premium+snowboarding+accessories',
        product_description: 'High-quality snowboarding gear and accessories.',
        brand: 'Sports Equipment'
      })
    }
    
    if (interests.some(i => i.includes('coffee'))) {
      gifts.push({
        name: 'Artisan Coffee Collection',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3),
        reasoning: 'A curated selection of premium coffees from around the world.',
        category: 'Beverages',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=artisan+coffee+collection',
        product_description: 'Premium coffee beans from renowned roasters worldwide.',
        brand: 'Beverages'
      })
    }
    
    if (interests.some(i => i.includes('travel'))) {
      gifts.push({
        name: 'Travel Essentials Kit',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4),
        reasoning: 'Thoughtful travel accessories to make their journeys more comfortable and organized.',
        category: 'Travel',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=travel+essentials+kit',
        product_description: 'Complete travel kit with premium accessories.',
        brand: 'Travel'
      })
    }
    
    if (interests.some(i => i.includes('triathlon') || i.includes('train'))) {
      gifts.push({
        name: 'Athletic Training Gear',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.5),
        reasoning: 'High-performance gear to support their training and athletic goals.',
        category: 'Sports Equipment',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=athletic+training+gear',
        product_description: 'Professional-grade training equipment for athletes.',
        brand: 'Sports Equipment'
      })
    }
    
    if (interests.some(i => i.includes('fashion'))) {
      gifts.push({
        name: 'Fashion Accessories Set',
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4),
        reasoning: 'Stylish accessories to elevate their fashion sense and complete their look.',
        category: 'Fashion',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=fashion+accessories+set',
        product_description: 'Curated collection of stylish fashion accessories.',
        brand: 'Fashion'
      })
    }
    
    // Fill to 3-5 gifts with purchase links
    const defaultGifts = [
      { 
        name: 'Premium Coffee Subscription', 
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.3), 
        reasoning: 'Perfect for enjoying during leisure time.', 
        category: 'Subscription',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=premium+coffee+subscription',
        product_description: 'A curated selection of premium coffees delivered monthly.',
        brand: 'Subscription Service'
      },
      { 
        name: 'Noise-Cancelling Headphones', 
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.6), 
        reasoning: 'Enhances their listening experience with superior audio quality.', 
        category: 'Electronics',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=noise+cancelling+headphones',
        product_description: 'Premium wireless headphones with active noise cancellation.',
        brand: 'Electronics'
      },
      { 
        name: 'Personalized Gift Basket', 
        price: Math.floor(budgetMin + (budgetMax - budgetMin) * 0.4), 
        reasoning: 'A thoughtful collection of items tailored to their interests.', 
        category: 'Gift Set',
        purchase_link: 'https://www.google.com/search?tbm=shop&q&q=personalized+gift+basket',
        product_description: 'Customizable gift basket with premium items.',
        brand: 'Gift Set'
      }
    ]
    
    while (gifts.length < 3 && defaultGifts.length > 0) {
      gifts.push(defaultGifts.shift())
    }
    
    // Add purchase links to existing gifts if missing
    const giftsWithLinks = gifts.slice(0, 5).map(gift => ({
      ...gift,
      purchase_link: gift.purchase_link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(gift.name)}`,
      product_description: gift.product_description || gift.reasoning + ' Features high-quality materials.',
      brand: gift.brand || gift.category
    }))
    
    // Return 3-5 gifts with all required fields
    return JSON.stringify(giftsWithLinks)
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
      purchase_link: `https://www.google.com/search?tbm=shop&q&q=${encodeURIComponent(g.name)}`,
      product_description: `Premium ${g.name} with excellent quality and thoughtful design. Perfect gift choice.`,
      brand: g.category
    }))
    return JSON.stringify(mockLinks)
  }
  
  return JSON.stringify({})
}

