/**
 * Layer Manager
 * 
 * Manages layer naming, organization, and structure validation.
 */

import { LAYER_NAMES } from '../config/defaults';

export interface LayerSpec {
  name: string;
  type: string;
  required: boolean;
  children?: LayerSpec[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class LayerManager {
  applyNaming(node: FrameNode): void {
    this.normalizeLayerNames(node);
    this.organizeLayerOrder(node);
  }

  private normalizeLayerNames(node: BaseNode): void {
    if (!('children' in node)) return;
    for (const child of node.children) {
      const normalizedName = this.getNormalizedName(child);
      if (normalizedName) child.name = normalizedName;
      if ('children' in child) this.normalizeLayerNames(child);
    }
  }

  private getNormalizedName(node: SceneNode): string | null {
    const currentName = node.name.toLowerCase();
    if (node.type === 'TEXT') {
      if (currentName.includes('head') && !currentName.includes('sub')) return LAYER_NAMES.headline;
      if (currentName.includes('sub')) return LAYER_NAMES.subhead;
      if (currentName.includes('body') || currentName.includes('description')) return LAYER_NAMES.body;
      if (currentName.includes('cta') || currentName.includes('button')) return LAYER_NAMES.cta;
      if (currentName.includes('tag') || currentName.includes('label')) return LAYER_NAMES.tag;
    }
    if (node.type === 'FRAME' || node.type === 'GROUP') {
      if (currentName.includes('content') || currentName.includes('text')) return LAYER_NAMES.content;
      if (currentName.includes('brand') || currentName.includes('logo')) return LAYER_NAMES.branding;
      if (currentName.includes('decor') || currentName.includes('effect')) return LAYER_NAMES.decorative;
      if (currentName.includes('background') || currentName.includes('bg')) return LAYER_NAMES.background;
    }
    if (currentName.includes('logo') && node.type !== 'TEXT') return LAYER_NAMES.logo;
    if (node.type === 'ELLIPSE' && (currentName.includes('glow') || currentName.includes('blur'))) return LAYER_NAMES.glow;
    return null;
  }

  private organizeLayerOrder(frame: FrameNode): void {
    if (!frame.children || frame.children.length === 0) return;
    const layerOrder = [LAYER_NAMES.background, LAYER_NAMES.decorative, LAYER_NAMES.branding, LAYER_NAMES.content];
    const orderedChildren: SceneNode[] = [];
    const otherChildren: SceneNode[] = [];
    for (const name of layerOrder) {
      const child = frame.children.find(c => c.name === name);
      if (child) orderedChildren.push(child);
    }
    for (const child of frame.children) {
      if (!orderedChildren.includes(child)) otherChildren.push(child);
    }
    const allChildren = [...orderedChildren, ...otherChildren];
    for (let i = allChildren.length - 1; i >= 0; i--) {
      frame.insertChild(0, allChildren[i]);
    }
  }

  validate(node: FrameNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    if (node.type !== 'FRAME') {
      errors.push('Root node must be a FRAME');
      return { valid: false, errors, warnings, suggestions };
    }
    const structure = this.mapStructure(node);
    if (!structure.content) errors.push(`Missing required layer: ${LAYER_NAMES.content}`);
    if (!structure.branding) warnings.push(`Missing layer: ${LAYER_NAMES.branding}`);
    if (!structure.decorative) suggestions.push('Consider adding a decorative group');
    return { valid: errors.length === 0, errors, warnings, suggestions };
  }

  private mapStructure(node: FrameNode): Record<string, any> {
    const structure: Record<string, any> = {};
    for (const child of node.children) {
      const key = this.getLayerKey(child.name);
      if (key) structure[key] = 'children' in child ? this.mapChildren(child) : true;
    }
    return structure;
  }

  private mapChildren(node: SceneNode & { children: readonly SceneNode[] }): Record<string, boolean> {
    const children: Record<string, boolean> = {};
    for (const child of node.children) {
      const key = this.getLayerKey(child.name);
      if (key) children[key] = true;
    }
    return children;
  }

  private getLayerKey(name: string): string | null {
    const lookup: Record<string, string> = {
      [LAYER_NAMES.content]: 'content',
      [LAYER_NAMES.branding]: 'branding',
      [LAYER_NAMES.decorative]: 'decorative',
      [LAYER_NAMES.background]: 'background',
      [LAYER_NAMES.headline]: 'headline',
      [LAYER_NAMES.subhead]: 'subhead',
      [LAYER_NAMES.body]: 'body',
      [LAYER_NAMES.cta]: 'cta',
      [LAYER_NAMES.tag]: 'tag',
      [LAYER_NAMES.logo]: 'logo',
    };
    return lookup[name] || null;
  }

  findLayer(frame: FrameNode, layerName: string): SceneNode | null {
    const search = (node: SceneNode): SceneNode | null => {
      if (node.name === layerName) return node;
      if ('children' in node) {
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
      }
      return null;
    };
    return search(frame);
  }

  getTextLayers(frame: FrameNode): TextNode[] {
    const textLayers: TextNode[] = [];
    const search = (node: SceneNode): void => {
      if (node.type === 'TEXT') textLayers.push(node);
      if ('children' in node) {
        for (const child of node.children) search(child);
      }
    };
    search(frame);
    return textLayers;
  }
}

export default LayerManager;