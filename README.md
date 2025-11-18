# XML Sitemap Validator

A web application to validate XML sitemap structure and URL patterns. Validates that URLs in `<loc>` tags follow the pattern: `https://www.tiket.com/{parent_folder_path}/{path_from_xml}`

## Features

- ✅ Upload XML files or paste XML content
- ✅ Validate XML structure (urlset, url, loc elements)
- ✅ Validate URL patterns against parent folder path
- ✅ Check URL format and structure
- ✅ Detailed error and warning reporting
- ✅ Beautiful web UI with real-time validation

## Usage

### Web UI

1. Start the development server:
```bash
npm install
npm run dev
```

2. Open `http://localhost:3000` in your browser

3. Enter:
   - **Parent Folder Path**: The parent folder path (e.g., `en-sg/game/top-spender`)
   - **XML Content**: Upload an XML file or paste XML content

4. Click "Validate XML" to see results

### JavaScript Library

```javascript
// Import the validator
const validator = new XMLSitemapValidator();

// Validate XML
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tiket.com/en-sg/game/top-spender</loc>
  </url>
</urlset>`;

const parentPath = 'en-sg/game/top-spender';
const result = validator.validate(xmlContent, parentPath);

console.log(result);
// {
//   isValid: true,
//   errors: [],
//   warnings: [],
//   urlResults: [...],
//   totalUrls: 1,
//   validUrls: 1,
//   invalidUrls: 0
// }
```

## Validation Rules

### XML Structure
- Must have `<urlset>` root element
- Must have `xmlns` attribute (recommended)
- Each `<url>` must have a `<loc>` element
- Optional: `<lastmod>`, `<changefreq>`, `<priority>`

### URL Validation
- URLs must start with `https://www.tiket.com`
- URLs must contain the parent folder path
- URLs must be valid URL format
- Warnings for trailing slashes, multiple slashes, etc.

## Example XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tiket.com/en-sg/game/top-spender</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.tiket.com/en-sg/game/top-spender/leaderboard</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Project Structure

```
.
├── public/
│   ├── index.html          # Web UI
│   └── xml-validator.js    # Validation library
├── package.json
└── README.md
```

## API Reference

### XMLSitemapValidator Class

#### Methods

##### `validate(xmlContent, parentPath)`
Main validation method.

**Parameters:**
- `xmlContent` (string): XML content as string
- `parentPath` (string): Parent folder path to combine with URLs

**Returns:**
```javascript
{
  isValid: boolean,           // Overall validation status
  errors: Array,              // Array of error objects
  warnings: Array,            // Array of warning objects
  urlResults: Array,         // Detailed results for each URL
  totalUrls: number,          // Total number of URLs found
  validUrls: number,          // Number of valid URLs
  invalidUrls: number         // Number of invalid URLs
}
```

**Error Object:**
```javascript
{
  type: string,              // Error type
  message: string,           // Error message
  url: string,              // URL (if applicable)
  expected: string,         // Expected value (if applicable)
  actual: string            // Actual value (if applicable)
}
```

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

- The validator uses browser's native `DOMParser` for XML parsing
- All validation happens client-side
- No server-side processing required
- Supports standard sitemap XML format
