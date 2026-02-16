# TravelWorld - Travel Website with On-Device Translation

A modern, beautiful travel website showcasing destinations with Chrome's on-device AI translation capabilities.

## Features

### Hero Carousel
- **4 Full-Screen Slides** - Stunning travel destination images (mountains, beaches, cultural sites, lakes)
- **Auto-Play** - Automatically advances every 5 seconds
- **Navigation Controls** - Previous/Next arrow buttons
- **Indicator Dots** - Clickable dots to jump to specific slides
- **Smooth Transitions** - Fade and scale animations between slides
- **Content Overlay** - Each slide displays title, description, and CTA button

### Content Sections
- **Features Section** - 6 feature cards explaining why to choose TravelWorld (Global Destinations, Best Price Guarantee, Secure Booking, 24/7 Support, Easy Booking, Exclusive Rewards)
- **Destinations Section** - 6 popular destination cards with hover effects and pricing (Paris, Tokyo, Bali, Dubai, Rome, New York)
- **Testimonials Section** - 3 customer review cards with star ratings and author info
- **CTA Section** - Full-width call-to-action banner

### Footer
- Brand section with description and social media links
- Company navigation links (About Us, Careers, Press, Blog)
- Support links (Help Center, Safety, Cancellation, COVID-19)
- Legal links (Privacy Policy, Terms of Service, Cookie Policy, Licenses)
- Copyright and accessibility information

### On-Device Translation (Chrome Translator API)
- **Language Selector** - Dropdown with 10 languages in the navigation bar
- **Supported Languages**: English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian, Korean, Russian
- **Chrome AI Translation** - Uses Chrome's native on-device Translator API (Chrome 138+)
- **Download Progress** - Shows language pack download progress
- **Status Indicator** - Displays translation status (Ready, Translating, Language name)
- **Loading Overlay** - Visual feedback during translation
- **Graceful Fallback** - Pre-defined translations for browsers without the API

## How On-Device Translation Works

The page uses Chrome's [Translator API](https://developer.chrome.com/docs/ai/translate-on-device) for client-side translation:

### 1. Feature Detection
```javascript
if ('Translator' in self) {
  // Chrome Translator API is available
}
```

### 2. Creating a Translator
```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### 3. Translating Text
```javascript
const translatedText = await translator.translate('Hello, world!');
// Returns: "¡Hola, mundo!"
```

### Translation Flow
1. All translatable elements have `data-translate` attributes
2. Original English text is stored on page load
3. When user selects a language:
   - If Chrome API is available: Creates translator instance, downloads language pack if needed, translates all elements
   - If API unavailable: Uses fallback pre-defined translations
4. Switching back to English restores original text

### Hardware Requirements for Chrome Translator API
- **Desktop Only** - API works on Chrome desktop (not mobile)
- **OS**: Windows 10+, macOS 13+, Linux, or ChromeOS
- **Storage**: At least 22 GB free space
- **GPU**: >4 GB VRAM (or CPU with 16 GB RAM and 4+ cores)
- **Network**: Unlimited/unmetered connection for language pack downloads

## Usage

### Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser

### Testing Translation

1. Open the page in Chrome 138 or later
2. Use the language dropdown in the top-right navigation
3. Select a language to translate the page content
4. The status indicator shows translation progress
5. Select "English" to restore original content

## Project Structure

```
.
├── public/
│   ├── index.html          # Main webpage with carousel, content, and translation
│   └── xml-validator.js    # (Legacy) XML validation library
├── package.json
└── README.md
```

## Technical Details

### Carousel Implementation
- Pure CSS transitions with JavaScript control
- `opacity` and `transform: scale()` for smooth effects
- Auto-play with `setInterval`, reset on manual navigation
- Responsive design adapts to all screen sizes

### Translation Implementation
- `Map` object stores original English text
- Async/await for API calls
- `Promise.all` for parallel translation of multiple elements
- Try/catch with fallback handling

### Responsive Design
- Mobile-first approach
- CSS Grid for layouts
- Breakpoints at 768px and 1024px
- Flexbox for navigation and footer

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Carousel | ✅ | ✅ | ✅ | ✅ |
| Fallback Translation | ✅ | ✅ | ✅ | ✅ |
| Chrome Translator API | ✅ 138+ | ❌ | ❌ | ❌ |

## Resources

- [Chrome Translator API Documentation](https://developer.chrome.com/docs/ai/translate-on-device)
- [Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Language Detector API](https://developer.chrome.com/docs/ai/language-detection)

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

The app will be available at your Vercel URL.

## Notes

- Translation happens entirely on-device (client-side)
- No server-side processing or external APIs required
- Language packs are downloaded once and cached by Chrome
- The page works without translation in browsers that don't support the API
