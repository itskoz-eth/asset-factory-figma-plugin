# Brand Setup Guide

This guide walks you through customizing Asset Factory for your brand in under 5 minutes.

---

## Step 1: Define Your Colors

Open `src/config/defaults.ts` and find the `DEFAULT_COLORS` section:

```typescript
export const DEFAULT_COLORS = {
  primary: '#3B82F6',        // Main brand color
  secondary: '#1E293B',      // Secondary color
  accent: '#10B981',         // Accent/CTA color
  background_light: '#F8FAFC', // Light backgrounds
  background_dark: '#0F172A',  // Dark backgrounds
  text_light: '#F8FAFC',     // Text on dark
  text_dark: '#0F172A',      // Text on light
};
```

### Color Tips

- **Primary**: Your main brand color (buttons, headers, key elements)
- **Secondary**: Supporting color (backgrounds, containers)
- **Accent**: Call-to-action color (should pop!)
- **Background Dark**: For dark mode - go truly dark (#0F172A or #000000)
- **Background Light**: For light mode - keep it clean (#FFFFFF or #F8FAFC)

---

## Step 2: Update the Plugin Name

Edit `manifest.json`:

```json
{
  "name": "YourBrand Asset Generator",
  "id": "yourbrand-asset-gen-2024"
}
```

The `id` should be unique. Use something like `companyname-assetfactory-YEAR`.

---

## Step 3: Set Your Brand Name

In `src/core/asset-engine.ts`, find the logo placeholder section:

```typescript
text.characters = this.brandConfig?.brand?.name || 'BRAND';
```

Change `'BRAND'` to your company name.

---

## Step 4: Rebuild

```bash
npm run build
```

---

## Step 5: Reload in Figma

1. Close the plugin if open
2. **Plugins** -> **Development** -> **Import plugin from manifest...**
3. Select your `manifest.json`
4. Run the plugin

---

## Checklist

- [ ] Updated `DEFAULT_COLORS` with your brand colors
- [ ] Changed plugin name in `manifest.json`
- [ ] Set brand name for logo placeholder
- [ ] Ran `npm run build`
- [ ] Reloaded plugin in Figma
- [ ] Tested all themes
- [ ] Generated sample assets

---

Happy designing!