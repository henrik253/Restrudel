// upload.ts — send the whole track to the backend as soon as it is picked (A8).
//
// Uploading once and cutting server-side means re-selecting a different part of
// the same song costs nothing: the conversion request is just a time range.
export interface UploadResult {
  uploadId: string;
  durationSec: number;
  filename: string | null;
  bytes: number;
  audio?: { codec: string | null; channels: number | null; sampleRate: number | null };
}

export interface UploadError {
  code: string;
  message: string;
}

/** The backend origin: same host in production (Caddy), :8787 in Vite dev. */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL
    ?? (location.port === '5173' ? `${location.protocol}//${location.hostname}:8787` : location.origin);
  return `${base}${path}`;
}

export async function uploadTrack(
  file: File,
  { signal, onProgress }: { signal?: AbortSignal; onProgress?: (fraction: number) => void } = {},
): Promise<UploadResult> {
  // XHR rather than fetch: it reports upload progress, and a large track on a
  // slow connection needs a progress bar to not look frozen.
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('/api/upload'));
    xhr.responseType = 'json';
    xhr.setRequestHeader('content-type', 'application/octet-stream');
    xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      const body = xhr.response ?? {};
      if (xhr.status === 200 && body.uploadId) return resolve(body as UploadResult);
      reject({
        code: body.code ?? 'upload_failed',
        message: body.message ?? `upload failed (HTTP ${xhr.status})`,
      } satisfies UploadError);
    };
    xhr.onerror = () => reject({ code: 'upload_failed', message: 'could not reach the server' });
    xhr.onabort = () => reject({ code: 'cancelled', message: 'upload cancelled' });

    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}
