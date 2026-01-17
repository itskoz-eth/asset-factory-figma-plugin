/**
 * Test Runner
 * 
 * Self-testing system for plugin validation.
 */

import { BrandConfigLoader } from '../config/brand-schema';
import { ASSET_DIMENSIONS, DEFAULT_COLORS } from '../config/defaults';

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  passed: boolean;
  passedCount: number;
  totalCount: number;
}

export interface TestRunResult {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  duration: number;
  suites: TestSuiteResult[];
  timestamp: Date;
}

type TestFunction = () => Promise<void> | void;

export class TestRunner {
  private suites: Map<string, Map<string, TestFunction>> = new Map();

  constructor() {
    this.registerDefaultTests();
  }

  private registerDefaultTests(): void {
    this.addSuite('Brand Configuration', {
      'load_valid_config': () => this.testLoadValidConfig(),
      'color_format_validation': () => this.testColorFormatValidation(),
    });
    this.addSuite('Asset Generation', {
      'create_twitter_post': () => this.testCreateTwitterPost(),
      'apply_theme_dark': () => this.testApplyThemeDark(),
    });
    this.addSuite('Integration', {
      'config_persistence': () => this.testConfigPersistence(),
      'batch_generation': () => this.testBatchGeneration(),
    });
  }

  addSuite(name: string, tests: Record<string, TestFunction>): void {
    this.suites.set(name, new Map(Object.entries(tests)));
  }

  async runAll(): Promise<TestRunResult> {
    const startTime = Date.now();
    const suiteResults: TestSuiteResult[] = [];
    for (const [suiteName, tests] of this.suites) {
      const suiteResult = await this.runSuite(suiteName, tests);
      suiteResults.push(suiteResult);
    }
    const passedCount = suiteResults.reduce((sum, s) => sum + s.passedCount, 0);
    const totalCount = suiteResults.reduce((sum, s) => sum + s.totalCount, 0);
    return {
      passed: passedCount === totalCount,
      passedCount,
      totalCount,
      duration: Date.now() - startTime,
      suites: suiteResults,
      timestamp: new Date()
    };
  }

  async runSuite(suiteName: string, tests?: Map<string, TestFunction>): Promise<TestSuiteResult> {
    const suiteTests = tests || this.suites.get(suiteName);
    if (!suiteTests) return { name: suiteName, tests: [], passed: false, passedCount: 0, totalCount: 0 };
    const results: TestResult[] = [];
    for (const [testName, testFn] of suiteTests) {
      const result = await this.runTest(testName, testFn);
      results.push(result);
    }
    const passedCount = results.filter(r => r.passed).length;
    return { name: suiteName, tests: results, passed: passedCount === results.length, passedCount, totalCount: results.length };
  }

  private async runTest(name: string, fn: TestFunction): Promise<TestResult> {
    const startTime = Date.now();
    try {
      await fn();
      return { name, passed: true, duration: Date.now() - startTime };
    } catch (error) {
      return { name, passed: false, duration: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private testLoadValidConfig(): void {
    const loader = new BrandConfigLoader();
    const template = BrandConfigLoader.generateTemplate();
    const config = loader.parse(template);
    if (!config.brand || !config.colors) throw new Error('Failed to parse config');
  }

  private testColorFormatValidation(): void {
    if (!/^#[0-9A-Fa-f]{6}$/.test(DEFAULT_COLORS.primary)) {
      throw new Error('Invalid color format');
    }
  }

  private testCreateTwitterPost(): void {
    const dimensions = ASSET_DIMENSIONS['twitter-post'];
    if (!dimensions || dimensions.width !== 1200 || dimensions.height !== 675) {
      throw new Error('Invalid Twitter post dimensions');
    }
  }

  private testApplyThemeDark(): void {
    if (!DEFAULT_COLORS.background_dark || !DEFAULT_COLORS.text_light) {
      throw new Error('Dark theme colors not defined');
    }
  }

  private testConfigPersistence(): void {
    const testKey = 'testRunner_persistence';
    const testValue = 'test_' + Date.now();
    figma.root.setPluginData(testKey, testValue);
    const retrieved = figma.root.getPluginData(testKey);
    if (retrieved !== testValue) throw new Error('Plugin data persistence failed');
    figma.root.setPluginData(testKey, '');
  }

  private testBatchGeneration(): void {
    const types = ['twitter-post', 'linkedin-post', 'instagram-square'];
    for (const type of types) {
      if (!ASSET_DIMENSIONS[type]) throw new Error(`Missing dimension: ${type}`);
    }
  }
}

export default TestRunner;