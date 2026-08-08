import type { AnalysisInput, Prediction, RiskLevel } from '@/lib/types';

const ANALYSIS_STEPS = [
  'Uploading video...',
  'Extracting frames...',
  'Detecting faces...',
  'Running AI model...',
  'Detecting deepfake artifacts...',
  'Checking facial consistency...',
  'Lip-sync analysis...',
  'Eye blink analysis...',
  'Texture analysis...',
  'Generating final report...',
];

export function getAnalysisSteps() {
  return ANALYSIS_STEPS;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Simulated deepfake detection. Produces a deterministic-ish but varied result
 * from the file's intrinsic properties (name + size) so the same video yields a
 * stable prediction, while different videos get different scores.
 */
export function runDetection(file: File): Omit<AnalysisInput, 'file_name' | 'file_size' | 'file_type'> {
  // seed from file properties
  const seed = hashString(file.name + file.size);
  const rng = mulberry32(seed);

  const fakeBias = rng();
  const isFake = fakeBias > 0.5;

  const confidence = clamp(72 + rng() * 27, 70, 99.5);
  const riskLevel: RiskLevel = confidence > 90 ? 'High' : confidence > 78 ? 'Medium' : 'Low';

  const faceConsistency = clamp((isFake ? 40 + rng() * 35 : 78 + rng() * 20));
  const lipSync = clamp((isFake ? 35 + rng() * 40 : 80 + rng() * 18));
  const visualArtifact = clamp((isFake ? 60 + rng() * 38 : 10 + rng() * 25));
  const temporalConsistency = clamp((isFake ? 45 + rng() * 35 : 82 + rng() * 16));

  const prediction: Prediction = isFake ? 'FAKE' : 'REAL';

  const explanation = isFake
    ? 'The uploaded video contains strong deepfake artifacts, inconsistent facial textures, unnatural eye blinking, and lip synchronization mismatch. Temporal analysis reveals frame-to-frame discontinuities typical of generative manipulation.'
    : 'The uploaded video shows consistent facial geometry, natural blinking cadence, coherent lip synchronization, and stable temporal coherence across frames. No significant manipulation artifacts were detected.';

  const summary = isFake
    ? `This video is likely AI-generated. Our model detected multiple manipulation signals with ${confidence.toFixed(1)}% confidence — facial inconsistency, lip-sync drift, and visible blending artifacts all point to synthetic content.`
    : `This video appears authentic. Facial landmarks, motion vectors, and texture patterns are consistent with genuine capture, with ${confidence.toFixed(1)}% confidence.`;

  return {
    prediction,
    confidence: Number(confidence.toFixed(1)),
    risk_level: riskLevel,
    face_consistency: Number(faceConsistency.toFixed(1)),
    lip_sync: Number(lipSync.toFixed(1)),
    visual_artifact: Number(visualArtifact.toFixed(1)),
    temporal_consistency: Number(temporalConsistency.toFixed(1)),
    explanation,
    summary,
  };
}

function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
