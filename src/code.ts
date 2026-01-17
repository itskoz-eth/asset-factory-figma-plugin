/**
 * Figma Asset Factory - Main Plugin Code
 */

import { AssetEngine } from './core/asset-engine';
import { TextAnalyzer } from './core/text-analyzer';
import { LayerManager } from './core/layer-manager';
import { ThemeEngine } from './core/theme-engine';
import { AuditEngine } from './core/audit-engine';
import { FeedbackSystem } from './core/feedback-system';
import { TestRunner } from './core/test-runner';
import { BrandConfigLoader } from './config/brand-schema';
import { ASSET_DIMENSIONS } from './config/defaults';

const assetEngine = new AssetEngine();
const textAnalyzer = new TextAnalyzer();
const layerManager = new LayerManager();
const themeEngine = new ThemeEngine();
const auditEngine = new AuditEngine();
const feedbackSystem = new FeedbackSystem();
const testRunner = new TestRunner();
const configLoader = new BrandConfigLoader();

figma.showUI(__html__, { width: 420, height: 600, themeColors: true });

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'generate-asset':
        await handleGenerateAsset(msg.payload);
        break;
      case 'batch-generate':
        await handleBatchGenerate(msg.payload);
        break;
      case 'run-audit':
        await handleRunAudit(msg.payload);
        break;
      case 'submit-feedback':
        await handleSubmitFeedback(msg.payload);
        break;
      case 'run-self-test':
        await handleRunSelfTest();
        break;
      case 'load-brand-config':
        await handleLoadBrandConfig(msg.payload);
        break;
      case 'get-feedback-summary':
        await handleGetFeedbackSummary(msg.payload);
        break;
      case 'cancel':
        figma.closePlugin();
        break;
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      payload: { message: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
};

figma.on('run', ({ command }: RunEvent) => {
  switch (command) {
    case 'run-audit':
      handleRunAudit({ nodeIds: figma.currentPage.selection.map(n => n.id) });
      break;
    case 'run-self-test':
      handleRunSelfTest();
      break;
  }
});

async function handleGenerateAsset(payload: GenerateAssetPayload): Promise<void> {
  const { assetType, content, theme, options } = payload;
  const analyzedContent = textAnalyzer.analyze(content);
  const dimensions = ASSET_DIMENSIONS[assetType];
  if (!dimensions) throw new Error(`Unknown asset type: ${assetType}`);
  const asset = await assetEngine.generate({ type: assetType, content: analyzedContent, dimensions, theme, options });
  layerManager.applyNaming(asset.node);
  if (theme) themeEngine.apply(asset.node, theme);
  const auditResult = auditEngine.audit(asset.node);
  figma.viewport.scrollAndZoomIntoView([asset.node]);
  figma.ui.postMessage({ type: 'asset-generated', payload: { nodeId: asset.node.id, name: asset.node.name, dimensions, auditResult } });
}

async function handleBatchGenerate(payload: BatchGeneratePayload): Promise<void> {
  const { assetTypes, content, theme } = payload;
  const results: BatchGenerateResult[] = [];
  for (const assetType of assetTypes) {
    try {
      await handleGenerateAsset({ assetType, content, theme, options: {} });
      results.push({ assetType, success: true });
    } catch (error) {
      results.push({ assetType, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  figma.ui.postMessage({ type: 'batch-complete', payload: { results } });
}

async function handleRunAudit(payload: RunAuditPayload): Promise<void> {
  const { nodeIds } = payload;
  const results: AuditResult[] = [];
  for (const nodeId of nodeIds) {
    const node = figma.getNodeById(nodeId);
    if (node && node.type === 'FRAME') results.push(auditEngine.audit(node));
  }
  figma.ui.postMessage({ type: 'audit-complete', payload: { results } });
}

async function handleSubmitFeedback(payload: SubmitFeedbackPayload): Promise<void> {
  const { assetId, rating, issues, notes, outcome } = payload;
  feedbackSystem.submit({ assetId, timestamp: new Date(), reviewer: figma.currentUser?.name || 'Anonymous', ratings: { overall: rating }, issues: issues || [], outcome, notes });
  figma.ui.postMessage({ type: 'feedback-submitted', payload: { success: true } });
}

async function handleRunSelfTest(): Promise<void> {
  const results = await testRunner.runAll();
  figma.ui.postMessage({ type: 'self-test-complete', payload: { results } });
}

async function handleLoadBrandConfig(payload: LoadBrandConfigPayload): Promise<void> {
  const { configYaml } = payload;
  const config = configLoader.parse(configYaml);
  const validation = configLoader.validate(config);
  if (!validation.valid) throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
  figma.root.setPluginData('brandConfig', JSON.stringify(config));
  assetEngine.setBrandConfig(config);
  themeEngine.setBrandConfig(config);
  auditEngine.setBrandConfig(config);
  figma.ui.postMessage({ type: 'config-loaded', payload: { config, validation } });
}

async function handleGetFeedbackSummary(payload: GetFeedbackSummaryPayload): Promise<void> {
  const { days } = payload;
  const summary = feedbackSystem.getSummary(days);
  figma.ui.postMessage({ type: 'feedback-summary', payload: { summary } });
}

interface PluginMessage { type: string; payload?: any; }
interface RunEvent { command: string; }
interface GenerateAssetPayload { assetType: string; content: TextContent[]; theme?: string; options?: AssetOptions; }
interface TextContent { text: string; type?: 'headline' | 'subhead' | 'body' | 'cta' | 'tag'; }
interface AssetOptions { logoPlacement?: string; effects?: string[]; }
interface BatchGeneratePayload { assetTypes: string[]; content: TextContent[]; theme?: string; }
interface BatchGenerateResult { assetType: string; success: boolean; error?: string; }
interface RunAuditPayload { nodeIds: string[]; }
interface AuditResult { nodeId: string; passed: boolean; checks: AuditCheck[]; warnings: string[]; }
interface AuditCheck { name: string; passed: boolean; message?: string; }
interface SubmitFeedbackPayload { assetId: string; rating: number; issues?: FeedbackIssue[]; notes?: string; outcome: 'approved' | 'revised' | 'rejected'; }
interface FeedbackIssue { category: string; severity: string; description: string; }
interface LoadBrandConfigPayload { configYaml: string; }
interface GetFeedbackSummaryPayload { days: number; }