# Shaadi Afterparty - Table Finder

A beautiful, mobile-first web app to help guests find their table assignments at Marissa & Ross's Shaadi Afterparty.

## Features

- 🔍 Fuzzy search - finds matches even with typos or partial names
- 📱 Mobile-optimized design
- 🎨 Elegant dark red & gold theme
- 📊 Live Google Sheets integration
- ⚡ Fast and lightweight

## Setup

### 1. Prepare Your Google Sheet

Create a Google Sheet with the following columns (in order):

| First Name | Last Name | Table | Photo |
|------------|-----------|-------|-------|
| Marissa | Rana | 1 | https://example.com/photo.jpg |
| Ross | Smith | 1 | |
| John | Doe | 5 | |

**Notes:**
- Column A: First Name (required)
- Column B: Last Name (required)
- Column C: Table number (required, must be a number)
- Column D: Photo URL (optional - if blank, initials will be shown)

### 2. Make Your Google Sheet Public

1. Open your Google Sheet
2. Click **File** → **Share** → **Publish to web**
3. Select "Entire Document" and "Web page"
4. Click **Publish**
5. Also click **Share** (top right) and change to "Anyone with the link can view"

### 3. Get Your Sheet ID

Your Google Sheet URL looks like:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

Copy the ID between `/d/` and `/edit`.

### 4. Update the App

Open `src/app/page.tsx` and replace:
```typescript
const GOOGLE_SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'
```

With your actual Sheet ID:
```typescript
const GOOGLE_SHEET_ID = '1ABC123xyz...'
```

If your sheet tab is named something other than "Sheet1", also update:
```typescript
const SHEET_NAME = 'YourSheetName'
```

## Deploy to Vercel

### Option A: Deploy via GitHub

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme:
```typescript
colors: {
  shaadi: {
    red: '#8B1538',        // Main red
    'red-dark': '#6B0F2B', // Darker red
    gold: '#D4A853',       // Gold accents
    // ...
  }
}
```

### Text
Edit `src/app/page.tsx` to change:
- The monogram (search for "M & R")
- The welcome message
- Help text

### Fonts
The app uses:
- **Great Vibes** - for the monogram
- **Playfair Display** - for headings
- **Cormorant Garamond** - for body text

These are loaded from Google Fonts in `globals.css`.

## Troubleshooting

**"Unable to load guest list" error:**
- Make sure your Google Sheet is published and shared publicly
- Verify the Sheet ID is correct
- Check that the sheet name matches (default: "Sheet1")

**Search not finding names:**
- Ensure data starts in row 1 (no header row, or adjust the parsing)
- Check that Table column contains numbers only

**Photos not loading:**
- Verify photo URLs are publicly accessible
- Check for CORS issues (URLs should be direct image links)

## License

Built with ❤️ for Marissa & Ross's wedding celebration.
