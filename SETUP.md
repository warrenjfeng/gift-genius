# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure API Keys

Create a `.env` file in the root directory:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_NANO_BANANA_API_KEY=your_nano_banana_api_key_here
```

### Getting API Keys

**Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

**Nano Banana Pro API Key:**
1. Check the Nano Banana Pro documentation for API access
2. Sign up and get your API key
3. Copy the key to your `.env` file

**Note:** If you don't have API keys, the app will use mock data for demonstration purposes.

## 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 5. Deploy to GitHub Pages

### Option A: Using GitHub Actions (Recommended)

1. Push your code to GitHub
2. Go to Settings > Pages in your repository
3. Set source to "GitHub Actions"
4. The workflow in `.github/workflows/deploy.yml` will automatically deploy on push

### Option B: Manual Deployment

1. Build the project: `npm run build`
2. Go to Settings > Pages in your repository
3. Set source to the `dist` folder or `gh-pages` branch
4. Update `vite.config.js` base path to match your repository name

## Troubleshooting

### API Keys Not Working

- Make sure your `.env` file is in the root directory
- Restart the dev server after adding/changing API keys
- Check that the API keys are correct and have proper permissions

### Build Errors

- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`

### GitHub Pages Not Loading

- Check that the `base` path in `vite.config.js` matches your repository name
- Make sure the build completed successfully
- Check the GitHub Pages settings in your repository

