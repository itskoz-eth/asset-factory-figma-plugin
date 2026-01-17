/**
 * Asset Engine
 * Core engine for generating Figma assets from brand configuration and content.
 */

import { BrandConfig } from '../config/brand-schema';
import { ASSET_DIMENSIONS, DEFAULT_COLORS, LAYER_NAMES, LOGO_SIZE, TEXT_SIZE_MULTIPLIERS } from '../config/defaults';

export interface AnalyzedContent {
  text: string;
  type: 'headline' | 'subhead' | 'body' | 'cta' | 'tag';
  wordCount: number;
}

export interface GenerateOptions {
  type: string;
  content: AnalyzedContent[];
  dimensions: { width: number; height: number };
  theme?: string;
  options?: { logoPlacement?: string; effects?: string[]; };
}

export interface GeneratedAsset {
  node: FrameNode;
  metadata: { type: string; dimensions: { width: number; height: number }; generatedAt: Date; };
}

export class AssetEngine {
  private brandConfig: BrandConfig | null = null;
  private fontsLoaded: boolean = false;

  setBrandConfig(config: BrandConfig): void {
    this.brandConfig = config;
  }

  async loadFonts(): Promise<void> {
    if (this.fontsLoaded) return;
    try {
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
      this.fontsLoaded = true;
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  }

  async generate(options: GenerateOptions): Promise<GeneratedAsset> {
    const { type, content, dimensions, theme, options: assetOptions } = options;
    await this.loadFonts();
    const frame = this.createFrame(dimensions, type);
    this.createBackground(frame, theme);
    this.createDecorativeGroup(frame, theme);
    await this.createContentGroup(frame, content, dimensions, theme);
    await this.createBrandingGroup(frame, assetOptions?.logoPlacement);
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const lastNode = selection[selection.length - 1];
      frame.x = lastNode.x + lastNode.width + 40;
      frame.y = lastNode.y;
    }
    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    return { node: frame, metadata: { type, dimensions, generatedAt: new Date() } };
  }

  private createFrame(dimensions: { width: number; height: number }, assetType: string): FrameNode {
    const frame = figma.createFrame();
    const assetInfo = ASSET_DIMENSIONS[assetType];
    frame.name = assetInfo?.name || LAYER_NAMES.root;
    frame.resize(dimensions.width, dimensions.height);
    frame.clipsContent = true;
    return frame;
  }

