# Asset Factory

**A white-label Figma plugin for generating branded marketing assets at scale.**

Create professional social media graphics, launch materials, and marketing assets in seconds — all perfectly aligned with your brand guidelines.

---

## Features

- **Multi-Format Generation** — Twitter, LinkedIn, Instagram, Email headers, Blog images, and more
- **Brand Consistency** — Configure once, apply everywhere
- **Theme System** — Dark, Light, Bold, Minimal, and Gradient modes
- **Intelligent Text Handling** — Auto-sizes headlines, subheads, and CTAs
- **White-Label Ready** — Fully customizable for your brand or clients
- **Audit System** — Built-in brand compliance checking
- **Batch Generation** — Create multiple asset sizes at once

---

## Quick Start

### 1. Download the Plugin

```bash
git clone https://github.com/itskoz-eth/asset-factory-figma-plugin.git
cd asset-factory-figma-plugin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Plugin

```bash
npm run build
```

### 4. Load in Figma

1. Open **Figma Desktop**
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to the `asset-factory-figma-plugin` folder
4. Select `manifest.json`
5. Click **Open**

### 5. Run the Plugin

- Go to **Plugins** → **Development** → **Asset Factory**

---

## Customizing Your Brand

### Option 1: Quick Brand Setup

Create a `brand-config.yaml` file in the plugin root:

```yaml
brand:
  name: "Your Brand Name"
  tagline: "Your tagline here"

colors:
  primary: "#FF6B00"          # Your main brand color
  secondary: "#1A1A2E"        # Secondary color
  accent: "#00D4AA"           # Accent/highlight color
  background_light: "#FFFFFF" # Light mode background
  background_dark: "#0D0D1A"  # Dark mode background
  text_light: "#FFFFFF"       # Text on dark backgrounds
  text_dark: "#1A1A2E"        # Text on light backgrounds

typography:
  headline_font: "Inter"       # Font for headlines
  body_font: "Inter"           # Font for body text
```

### Option 2: Modify Default Colors

Edit `src/config/defaults.ts`:

```typescript
export const DEFAULT_COLORS = {
  primary: '#YOUR_PRIMARY_COLOR',
  secondary: '#YOUR_SECONDARY_COLOR',
  accent: '#YOUR_ACCENT_COLOR',
  background_light: '#FFFFFF',
  background_dark: '#0D0D1A',
  text_light: '#FFFFFF',
  text_dark: '#1A1A2E',
};
```

Then rebuild:

```bash
npm run build
```

---

## White-Labeling Guide

### Rename the Plugin

1. Edit `manifest.json`:

```json
{
  "name": "Your Company Asset Generator",
  "id": "your-unique-plugin-id"
}
```

2. Update the UI title in `dist/ui.html`:

```html
<h1>Your Company Assets</h1>
```

---

## Asset Types Available

### Social Media
| Type | Dimensions | Use Case |
|------|-----------|----------|
| `twitter-post` | 1200×675 | Twitter/X posts |
| `linkedin-post` | 1200×627 | LinkedIn feed posts |
| `instagram-square` | 1080×1080 | Instagram feed |
| `instagram-story` | 1080×1920 | Instagram/FB stories |

### Product Launch
| Type | Dimensions | Use Case |
|------|-----------|----------|
| `teaser-card` | 1200×675 | Pre-launch teasers |
| `announcement-hero` | 1200×675 | Launch announcements |

### Marketing
| Type | Dimensions | Use Case |
|------|-----------|----------|
| `email-header` | 600×200 | Email headers |
| `blog-featured` | 1200×630 | Blog hero images |

---

## Themes

| Theme | Background | Best For |
|-------|-----------|----------|
| **Dark** | Deep dark with glow | Tech, premium, modern |
| **Light** | Clean white | Professional, corporate |
| **Bold** | Primary color fill | Announcements, CTAs |
| **Gradient** | Primary→Secondary | Dynamic, energetic |

---

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

---

## Troubleshooting

### Plugin shows blank/black

1. Make sure you ran `npm run build`
2. Re-import the plugin in Figma
3. Check that `dist/ui.html` and `dist/code.js` exist

### Fonts not loading

The plugin uses **Inter** font by default. Modify `src/core/asset-engine.ts` to use a different font.

---

## License

MIT License — Use freely for personal and commercial projects.

---

Made with ❤️ for designers who want to move fast.
