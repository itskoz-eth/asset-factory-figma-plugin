/**
 * Default Configuration Values
 * 
 * Contains all default values, dimensions, and constants used throughout the plugin.
 */

// Asset Dimensions by Type
export const ASSET_DIMENSIONS: Record<string, { width: number; height: number; name: string }> = {
  // Social Media
  'twitter-post': { width: 1200, height: 675, name: 'Twitter/X Post' },
  'twitter-card': { width: 1080, height: 1080, name: 'Twitter/X Card' },
  'linkedin-post': { width: 1200, height: 627, name: 'LinkedIn Post' },
  'instagram-square': { width: 1080, height: 1080, name: 'Instagram Square' },
  'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
  'instagram-reel': { width: 1080, height: 1920, name: 'Instagram Reel Cover' },
  'facebook-post': { width: 1200, height: 630, name: 'Facebook Post' },
  'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail' },
  
  // Product Launch
  'teaser-card': { width: 1200, height: 675, name: 'Teaser Card' },
  'announcement-hero': { width: 1200, height: 675, name: 'Announcement Hero' },
  'feature-highlight': { width: 1080, height: 1080, name: 'Feature Highlight' },
  'countdown-card': { width: 1080, height: 1080, name: 'Countdown Card' },
  
  // Marketing
  'email-header': { width: 600, height: 200, name: 'Email Header' },
  'email-banner': { width: 600, height: 300, name: 'Email Banner' },
  'blog-featured': { width: 1200, height: 630, name: 'Blog Featured Image' },
  'blog-inline': { width: 800, height: 450, name: 'Blog Inline Image' },
  'presentation-slide': { width: 1920, height: 1080, name: 'Presentation Slide' },
  'banner-leaderboard': { width: 728, height: 90, name: 'Leaderboard Banner' },
  'banner-rectangle': { width: 336, height: 280, name: 'Rectangle Banner' },
  'banner-skyscraper': { width: 160, height: 600, name: 'Skyscraper Banner' },
};

// Theme Definitions
export const THEMES = {
  dark: {
    name: 'Dark Mode',
    description: 'Professional, sleek',
    background: 'background_dark',
    text: 'text_light',
    accent: 'primary',
    useGlow: true,
  },
  light: {
    name: 'Light Mode',
    description: 'Clean, accessible',
    background: 'background_light',
    text: 'text_dark',
    accent: 'primary',
    useGlow: false,
  },
  bold: {
    name: 'Bold',
    description: 'High impact',
    background: 'primary',
    text: 'text_light',
    accent: 'secondary',
    useGlow: false,
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple, elegant',
    background: 'background_light',
    text: 'primary',
    accent: 'accent',
    useGlow: false,
  },
  gradient: {
    name: 'Gradient',
    description: 'Dynamic, modern',
    background: 'gradient',
    text: 'text_light',
    accent: 'accent',
    useGlow: true,
  },
};

// Typography Defaults
export const DEFAULT_TYPOGRAPHY = {
  headline_font: 'Inter',
  body_font: 'Inter',
  headline_sizes: [48, 36, 28, 24],
  body_sizes: [18, 16, 14, 12],
};

// Text Type Sizing
export const TEXT_SIZE_MULTIPLIERS: Record<string, number> = {
  headline: 1.0,
  subhead: 0.65,
  body: 0.4,
  cta: 0.35,
  tag: 0.25,
};

// Safe Zone Margins
export const SAFE_ZONE = {
  margin: 0.05,
  minPixels: 20,
};

// Logo Sizing
export const LOGO_SIZE = {
  maxWidth: 0.25,
  maxHeight: 0.15,
  padding: 24,
};

// Layer Naming Convention
export const LAYER_NAMES = {
  root: 'Asset Frame',
  content: 'content',
  headline: 'headline',
  subhead: 'subhead',
  body: 'body',
  cta: 'cta',
  tag: 'tag',
  branding: 'branding',
  logo: 'logo',
  tagline: 'tagline',
  decorative: 'decorative',
  glow: 'glow',
  accentShape: 'accent-shape',
  pattern: 'pattern',
  background: 'background',
};

// Default Colors
export const DEFAULT_COLORS: Record<string, string> = {
  primary: '#3B82F6',
  secondary: '#1E293B',
  accent: '#10B981',
  background_light: '#F8FAFC',
  background_dark: '#0F172A',
  text_light: '#F8FAFC',
  text_dark: '#0F172A',
};

// Audit Check Thresholds
export const AUDIT_THRESHOLDS = {
  contrastRatioMin: 4.5,
  safeZoneMargin: 20,
  logoMinSize: 24,
};

// Export Defaults
export const EXPORT_DEFAULTS = {
  format: 'PNG' as const,
  scale: 2,
  quality: 100,
};

// Feedback Rating Scale
export const RATING_SCALE = {
  min: 1,
  max: 5,
  labels: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  },
};

// Asset Categories
export const ASSET_CATEGORIES = {
  social: {
    name: 'Social Graphics',
    assets: ['twitter-post', 'twitter-card', 'linkedin-post', 'instagram-square', 'instagram-story'],
  },
  launch: {
    name: 'Product Launch',
    assets: ['teaser-card', 'announcement-hero', 'feature-highlight', 'countdown-card'],
  },
  marketing: {
    name: 'Marketing Assets',
    assets: ['email-header', 'email-banner', 'blog-featured', 'presentation-slide'],
  },
  banners: {
    name: 'Ad Banners',
    assets: ['banner-leaderboard', 'banner-rectangle', 'banner-skyscraper'],
  },
};

// Batch Generation Presets
export const BATCH_PRESETS = {
  'all-social': {
    name: 'All Social Sizes',
    assets: ['twitter-post', 'twitter-card', 'linkedin-post', 'instagram-square', 'instagram-story'],
  },
  'launch-pack': {
    name: 'Launch Pack',
    assets: ['teaser-card', 'announcement-hero', 'feature-highlight'],
  },
  'email-kit': {
    name: 'Email Kit',
    assets: ['email-header', 'email-banner'],
  },
};