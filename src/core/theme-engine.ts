/**
 * Theme Engine
 * 
 * Applies visual themes to assets based on brand configuration.
 */

import { BrandConfig } from '../config/brand-schema';
import { THEMES, DEFAULT_COLORS, LAYER_NAMES } from '../config/defaults';

export type ThemeName = 'dark' | 'light' | 'bold' | 'minimal' | 'gradient';

export interface ThemeDefinition {
  name: string;
  description: string;
  background: string;
  text: string;
  accent: string;
  useGlow: boolean;
}

export class ThemeEngine {
  private brandConfig: BrandConfig | null = null;

  setBrandConfig(config: BrandConfig): void {
    this.brandConfig = config;
  }

  apply(frame: FrameNode, themeName: string): void {
    const theme = THEMES[themeName as ThemeName];
    if (!theme) return;
    this.applyBackgroundColor(frame, theme);
    this.applyTextColors(frame, theme);
    this.applyAccentColors(frame, theme);
    this.applyGlowEffect(frame, theme);
  }

  private applyBackgroundColor(frame: FrameNode, theme: ThemeDefinition): void {
    const colorKey = theme.background;
    if (colorKey === 'gradient') {
      this.applyGradientBackground(frame);
    } else {
      const color = this.getColor(colorKey);
      frame.fills = [{ type: 'SOLID', color }];
    }
  }

  private applyGradientBackground(frame: FrameNode): void {
    const primaryColor = this.getColor('primary');
    const secondaryColor = this.getColor('secondary');
    frame.fills = [{
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[0.7071, 0.7071, 0], [-0.7071, 0.7071, 0.5]],
      gradientStops: [
        { position: 0, color: { ...primaryColor, a: 1 } },
        { position: 1, color: { ...secondaryColor, a: 1 } }
      ]
    }];
  }

  private applyTextColors(frame: FrameNode, theme: ThemeDefinition): void {
    const textColor = this.getColor(theme.text);
    const textLayers = this.findTextLayers(frame);
    for (const textNode of textLayers) {
      if (textNode.name === LAYER_NAMES.cta) continue;
      textNode.fills = [{ type: 'SOLID', color: textColor }];
    }
  }

  private applyAccentColors(frame: FrameNode, theme: ThemeDefinition): void {
    const accentColor = this.getColor(theme.accent);
    const ctaNode = this.findLayerByName(frame, LAYER_NAMES.cta);
    if (ctaNode && ctaNode.type === 'TEXT') {
      ctaNode.fills = [{ type: 'SOLID', color: accentColor }];
    }
  }

  private applyGlowEffect(frame: FrameNode, theme: ThemeDefinition): void {
    const decorativeGroup = this.findLayerByName(frame, LAYER_NAMES.decorative);
    if (!decorativeGroup || !('children' in decorativeGroup)) return;
    const glowLayer = this.findLayerByName(decorativeGroup as FrameNode, LAYER_NAMES.glow);
    if (theme.useGlow && glowLayer) {
      glowLayer.visible = true;
    } else if (glowLayer) {
      glowLayer.visible = false;
    }
  }

  private getColor(key: string): RGB {
    const colors = this.brandConfig?.colors || DEFAULT_COLORS;
    const hex = colors[key] || DEFAULT_COLORS[key as keyof typeof DEFAULT_COLORS] || '#000000';
    return this.hexToRgb(hex);
  }

  private findTextLayers(node: SceneNode): TextNode[] {
    const textLayers: TextNode[] = [];
    const search = (n: SceneNode): void => {
      if (n.type === 'TEXT') textLayers.push(n);
      if ('children' in n) for (const child of n.children) search(child);
    };
    search(node);
    return textLayers;
  }

  private findLayerByName(node: SceneNode, name: string): SceneNode | null {
    if (node.name === name) return node;
    if ('children' in node) {
      for (const child of node.children) {
        const found = this.findLayerByName(child, name);
        if (found) return found;
      }
    }
    return null;
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }

  static getThemes(): ThemeDefinition[] {
    return Object.values(THEMES);
  }
}

interface RGB { r: number; g: number; b: number; }

export default ThemeEngine;