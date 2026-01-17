/**
 * Feedback System
 * 
 * Collects, stores, and analyzes feedback on generated assets.
 */

export interface FeedbackEntry {
  assetId: string;
  timestamp: Date;
  reviewer: string;
  ratings: { overall: number; brand_alignment?: number; visual_appeal?: number; };
  issues: FeedbackIssue[];
  outcome: 'approved' | 'revised' | 'rejected';
  notes?: string;
}

export interface FeedbackIssue {
  category: 'color' | 'typography' | 'layout' | 'logo' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
}

export interface FeedbackSummary {
  totalAssets: number;
  approvedFirstTry: number;
  neededRevision: number;
  rejected: number;
  averageRating: number;
  commonIssues: Array<{ issue: string; count: number }>;
  templateHealth: Record<string, number>;
  periodStart: Date;
  periodEnd: Date;
}

export class FeedbackSystem {
  private feedbackLog: FeedbackEntry[] = [];
  private storageKey = 'assetFactory_feedback';

  constructor() {
    this.loadFromStorage();
  }

  submit(entry: FeedbackEntry): void {
    this.feedbackLog.push(entry);
    this.saveToStorage();
  }

  getSummary(days: number = 30): FeedbackSummary {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recentFeedback = this.feedbackLog.filter(f => f.timestamp >= cutoff);
    const totalAssets = recentFeedback.length;
    const approvedFirstTry = recentFeedback.filter(f => f.outcome === 'approved').length;
    const neededRevision = recentFeedback.filter(f => f.outcome === 'revised').length;
    const rejected = recentFeedback.filter(f => f.outcome === 'rejected').length;
    const averageRating = totalAssets > 0
      ? recentFeedback.reduce((sum, f) => sum + f.ratings.overall, 0) / totalAssets
      : 0;
    const issueCounter: Record<string, number> = {};
    for (const feedback of recentFeedback) {
      for (const issue of feedback.issues) {
        const key = `${issue.category}: ${issue.description}`;
        issueCounter[key] = (issueCounter[key] || 0) + 1;
      }
    }
    const commonIssues = Object.entries(issueCounter)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return {
      totalAssets,
      approvedFirstTry,
      neededRevision,
      rejected,
      averageRating: Math.round(averageRating * 10) / 10,
      commonIssues,
      templateHealth: {},
      periodStart: cutoff,
      periodEnd: new Date()
    };
  }

  private saveToStorage(): void {
    try {
      const data = JSON.stringify({ feedbackLog: this.feedbackLog.slice(-1000) });
      figma.root.setPluginData(this.storageKey, data);
    } catch (error) {
      console.error('Failed to save feedback data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = figma.root.getPluginData(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.feedbackLog = (parsed.feedbackLog || []).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));
      }
    } catch (error) {
      this.feedbackLog = [];
    }
  }
}

export default FeedbackSystem;