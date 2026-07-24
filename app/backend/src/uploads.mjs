// uploads.mjs — the uploaded songs a session can cut snippets from (A8).
//
// The full track is uploaded once, on file select; every selection afterwards
// is just {start, end} against a stored file. Files live on disk (they are
// far too big to hold in memory across a session) under a directory this
// process owns, and are swept on a TTL.
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { probeAudio } from './lib/audio.mjs';

export class UploadStore {
  #dir;
  #entries = new Map();

  constructor({ config, log }) {
    this.config = config;
    this.log = log;
    this.#dir = config.uploads.dir ?? join(tmpdir(), 'restrudel-uploads');
    this.sweeper = setInterval(() => this.sweep(), 5 * 60_000);
    this.sweeper.unref?.();
  }

  get count() {
    return this.#entries.size;
  }

  /**
   * Persist an uploaded track and probe it.
   * @throws {{code: 'payload_too_large'|'unsupported_media'}}
   */
  async save(buffer, { filename } = {}) {
    if (buffer.length > this.config.uploads.maxBytes) {
      throw Object.assign(
        new Error(`upload exceeds ${Math.round(this.config.uploads.maxBytes / 1e6)} MB`),
        { code: 'payload_too_large' },
      );
    }
    await mkdir(this.#dir, { recursive: true });
    const id = randomUUID();
    // Keep the extension: ffmpeg sniffs content, but a sane name helps logs.
    const ext = (filename?.match(/\.[a-z0-9]{1,5}$/i)?.[0] ?? '').toLowerCase();
    const path = join(this.#dir, `${id}${ext}`);
    await writeFile(path, buffer);

    let probe;
    try {
      probe = await probeAudio(path, { ffprobeBin: this.config.uploads.ffprobeBin });
    } catch (e) {
      await rm(path, { force: true }); // don't keep bytes we cannot use
      throw e;
    }

    const entry = {
      id,
      path,
      filename: filename ?? null,
      bytes: buffer.length,
      durationSec: probe.durationSec,
      probe,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };
    this.#entries.set(id, entry);
    this.log?.info(`upload ${id} stored (${(buffer.length / 1e6).toFixed(1)} MB, ${probe.durationSec.toFixed(1)} s, ${probe.codec})`);
    return entry;
  }

  get(id) {
    const entry = this.#entries.get(id);
    if (entry) entry.lastUsedAt = Date.now();
    return entry ?? null;
  }

  async delete(id) {
    const entry = this.#entries.get(id);
    if (!entry) return;
    this.#entries.delete(id);
    await rm(entry.path, { force: true });
  }

  /** Drop uploads untouched for longer than the TTL. */
  sweep() {
    const now = Date.now();
    for (const [id, entry] of this.#entries) {
      if (now - entry.lastUsedAt > this.config.uploads.ttlMs) {
        this.#entries.delete(id);
        rm(entry.path, { force: true }).catch(() => {});
        this.log?.info(`upload ${id} expired`);
      }
    }
  }

  /** Remove everything — on shutdown, so a restart leaves no orphans. */
  async close() {
    clearInterval(this.sweeper);
    // Use the stored paths: a file is `<id><ext>`, not `<id>`.
    const paths = [...this.#entries.values()].map((e) => e.path);
    this.#entries.clear();
    await Promise.all(paths.map((p) => rm(p, { force: true }).catch(() => {})));
    await rm(this.#dir, { recursive: true, force: true }).catch(() => {});
  }
}
