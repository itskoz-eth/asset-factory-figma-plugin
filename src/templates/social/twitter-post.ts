/**
 * Twitter/X Post Template
 * 
 * Dimensions: 1200x675px
 * Aspect Ratio: 16:9
 */

import { TemplateDefinition } from '../template-types';

export const twitterPostTemplate: TemplateDefinition = {
  id: 'twitter-post',
  name: 'Twitter/X Post',
  category: 'social',
  dimensions: {
    width: 1200,
    height: 675
  },
  aspectRatio: '16:9',
  
  zones: {
    headline: {
      x: 60,
      y: 120,
      width: 1080,
      height: 200,
      maxChars: 60,
      fontSize: {
        min: 32,
        max: 56,
        optimal: 48
      },
      alignment: 'center'
    },
    subhead: {
      x: 80,
      y: 340,
      width: 1040,
      height: 120,
      maxChars: 120,
      fontSize: {
        min: 18,
        max: 28,
        optimal: 22
      },
      alignment: 'center'
    },
    cta: {
      x: 400,
      y: 500,
      width: 400,
      height: 60,
      maxChars: 25,
      fontSize: {
        min: 16,
        max: 24,
        optimal: 20
      },
      alignment: 'center'
    },
    logo: {
      x: 1080,
      y: 595,
      width: 100,
      height: 60,
      alignment: 'right'
    },
    tag: {
      x: 20,
      y: 20,
      width: 200,
      height: 40,
      maxChars: 15,
      fontSize: {
        min: 12,
        max: 16,
        optimal: 14
      },
      alignment: 'left'
    }
  },
  
  safeZone: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40
  },
  
  variants: [
    {
      id: 'centered',
      name: 'Centered Layout',
      description: 'Content centered with logo bottom-right'
    },
    {
      id: 'left-aligned',
      name: 'Left Aligned',
      description: 'Content left-aligned for longer text'
    },
    {
      id: 'image-right',
      name: 'Image Right',
      description: 'Text left, image/graphic right'
    }
  ],
  
  defaultTheme: 'dark',
  
  metadata: {
    platform: 'Twitter/X',
    placement: 'Feed, Timeline',
    fileTypes: ['PNG', 'JPG'],
    maxFileSize: '5MB'
  }
};

export default twitterPostTemplate;
