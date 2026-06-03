/**
 * AnalysisPanel — Main analysis interface
 * =========================================
 * Provides code input, analysis controls, and live output display.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Code, Upload, GitFork, Play, Loader2, AlertCircle, Terminal, Sparkles } from 'lucide-react';
import { analyzeCode, getAnalysisResults, type AnalyzeRequest, type AnalysisResult } from '../../api/forge';
import { detectLanguage } from '../../lib/utils';

interface AnalysisPanelProps {
  onResult: (result: AnalysisResult) => void;
}

const SAMPLE_CODE = `def process_user_data(users):
    """Process user data and generate reports."""
    results = []
    for user in users:
        query = "SELECT * FROM users WHERE id = " + str(user['id'])
        data = db.execute(query)
        results.append({
            'name': user['name'],
            'email': user['email'],
            'total': sum(item['amount'] for item in user['orders'])
        })
    return results`;

export default function AnalysisPanel({ onResult }: AnalysisPanelProps) {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-detect language from code
  useEffect(() => {
    if (code && !filename) {
      const detected = detectLanguage(code);
      if (detected !== 'unknown') {
        setFilename(`code.${detected === 'javascript' ? 'js' : detected === 'typescript' ? 'ts' : detected}`);
      }
    }
  }, [code, filename]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      setFilename(file.name);
    };
    reader.readAsText(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStatusMessage('Starting analysis...');

    try {
      const request: AnalyzeRequest = {
        code,
        filename: filename || 'code',
        depth,
      };

      // Submit analysis via REST endpoint
      const response = await analyzeCode(request);
      setAnalysisId(response.analysis_id);
      setStatusMessage(`Analysis submitted: ${response.analysis_id}`);

      // Poll for results
      const pollResults = async () => {
        let attempts = 0;
        const maxAttempts = 30;
        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            console.log('[AnalysisPanel] Polling result for:', response.analysis_id);
            const result = await getAnalysisResults(response.analysis_id);
            console.log('[AnalysisPanel] Got result:', result.health_score);
            const analysisResult: AnalysisResult = {
              analysis_id: result.analysis_id,
              health_score: result.health_score,
              summary: result.summary,
              recommendations: result.recommendations,
              score_breakdown: result.score_breakdown,
              findings: result.findings,
              agents: result.agents,
            };
            console.log('[AnalysisPanel] Calling onResult');
            onResult(analysisResult);
            setIsAnalyzing(false);
            setStatusMessage(null);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
          } catch (err) {
            console.error('[AnalysisPanel] Poll error:', err);
            attempts++;
          }
        }
        setError('Analysis timed out. Please try again.');
        setIsAnalyzing(false);
        setStatusMessage(null);
      };

      pollResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      setStatusMessage(null);
    }
  }, [code, filename, depth, onResult]);

  const loadSample = useCallback(() => {
    setCode(SAMPLE_CODE);
    setFilename('user_processor.py');
  }, []);

  return (
    <div className="space-y-6">
      {/* Code Input */}
      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Source Code</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js,.ts,.jsx,.tsx,.java,.go,.rs,.rb,.php,.c,.cpp,.h,.hpp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 bg-surface-elevated border border-border rounded-lg hover:border-border-hover transition-all"
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
            <button
              onClick={loadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 bg-surface-elevated border border-border rounded-lg hover:border-border-hover transition-all"
            >
              <Sparkles className="w-3 h-3" />
              Sample
            </button>
            <div className="flex items-center gap-1.5 ml-2">
              <GitFork className="w-3 h-3 text-slate-600" />
              <span className="text-xs text-slate-600">GitHub URL</span>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Paste your code here...\n\n# Example:\ndef hello_world():\n    print("Hello, World!")\n    return True`}
          className="w-full h-64 sm:h-80 bg-background/50 p-4 font-mono text-xs sm:text-sm text-slate-300 placeholder-slate-700 resize-none outline-none focus:ring-1 focus:ring-primary/20"
          spellCheck={false}
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface/30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">
              {code.split('\n').length} lines · {code.length} chars
            </span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-600">
              {filename || 'auto-detect'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Depth selector */}
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as any)}
              className="text-xs bg-surface-elevated border border-border text-slate-400 rounded-lg px-2 py-1.5 outline-none focus:border-primary/30"
            >
              <option value="quick">Quick</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !code.trim()}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isAnalyzing || !code.trim()
                  ? 'bg-surface-elevated text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-dim text-background hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          {statusMessage}
        </div>
      )}

      {/* Live Terminal Output */}
      {isAnalyzing && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface/50">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Live Output</span>
          </div>
          <div className="p-4 font-mono text-xs text-slate-400 leading-relaxed max-h-48 overflow-y-auto bg-background/30">
            <div className="text-primary animate-pulse">
              {'>'} <span className="text-slate-500">Analysis in progress... Polling for results.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
