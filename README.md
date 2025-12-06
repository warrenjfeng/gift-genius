# GiftGenius - AI Holiday Gift Guide Generator

A web application that generates personalized holiday gift guides using Google's Gemini 3 and Nano Banana Pro models.

## Features

- **AI-Powered Analysis**: Uses Gemini 3 to analyze recipient details and generate personalized gift recommendations
- **Beautiful Visual Guides**: Renders 2K resolution magazine-style gift guides with Nano Banana Pro
- **Personalized Recommendations**: 6-8 thoughtful gift suggestions based on recipient interests, personality, and budget
- **Modern UI**: Clean, responsive interface that works on desktop and mobile
- **Easy Sharing**: Download and share your generated gift guides

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Gemini 3 API** - For analysis and recommendation generation
- **Nano Banana Pro API** - For 2K visual rendering

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- API keys for Gemini 3 and Nano Banana Pro

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gift-genius
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
   - Copy `.env.example` to `.env`
   - Add your API keys:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_NANO_BANANA_API_KEY=your_nano_banana_api_key_here
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to GitHub Pages

1. Update `vite.config.js` to set the correct `base` path (should match your repository name):
```js
base: '/gift-genius/', // Change to your repo name
```

2. Build the project:
```bash
npm run build
```

3. Deploy the `dist` folder to GitHub Pages:
   - Go to your repository settings
   - Navigate to Pages section
   - Set source to `gh-pages` branch or `dist` folder
   - Or use GitHub Actions for automatic deployment

### Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## API Configuration

### Gemini 3 API

The app uses Gemini 3 for:
- Analyzing recipient descriptions
- Extracting interests and personality traits
- Generating personalized gift recommendations
- Creating design briefs for visual rendering

### Nano Banana Pro API

The app uses Nano Banana Pro for:
- Rendering 2K resolution gift guides
- Creating magazine-style layouts
- Enhanced text and object rendering

**Note**: For production use, you should set up a backend proxy to keep API keys secure. Client-side API keys can be exposed in the browser.

## Usage

1. Enter a description of the gift recipient (age, interests, hobbies, personality)
2. Set your budget range using the sliders
3. Select the occasion
4. Click "Generate Gift Guide"
5. Wait for the AI to analyze and render your guide
6. Download or generate another guide

### Example Descriptions

- "My mom, 58, loves gardening, murder mystery podcasts, and trying new recipes. Budget: $50-200"
- "My brother, 25, is into video games, craft beer, and hiking. Budget: $30-100"
- "My girlfriend, 28, enjoys yoga, reading fantasy novels, and minimalist design. Budget: $40-150"

## Project Structure

```
gift-genius/
├── src/
│   ├── components/
│   │   ├── GiftGuideForm.jsx      # Input form component
│   │   ├── LoadingState.jsx       # Loading indicator
│   │   └── GiftGuideResult.jsx    # Results display
│   ├── services/
│   │   └── giftGuideService.js    # API integration logic
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   ├── config.js                  # API configuration
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Demo Mode

If API keys are not configured, the app will use mock data for demonstration purposes. This allows you to test the UI and flow without API access.

## Future Enhancements

- Multiple style variations from one input
- Social media sharing
- PDF export option
- "Refine this guide" for iterative improvements
- Price comparison or product links
- Backend proxy for secure API key management

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

