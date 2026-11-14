export type RenderShot = {
  id: string;
  start: number;
  end: number;
  duration: number;
  title: string;
  visual: string;
  visualFamily: 'auto' | 'city' | 'particles' | 'nature';
  motion: string;
  narration: string;
};
export type PreparedRenderProject = {
  project: {
    schemaVersion: number;
    title: string;
    prompt: string;
    format: 'portrait' | 'landscape';
    mode: 'animation' | 'knowledge' | 'story' | 'brand';
    shots: RenderShot[];
  };
  durationSeconds: number;
  durationInFrames: number;
  width: number;
  height: number;
};
export const FPS: number;
export function prepareRenderProject(
  raw: unknown,
  limits?: {minimumSeconds?: number; maximumSeconds?: number}
): PreparedRenderProject;
