/**
 * Figma Asset Factory - UI Entry Point
 * React-based UI for the plugin.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface TextBlock {
  id: string;
  text: string;
  type: 'headline' | 'subhead' | 'body' | 'cta' | 'tag' | 'auto';
}

const ASSET_TYPES = {
  social: [
    { id: 'twitter-post', name: 'Twitter/X Post', dimensions: '1200x675' },
    { id: 'twitter-card', name: 'Twitter/X Card', dimensions: '1080x1080' },
    { id: 'linkedin-post', name: 'LinkedIn Post', dimensions: '1200x627' },
    { id: 'instagram-square', name: 'Instagram Square', dimensions: '1080x1080' },
    { id: 'instagram-story', name: 'Instagram Story', dimensions: '1080x1920' },
  ],
  launch: [
    { id: 'teaser-card', name: 'Teaser Card', dimensions: '1200x675' },
    { id: 'announcement-hero', name: 'Announcement Hero', dimensions: '1200x675' },
    { id: 'feature-highlight', name: 'Feature Highlight', dimensions: '1080x1080' },
  ],
  marketing: [
    { id: 'email-header', name: 'Email Header', dimensions: '600x200' },
    { id: 'blog-featured', name: 'Blog Featured Image', dimensions: '1200x630' },
    { id: 'presentation-slide', name: 'Presentation Slide', dimensions: '1920x1080' },
  ],
};

const THEMES = [
  { id: 'dark', name: 'Dark Mode', description: 'Professional, sleek' },
  { id: 'light', name: 'Light Mode', description: 'Clean, accessible' },
  { id: 'bold', name: 'Bold', description: 'High impact' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, elegant' },
  { id: 'gradient', name: 'Gradient', description: 'Dynamic, modern' },
];

function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'audit' | 'feedback' | 'test'>('generate');
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([{ id: '1', text: '', type: 'headline' }]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      if (msg.type === 'asset-generated' || msg.type === 'batch-complete') setLoading(false);
      if (msg.type === 'error') { alert(msg.payload.message); setLoading(false); }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const addTextBlock = () => {
    const newId = String(textBlocks.length + 1);
    setTextBlocks([...textBlocks, { id: newId, text: '', type: 'auto' }]);
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(textBlocks.map(block => block.id === id ? { ...block, ...updates } : block));
  };

  const removeTextBlock = (id: string) => {
    if (textBlocks.length > 1) setTextBlocks(textBlocks.filter(block => block.id !== id));
  };

  const toggleAssetType = (assetId: string) => {
    setSelectedAssetTypes(prev => prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]);
  };

  const handleGenerate = () => {
    if (selectedAssetTypes.length === 0) { alert('Please select at least one asset type'); return; }
    if (textBlocks.every(block => !block.text.trim())) { alert('Please enter at least one text block'); return; }
    setLoading(true);
    const content = textBlocks.filter(block => block.text.trim()).map(block => ({ text: block.text, type: block.type === 'auto' ? undefined : block.type }));
    const msgType = selectedAssetTypes.length === 1 ? 'generate-asset' : 'batch-generate';
    parent.postMessage({ pluginMessage: { type: msgType, payload: { assetType: selectedAssetTypes[0], assetTypes: selectedAssetTypes, content, theme: selectedTheme } } }, '*');
  };

  return (
    <div className="app">
      <header className="header"><h1>Asset Factory</h1><div className="status">Ready</div></header>
      <nav className="tabs">
        {(['generate', 'audit', 'feedback', 'test'] as const).map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </nav>
      <main className="content">
        {activeTab === 'generate' && (
          <div>
            <section className="section">
              <h2>Text Content</h2>
              {textBlocks.map(block => (
                <div key={block.id} className="text-block">
                  <div className="text-block-header">
                    <select value={block.type} onChange={e => updateTextBlock(block.id, { type: e.target.value as any })}>
                      <option value="auto">Auto-detect</option>
                      <option value="headline">Headline</option>
                      <option value="subhead">Subhead</option>
                      <option value="body">Body</option>
                      <option value="cta">CTA</option>
                      <option value="tag">Tag</option>
                    </select>
                    {textBlocks.length > 1 && <button className="remove-btn" onClick={() => removeTextBlock(block.id)}>x</button>}
                  </div>
                  <textarea placeholder={`Enter ${block.type === 'auto' ? 'text' : block.type}...`} value={block.text} onChange={e => updateTextBlock(block.id, { text: e.target.value })} rows={2} />
                </div>
              ))}
              <button className="add-btn" onClick={addTextBlock}>+ Add Text Block</button>
            </section>
            <section className="section">
              <h2>Asset Types</h2>
              {Object.entries(ASSET_TYPES).map(([category, assets]) => (
                <div key={category} className="asset-category">
                  <h3>{category === 'social' ? 'Social Graphics' : category === 'launch' ? 'Product Launch' : 'Marketing Assets'}</h3>
                  {assets.map(asset => (
                    <label key={asset.id} className="asset-option">
                      <input type="checkbox" checked={selectedAssetTypes.includes(asset.id)} onChange={() => toggleAssetType(asset.id)} />
                      <span>{asset.name}</span>
                      <span className="dimensions">{asset.dimensions}</span>
                    </label>
                  ))}
                </div>
              ))}
            </section>
            <section className="section">
              <h2>Theme</h2>
              {THEMES.map(theme => (
                <label key={theme.id} className="theme-option">
                  <input type="radio" name="theme" value={theme.id} checked={selectedTheme === theme.id} onChange={() => setSelectedTheme(theme.id)} />
                  <div className="theme-info"><span className="theme-name">{theme.name}</span><span className="theme-desc">{theme.description}</span></div>
                </label>
              ))}
            </section>
            <button className="generate-btn" onClick={handleGenerate} disabled={loading || selectedAssetTypes.length === 0}>
              {loading ? 'Generating...' : `Generate ${selectedAssetTypes.length} Asset${selectedAssetTypes.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
        {activeTab === 'audit' && (
          <section className="section">
            <h2>Brand Compliance Audit</h2>
            <p>Select frames in Figma and run an audit to check brand compliance.</p>
            <button className="audit-btn" onClick={() => parent.postMessage({ pluginMessage: { type: 'run-audit', payload: { nodeIds: [] } } }, '*')}>Run Audit on Selection</button>
          </section>
        )}
        {activeTab === 'feedback' && (
          <section className="section">
            <h2>Feedback Summary</h2>
            <button className="feedback-btn" onClick={() => parent.postMessage({ pluginMessage: { type: 'get-feedback-summary', payload: { days: 30 } } }, '*')}>Get Last 30 Days</button>
          </section>
        )}
        {activeTab === 'test' && (
          <section className="section">
            <h2>Plugin Self-Test</h2>
            <p>Run automated tests to verify plugin functionality.</p>
            <button className="test-btn" onClick={() => parent.postMessage({ pluginMessage: { type: 'run-self-test' } }, '*')}>Run All Tests</button>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, -apple-system, sans-serif; font-size: 12px; background: #2c2c2c; color: #e5e5e5; }
.app { display: flex; flex-direction: column; min-height: 100vh; padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #444; }
.header h1 { font-size: 16px; font-weight: 600; color: #fff; }
.status { font-size: 11px; color: #0fa958; }
.tabs { display: flex; gap: 4px; margin-bottom: 16px; }
.tabs button { flex: 1; padding: 8px 12px; border: none; background: #3c3c3c; color: #999; cursor: pointer; font-size: 11px; border-radius: 4px; }
.tabs button:hover { background: #4c4c4c; color: #fff; }
.tabs button.active { background: #FE621D; color: #fff; }
.section { margin-bottom: 20px; }
.section h2 { font-size: 13px; font-weight: 600; margin-bottom: 12px; color: #fff; }
.section h3 { font-size: 11px; font-weight: 500; margin: 12px 0 8px; color: #888; text-transform: uppercase; }
.section p { color: #888; font-size: 11px; margin-bottom: 12px; }
.text-block { margin-bottom: 12px; }
.text-block-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
select { padding: 6px 10px; border: 1px solid #555; border-radius: 4px; background: #3c3c3c; color: #e5e5e5; font-size: 11px; }
.remove-btn { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; padding: 0 6px; }
.remove-btn:hover { color: #ef4444; }
textarea { width: 100%; padding: 10px; border: 1px solid #555; border-radius: 6px; background: #3c3c3c; color: #e5e5e5; font-size: 12px; resize: vertical; font-family: inherit; min-height: 60px; }
textarea:focus { outline: none; border-color: #FE621D; }
textarea::placeholder { color: #777; }
.add-btn { width: 100%; padding: 10px; border: 1px dashed #555; border-radius: 6px; background: none; color: #888; cursor: pointer; font-size: 12px; }
.add-btn:hover { border-color: #FE621D; color: #FE621D; }
.asset-category { margin-bottom: 16px; }
.asset-option, .theme-option { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; }
.asset-option:hover, .theme-option:hover { background: #3c3c3c; }
.asset-option input, .theme-option input { accent-color: #FE621D; width: 16px; height: 16px; }
.asset-option span:first-of-type { flex: 1; }
.dimensions { color: #777; font-size: 11px; }
.theme-info { display: flex; flex-direction: column; }
.theme-name { font-weight: 500; color: #fff; }
.theme-desc { color: #888; font-size: 11px; }
.generate-btn { width: 100%; padding: 14px; border: none; border-radius: 6px; background: linear-gradient(135deg, #FE621D 0%, #FF8C42 100%); color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 16px; }
.generate-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(254, 98, 29, 0.3); }
.generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.audit-btn, .feedback-btn, .test-btn { width: 100%; padding: 12px; border: none; border-radius: 6px; background: #FE621D; color: white; font-size: 13px; font-weight: 500; cursor: pointer; margin-top: 12px; }`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }