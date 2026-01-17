/**
 * Text Analyzer
 * 
 * Intelligently analyzes text input to determine type, hierarchy, and optimal placement.
 */

export interface TextInput {
  text: string;
  type?: 'headline' | 'subhead' | 'body' | 'cta' | 'tag';
}

export interface AnalyzedText {
  text: string;
  type: 'headline' | 'subhead' | 'body' | 'cta' | 'tag';
  wordCount: number;
  charCount: number;
  hasAction: boolean;
  isPunctated: boolean;
  confidence: number;
}

const CTA_WORDS = [
  'learn', 'get', 'join', 'start', 'try', 'discover', 'explore',
  'sign up', 'subscribe', 'download', 'buy', 'shop', 'order',
  'contact', 'call', 'book', 'register', 'apply', 'claim',
  'read', 'watch', 'listen', 'view', 'see', 'check',
  'click', 'tap', 'swipe', 'scroll'
];

const TAG_PATTERNS = [
  /^(new|hot|sale|trending|featured|exclusive|limited)$/i,
  /^(update|news|blog|post|article)$/i,
  /^(tip|guide|how-?to|tutorial)$/i,
  /^#\w+$/,
  /^\d{1,2}\/\d{1,2}$/,
];

export class TextAnalyzer {
  analyze(inputs: TextInput[]): AnalyzedText[] {
    const results: AnalyzedText[] = [];
    
    for (const input of inputs) {
      if (input.type) {
        results.push({
          text: input.text,
          type: input.type,
          wordCount: this.countWords(input.text),
          charCount: input.text.length,
          hasAction: this.hasActionWord(input.text),
          isPunctated: this.hasPunctuation(input.text),
          confidence: 1.0
        });
      } else {
        results.push(this.detectType(input.text));
      }
    }
    
    return this.ensureHierarchy(results);
  }

  private detectType(text: string): AnalyzedText {
    const wordCount = this.countWords(text);
    const charCount = text.length;
    const hasAction = this.hasActionWord(text);
    const isPunctated = this.hasPunctuation(text);
    
    let type: AnalyzedText['type'] = 'body';
    let confidence = 0.5;
    
    if (this.isTag(text)) {
      type = 'tag';
      confidence = 0.9;
    } else if (hasAction && wordCount <= 5) {
      type = 'cta';
      confidence = 0.85;
    } else if (wordCount <= 10 && !isPunctated) {
      type = 'headline';
      confidence = 0.8;
    } else if (wordCount <= 30) {
      type = 'subhead';
      confidence = 0.75;
    } else {
      type = 'body';
      confidence = 0.7;
    }
    
    return { text, type, wordCount, charCount, hasAction, isPunctated, confidence };
  }

  private isTag(text: string): boolean {
    const trimmed = text.trim();
    if (this.countWords(trimmed) > 3) return false;
    for (const pattern of TAG_PATTERNS) {
      if (pattern.test(trimmed)) return true;
    }
    if (trimmed === trimmed.toUpperCase() && trimmed.length <= 15) return true;
    return false;
  }

  private hasActionWord(text: string): boolean {
    const lower = text.toLowerCase();
    for (const word of CTA_WORDS) {
      if (lower.includes(word)) return true;
    }
    return /[\u2192\u279C\u27A1\u25BA\u25B6]/.test(text);
  }

  private hasPunctuation(text: string): boolean {
    return /[.!?]$/.test(text.trim());
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private ensureHierarchy(results: AnalyzedText[]): AnalyzedText[] {
    const adjusted = [...results];
    const headlines = adjusted.filter(r => r.type === 'headline');
    
    if (headlines.length > 1) {
      let foundFirst = false;
      for (const result of adjusted) {
        if (result.type === 'headline') {
          if (foundFirst) {
            result.type = 'subhead';
            result.confidence *= 0.8;
          }
          foundFirst = true;
        }
      }
    }
    
    if (headlines.length === 0 && adjusted.length > 0) {
      const candidate = adjusted.find(r => r.wordCount <= 15 && r.type !== 'cta' && r.type !== 'tag');
      if (candidate) {
        candidate.type = 'headline';
        candidate.confidence *= 0.7;
      }
    }
    
    const typeOrder = ['tag', 'headline', 'subhead', 'body', 'cta'];
    adjusted.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
    
    return adjusted;
  }
}

export default TextAnalyzer;