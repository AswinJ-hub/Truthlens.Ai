import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileVideo, X, ScanSearch, ShieldX, ShieldCheck, Download, Share2, Copy, RotateCcw, AlertCircle, Check, Lock } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { runDetection, formatFileSize, formatDate } from '@/lib/analysis';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE, type Analysis } from '@/lib/types';

type Stage = 'idle' | 'analyzing' | 'done';

interface Result extends Analysis {}

export function AnalyzePage() {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptFile = useCallback((f: File) => {
    setError('');
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!SUPPORTED_FORMATS.includes(ext as typeof SUPPORTED_FORMATS[number])) {
      setError(`Unsupported format. Please upload ${SUPPORTED_FORMATS.join(', ')}.`);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setStage('idle');

    // simulate upload progress
    setUploadProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 22;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
      }
      setUploadProgress(p);
    }, 120);
  }, [previewUrl]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.remove('ring-2');
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setResult(null);
    setStage('idle');
    setError('');
  };

  const analyze = async () => {
    if (!file) return;
    setStage('analyzing');
  };

  const onAnalysisComplete = async () => {
    if (!file) return;
    const detection = runDetection(file);

    const baseResult: Result = {
      id: crypto.randomUUID(),
      user_id: user?.id ?? '',
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || file.name.split('.').pop() || null,
      ...detection,
      created_at: new Date().toISOString(),
    };

    // Only persist to database when the user is signed in
    if (user) {
      const { data, error } = await supabase
        .from('analyses')
        .insert({
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || file.name.split('.').pop() || null,
          ...detection,
        })
        .select('*')
        .maybeSingle();

      if (error || !data) {
        setError(error?.message ?? 'Failed to save analysis.');
        setStage('idle');
        return;
      }
      setResult(data as Result);
    } else {
      setResult(baseResult);
    }
    setStage('done');
  };

  const reset = () => {
    removeFile();
  };

  const copyResult = () => {
    if (!result) return;
    const text = `TruthLens AI Report\n\nFile: ${result.file_name}\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}\n\n${result.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!result) return;
    const report = buildPdfReport(result);
    const blob = new Blob([report], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens-report-${result.id.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if (!result) return;
    const text = `TruthLens AI detected this video as ${result.prediction} with ${result.confidence}% confidence.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'TruthLens AI Report', text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold">Analyze Video</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>
            Upload a video to detect whether it's real or AI-generated.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', color: 'var(--color-error-500)' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* IDLE: upload zone */}
        {stage === 'idle' && !file && (
          <Card className="p-8">
            <div
              ref={dragRef}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add('ring-2'); }}
              onDragLeave={() => dragRef.current?.classList.remove('ring-2')}
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed py-16 px-6 text-center cursor-pointer transition-all hover:border-brand-400"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-soft)' }}
            >
              <input ref={inputRef} type="file" accept=".mp4,.mov,.avi,.mkv,video/*" onChange={onPick} className="hidden" />
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5 transition-transform hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))', color: '#fff' }}>
                <Upload size={28} />
              </div>
              <h3 className="font-display text-lg font-semibold">Browse Video to Upload</h3>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>
                Drag & drop or click to browse
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {SUPPORTED_FORMATS.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    {f}
                  </span>
                ))}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· Max {formatFileSize(MAX_FILE_SIZE)}</span>
              </div>
            </div>

            {/* privacy notice */}
            <div className="mt-5 flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-soft)' }}>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: 'color-mix(in srgb, var(--color-warning-500) 12%, transparent)', color: 'var(--color-warning-500)' }}>
                <Lock size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Privacy notice</p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  Uploaded videos are processed in your browser and never stored beyond your session.
                  Do not upload videos containing sensitive, private, or personally identifying content
                  unless you have permission to analyze them.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* FILE SELECTED (before analyze) */}
        {stage === 'idle' && file && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Video Preview</h2>
                <button onClick={removeFile} className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--text-soft)' }}>
                  <X size={14} /> Remove
                </button>
              </div>
              {previewUrl && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: '#000' }}>
                  <video src={previewUrl} controls className="w-full aspect-video object-contain" />
                </div>
              )}

              <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl border" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-soft)' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: 'color-mix(in srgb, var(--color-brand-500) 14%, transparent)', color: 'var(--color-brand-400)' }}>
                  <FileVideo size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatFileSize(file.size)} · {(file.type || file.name.split('.').pop() || '').toUpperCase()}
                  </p>
                </div>
              </div>

              {uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-soft)' }}>
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))' }} />
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold mb-2">Ready to analyze</h2>
              <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
                Our AI will extract frames and run four detection passes on this video.
              </p>
              <div className="mt-5 space-y-2.5">
                {['Face consistency', 'Lip-sync analysis', 'Visual artifacts', 'Temporal coherence'].map((s) => (
                  <div key={s} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-soft)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent-500)' }} />
                    {s}
                  </div>
                ))}
              </div>
              <Button fullWidth size="lg" className="mt-6" onClick={analyze} disabled={uploadProgress < 100}>
                <ScanSearch size={18} />
                Analyze Video
              </Button>
            </Card>
          </div>
        )}

        {/* ANALYZING */}
        {stage === 'analyzing' && (
          <Card className="p-10">
            <AnalysisLoader onComplete={onAnalysisComplete} />
          </Card>
        )}

        {/* DONE: results */}
        {stage === 'done' && result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* video preview */}
              <Card className="lg:col-span-2 p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Uploaded Video</h2>
                {previewUrl && (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: '#000' }}>
                    <video src={previewUrl} controls className="w-full aspect-video object-contain" />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{result.file_name}</span>
                  <span>·</span>
                  <span>{formatFileSize(result.file_size)}</span>
                  <span>·</span>
                  <span>{formatDate(result.created_at)}</span>
                </div>
              </Card>

              {/* verdict */}
              <Card className="p-6 relative overflow-hidden">
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
                  style={{ background: result.prediction === 'FAKE' ? 'var(--color-error-500)' : 'var(--color-success-500)' }}
                />
                <div className="relative">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Prediction</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-2xl"
                      style={{
                        background: result.prediction === 'FAKE'
                          ? 'color-mix(in srgb, var(--color-error-500) 16%, transparent)'
                          : 'color-mix(in srgb, var(--color-success-500) 16%, transparent)',
                        color: result.prediction === 'FAKE' ? 'var(--color-error-500)' : 'var(--color-success-500)',
                      }}
                    >
                      {result.prediction === 'FAKE' ? <ShieldX size={28} /> : <ShieldCheck size={28} />}
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold" style={{ color: result.prediction === 'FAKE' ? 'var(--color-error-500)' : 'var(--color-success-500)' }}>
                        {result.prediction}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{Number(result.confidence).toFixed(1)}% confidence</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Risk Level</span>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: result.risk_level === 'High'
                            ? 'color-mix(in srgb, var(--color-error-500) 14%, transparent)'
                            : result.risk_level === 'Medium'
                              ? 'color-mix(in srgb, var(--color-warning-500) 14%, transparent)'
                              : 'color-mix(in srgb, var(--color-success-500) 14%, transparent)',
                          color: result.risk_level === 'High' ? 'var(--color-error-500)' : result.risk_level === 'Medium' ? 'var(--color-warning-500)' : 'var(--color-success-500)',
                        }}
                      >
                        {result.risk_level}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* scores */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold mb-5">Detection Scores</h2>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <ScoreBar label="Face Consistency" value={Number(result.face_consistency)} good={Number(result.face_consistency) > 70} />
                <ScoreBar label="Lip Sync" value={Number(result.lip_sync)} good={Number(result.lip_sync) > 70} />
                <ScoreBar label="Visual Artifact" value={Number(result.visual_artifact)} good={Number(result.visual_artifact) < 40} invert />
                <ScoreBar label="Temporal Consistency" value={Number(result.temporal_consistency)} good={Number(result.temporal_consistency) > 70} />
              </div>
            </Card>

            {/* explanation + summary */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">AI Explanation</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  {result.explanation}
                </p>
              </Card>
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">AI Summary</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  {result.summary}
                </p>
              </Card>
            </div>

            {/* actions */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Report</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={downloadReport}>
                  <Download size={16} />
                  Download PDF Report
                </Button>
                <Button variant="secondary" onClick={shareReport}>
                  <Share2 size={16} />
                  Share Report
                </Button>
                <Button variant="secondary" onClick={copyResult}>
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Result</>}
                </Button>
                <Button variant="ghost" onClick={reset}>
                  <RotateCcw size={16} />
                  Analyze Another Video
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ScoreBar({ label, value, good, invert }: { label: string; value: number; good: boolean; invert?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const color = good ? 'var(--color-success-500)' : 'var(--color-error-500)';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold font-display" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      {invert && <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>Lower is better</p>}
    </div>
  );
}

function buildPdfReport(a: Analysis): string {
  // Minimal valid PDF with the report text
  const lines = [
    'TruthLens AI - Detection Report',
    '',
    `File: ${a.file_name}`,
    `Size: ${formatFileSize(a.file_size)}`,
    `Date: ${formatDate(a.created_at)}`,
    '',
    `Prediction: ${a.prediction}`,
    `Confidence: ${Number(a.confidence).toFixed(1)}%`,
    `Risk Level: ${a.risk_level}`,
    '',
    'Detection Scores:',
    `  Face Consistency: ${Number(a.face_consistency).toFixed(1)}%`,
    `  Lip Sync: ${Number(a.lip_sync).toFixed(1)}%`,
    `  Visual Artifact: ${Number(a.visual_artifact).toFixed(1)}%`,
    `  Temporal Consistency: ${Number(a.temporal_consistency).toFixed(1)}%`,
    '',
    'Explanation:',
    a.explanation ?? '',
    '',
    'Summary:',
    a.summary ?? '',
  ];
  const text = lines.join('\n');
  // escape parentheses
  const esc = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const content = `BT /F1 12 Tf 50 760 Td 14 TL (${esc.replace(/\n/g, ') Tj 0 -14 Td (')}) Tj ET`;
  const stream = `${content}\n`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((o) => {
    offsets.push(pdf.length);
    pdf += o;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}