  private createBackground(frame: FrameNode, theme?: string): void {
    const colors = this.getThemeColors(theme);
    if (theme === 'gradient') {
      const primaryColor = this.hexToRgb(colors.primary);
      const secondaryColor = this.hexToRgb(colors.secondary);
      frame.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.3]],
        gradientStops: [
          { position: 0, color: { ...primaryColor, a: 1 } },
          { position: 1, color: { ...secondaryColor, a: 1 } }
        ]
      }];
    } else {
      const bgColor = this.hexToRgb(colors.background);
      frame.fills = [{ type: 'SOLID', color: bgColor }];
    }
  }

  private getThemeColors(theme?: string): { background: string; text: string; primary: string; secondary: string; accent: string } {
    const brandColors = this.brandConfig?.colors || {};
    const defaults = DEFAULT_COLORS;
    const colors = {
      primary: brandColors.primary || defaults.primary,
      secondary: brandColors.secondary || defaults.secondary,
      accent: brandColors.accent || defaults.accent,
      background: defaults.background_dark,
      text: defaults.text_light,
    };
    switch (theme) {
      case 'light': case 'minimal':
        colors.background = brandColors.background_light || defaults.background_light;
        colors.text = brandColors.text_dark || defaults.text_dark;
        break;
      case 'bold':
        colors.background = brandColors.primary || defaults.primary;
        colors.text = defaults.text_light;
        break;
      default:
        colors.background = brandColors.background_dark || defaults.background_dark;
        colors.text = brandColors.text_light || defaults.text_light;
        break;
    }
    return colors;
  }

  private createDecorativeGroup(frame: FrameNode, theme?: string): void {
    const group = figma.createFrame();
    group.name = LAYER_NAMES.decorative;
    group.resize(frame.width, frame.height);
    group.fills = [];
    group.clipsContent = false;
    if (theme === 'dark' || theme === 'gradient') {
      this.createGlowEffect(group, frame);
    }
    frame.appendChild(group);
  }

  private createGlowEffect(group: FrameNode, frame: FrameNode): void {
    const glow = figma.createEllipse();
    glow.name = LAYER_NAMES.glow;
    const glowSize = Math.min(frame.width, frame.height) * 1.2;
    glow.resize(glowSize, glowSize);
    glow.x = -glowSize * 0.3;
    glow.y = -glowSize * 0.3;
    const primaryColor = this.hexToRgb(this.brandConfig?.colors?.primary || DEFAULT_COLORS.primary);
    glow.fills = [{
      type: 'GRADIENT_RADIAL',
      gradientTransform: [[1, 0, 0.5], [0, 1, 0.5]],
      gradientStops: [
        { position: 0, color: { ...primaryColor, a: 0.4 } },
        { position: 0.5, color: { ...primaryColor, a: 0.1 } },
        { position: 1, color: { ...primaryColor, a: 0 } }
      ]
    }];
    glow.opacity = 0.8;
    group.appendChild(glow);
  }

  private async createBrandingGroup(frame: FrameNode, logoPlacement?: string): Promise<void> {
    const group = figma.createFrame();
    group.name = LAYER_NAMES.branding;
    group.fills = [];
    group.layoutMode = 'NONE';
    const logo = await this.createLogoPlaceholder(frame);
    group.appendChild(logo);
    group.resize(logo.width, logo.height);
    const padding = LOGO_SIZE.padding;
    const placement = logoPlacement || 'bottom-right';
    switch (placement) {
      case 'top-left': group.x = padding; group.y = padding; break;
      case 'top-right': group.x = frame.width - group.width - padding; group.y = padding; break;
      case 'bottom-left': group.x = padding; group.y = frame.height - group.height - padding; break;
      case 'center': group.x = (frame.width - group.width) / 2; group.y = (frame.height - group.height) / 2; break;
      default: group.x = frame.width - group.width - padding; group.y = frame.height - group.height - padding; break;
    }
    frame.appendChild(group);
  }

  private async createLogoPlaceholder(frame: FrameNode): Promise<FrameNode> {
    const logo = figma.createFrame();
    logo.name = LAYER_NAMES.logo;
    logo.fills = [];
    const text = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    text.fontName = { family: 'Inter', style: 'Bold' };
    text.characters = this.brandConfig?.brand?.name || 'BRAND';
    text.fontSize = 16;
    const textColor = this.hexToRgb(this.brandConfig?.colors?.text_light || DEFAULT_COLORS.text_light);
    text.fills = [{ type: 'SOLID', color: textColor }];
    logo.appendChild(text);
    logo.resize(text.width + 8, text.height + 4);
    return logo;
  }

  private async createContentGroup(frame: FrameNode, content: AnalyzedContent[], dimensions: { width: number; height: number }, theme?: string): Promise<void> {
    const group = figma.createFrame();
    group.name = LAYER_NAMES.content;
    group.fills = [];
    group.layoutMode = 'VERTICAL';
    group.itemSpacing = 20;
    group.paddingLeft = 48;
    group.paddingRight = 48;
    group.paddingTop = 48;
    group.paddingBottom = 80;
    group.resize(frame.width, frame.height);
    group.primaryAxisAlignItems = 'CENTER';
    group.counterAxisAlignItems = 'CENTER';
    const baseFontSize = Math.min(dimensions.width, dimensions.height) * 0.07;
    const colors = this.getThemeColors(theme);
    for (const item of content) {
      const textNode = await this.createTextNode(item, baseFontSize, dimensions.width - 96, colors);
      group.appendChild(textNode);
    }
    frame.appendChild(group);
  }

  private async createTextNode(content: AnalyzedContent, baseFontSize: number, maxWidth: number, colors: { text: string; accent: string }): Promise<TextNode> {
    const text = figma.createText();
    text.name = content.type;
    const sizeMultiplier = TEXT_SIZE_MULTIPLIERS[content.type] || 0.5;
    const fontSize = Math.max(Math.round(baseFontSize * sizeMultiplier), 14);
    let fontStyle = 'Regular';
    if (content.type === 'headline') fontStyle = 'Bold';
    await figma.loadFontAsync({ family: 'Inter', style: fontStyle });
    text.fontName = { family: 'Inter', style: fontStyle };
    text.fontSize = fontSize;
    text.characters = content.text;
    text.textAlignHorizontal = 'CENTER';
    text.textAutoResize = 'WIDTH_AND_HEIGHT';
    let textColor: RGB = content.type === 'cta' ? this.hexToRgb(colors.accent) : this.hexToRgb(colors.text);
    text.fills = [{ type: 'SOLID', color: textColor }];
    if (text.width > maxWidth) {
      text.resize(maxWidth, text.height);
      text.textAutoResize = 'HEIGHT';
    }
    text.lineHeight = { value: fontSize * 1.3, unit: 'PIXELS' };
    return text;
  }

  private hexToRgb(hex: string): RGB {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r: isNaN(r) ? 0 : r / 255, g: isNaN(g) ? 0 : g / 255, b: isNaN(b) ? 0 : b / 255 };
  }
}

interface RGB { r: number; g: number; b: number; }

export default AssetEngine;