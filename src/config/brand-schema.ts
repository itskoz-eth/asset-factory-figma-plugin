/**
 * Brand Configuration Schema and Loader
 */

import * as yaml from 'yaml';

export interface BrandConfig {
  brand: { name: string; tagline: string; };
  colors: ColorPalette;
  typography: TypographyConfig;
  logo: LogoConfig;
  effects: EffectsConfig;
  shapes: ShapesConfig;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background_light: string;
  background_dark: string;
  text_light: string;
  text_dark: string;
  [key: string]: string;
}

export interface TypographyConfig {
  headline_font: string;
  body_font: string;
  headline_sizes: number[];
  body_sizes: number[];
}

export interface LogoConfig {
  primary: string;
  mark?: string;
  wordmark?: string;
  placements: LogoPlacement[];
}

export type LogoPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface EffectsConfig {
  gradients: GradientEffect[];
  shadows: ShadowEffect[];
}

export interface GradientEffect {
  name: string;
  type: 'linear' | 'radial';
  angle?: number;
  colors: string[];
}

export interface ShadowEffect {
  name: string;
  offset: [number, number];
  blur: number;
  color: string;
}

export interface ShapesConfig {
  decorative: string[];
  containers: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class BrandConfigLoader {
  private config: BrandConfig | null = null;

  parse(yamlString: string): BrandConfig {
    if (!yamlString || yamlString.trim() === '') {
      throw new Error('Brand configuration is empty');
    }
    const parsed = yaml.parse(yamlString);
    if (!parsed) throw new Error('Invalid YAML');
    this.config = parsed as BrandConfig;
    return this.config;
  }

  validate(config: BrandConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!config.brand?.name) errors.push('brand.name is required');
    if (!config.colors) errors.push('colors section is required');
    else {
      const colorFields = ['primary', 'secondary', 'accent', 'background_light', 'background_dark', 'text_light', 'text_dark'];
      for (const field of colorFields) {
        if (!config.colors[field]) errors.push(`colors.${field} is required`);
        else if (!this.isValidColor(config.colors[field])) errors.push(`colors.${field} has invalid format`);
      }
    }
    if (!config.typography) errors.push('typography section is required');
    if (!config.logo) warnings.push('logo section is missing');
    return { valid: errors.length === 0, errors, warnings };
  }

  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
           /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(,\s*[\d.]+)?\s*\)$/.test(color);
  }

  getConfig(): BrandConfig | null {
    return this.config;
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }

  static generateTemplate(): string {
    return `brand:
  name: "Your Company Name"
  tagline: "Your brand tagline"

colors:
  primary: "#FE621D"
  secondary: "#1C1C1C"
  accent: "#5DFDCB"
  background_light: "#F1F1F1"
  background_dark: "#1C1C1C"
  text_light: "#F1F1F1"
  text_dark: "#1C1C1C"

typography:
  headline_font: "Inter"
  body_font: "Inter"
  headline_sizes: [48, 36, 28, 24]
  body_sizes: [18, 16, 14]

logo:
  primary: "logo.svg"
  placements:
    - "top-left"
    - "bottom-right"

effects:
  gradients:
    - name: "brand-glow"
      type: "radial"
      colors: ["primary", "secondary"]
  shadows:
    - name: "card-shadow"
      offset: [0, 4]
      blur: 24
      color: "rgba(0,0,0,0.15)"

shapes:
  decorative:
    - "corner-accent"
    - "glow-ellipse"
  containers:
    - "card"
    - "pill"
`;
  }
}

export default BrandConfigLoader;