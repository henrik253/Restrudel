// jobs.mjs — the job orchestrator. Jobs live in memory (single server, low
// traffic; clients still hold the audio, so lost jobs are cheap to recreate)
// and survive socket drops — sockets subscribe/unsubscribe, the pipeline runs
// regardless. Transcription runs through a concurrency-1 queue because the
// local adapter is CPU-heavy; queued jobs honestly report `queued`.
//
// Lifecycle: queued -> transcribing -> generating -> done | error.
// regenerate() re-runs ONLY the LLM stage against the cached events (never
// re-transcribes) and bumps `revision`.
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { generateCode, normalizeMode } from './codegen/index.mjs';
import { cutToWav } from './lib/audio.mjs';
import { estimateBpm } from './lib/tempo.mjs';

const TERMINAL = new Set(['done', 'error']);

export class JobManager extends EventEmitter {
  #queue = Promise.resolve();

  constructor({ config, transcriber, llm, uploads, log }) {
    super();
    this.config = config;
    this.transcriber = transcriber;
    this.llm = llm;
    this.uploads = uploads;
    this.log = log;
    this.jobs = new Map();
    this.sweeper = setInterval(() => this.#sweep(), 60_000);
    this.sweeper.unref?.();
  }

  get activeCount() {
    return [...this.jobs.values()].filter((j) => !TERMINAL.has(j.status)).length;
  }

  get(jobId) {
    return this.jobs.get(jobId);
  }

  /**
   * Either `wavBuffer` (already-cut 16 kHz mono WAV) or `source`
   * ({uploadId, startSec, endSec}) — with a source, the snippet is cut here
   * (A8), so re-selecting the same track costs no upload.
   */
  createJob({ wavBuffer, source, prompt, bpmHint, snippet, codegen }) {
    const job = {
      id: randomUUID(),
      revision: 1,
      status: 'queued',
      message: null,
      createdAt: Date.now(),
      finishedAt: null,
      prompt: prompt ?? '',
      codegen: normalizeMode(codegen ?? this.config.defaultCodegen),
      bpmHint: bpmHint ?? null,
      snippet: snippet ?? null,
      events: null,
      tempoBpm: null,
      timings: {},
      result: null,
      error: null,
      abort: new AbortController(),
    };
    job.source = source ?? null;
    this.jobs.set(job.id, job);
    // start on the next tick so the caller can subscribe before `queued` fires
    setImmediate(() => this.#run(job, wavBuffer).catch((e) => this.#fail(job, e)));
    return job;
  }

  regenerate(jobId, { prompt, bpmOverride, codegen } = {}) {
    const job = this.jobs.get(jobId);
    if (!job) throw Object.assign(new Error('job not found (it may have expired)'), { code: 'job_not_found' });
    if (!TERMINAL.has(job.status)) throw Object.assign(new Error('job is still running'), { code: 'job_busy' });
    if (!job.events?.length) {
      throw Object.assign(new Error('no cached transcription for this job — convert again'), { code: 'job_not_found' });
    }
    job.revision += 1;
    if (prompt !== undefined) job.prompt = prompt;
    // Switching codegen mode re-runs only this stage against cached events —
    // comparing the three paths costs no GPU time.
    if (codegen !== undefined) job.codegen = normalizeMode(codegen);
    if (Number.isFinite(bpmOverride) && bpmOverride >= 40 && bpmOverride <= 260) job.tempoBpm = Math.round(bpmOverride);
    job.error = null;
    job.finishedAt = null;
    job.abort = new AbortController();
    setImmediate(() => this.#generate(job).catch((e) => this.#fail(job, e)));
    return job;
  }

  cancel(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || TERMINAL.has(job.status)) return;
    job.abort.abort();
    this.#fail(job, Object.assign(new Error('cancelled'), { code: 'cancelled' }));
  }

  async #run(job, wavBuffer) {
    if (!wavBuffer) wavBuffer = await this.#cutSnippet(job);
    this.#update(job, 'queued', 'waiting for a free slot …');
    await this.#enqueue(async () => {
      if (job.abort.signal.aborted) return;
      this.#update(job, 'transcribing', 'transcribing the snippet …');
      const t0 = Date.now();
      const res = await this.transcriber.transcribe(wavBuffer, {
        signal: job.abort.signal,
        onProgress: (message, progress) => this.#update(job, 'transcribing', message, { progress }),
      });
      job.timings.transcribeMs = Date.now() - t0;
      job.events = res.events;
      job.tempoBpm =
        res.tempoBpm ?? estimateBpm(res.events ?? []) ?? job.bpmHint ?? 120;
      job.transcriberMeta = res.meta;
    });
    if (TERMINAL.has(job.status)) return; // cancelled while queued/transcribing
    if (!job.events?.length) {
      throw Object.assign(
        new Error('nothing transcribable in this selection — try a clearer or longer snippet'),
        { code: 'transcriber_failed' },
      );
    }
    await this.#generate(job);
  }

  async #generate(job) {
    this.#update(job, 'generating', 'writing Strudel code …');
    const t0 = Date.now();
    const g = await generateCode({
      mode: job.codegen,
      events: job.events,
      tempoBpm: job.tempoBpm,
      userPrompt: job.prompt,
      config: this.config,
      llm: this.llm,
      signal: job.abort.signal,
      onProgress: (message, extra) => this.#update(job, 'generating', message, extra),
    });
    job.timings.generateMs = Date.now() - t0;
    job.result = {
      code: g.code,
      // What actually ran — may differ from job.codegen when polish fell back.
      codegen: g.mode,
      tempoBpm: g.tempoBpm ?? job.tempoBpm,
      events: job.events,
      describeText: g.describeText,
      attempts: g.attempts,
      llm: g.llm,
      meta: g.meta,
      timings: { ...job.timings },
    };
    job.status = 'done';
    job.message = null;
    job.finishedAt = Date.now();
    this.emit('update', job, {});
    this.log?.info(
      `job ${job.id} r${job.revision} done via ${g.mode} (${job.timings.generateMs} ms)`
      + (g.meta?.polishSkipped ? ` — polish skipped: ${g.meta.polishSkipped}` : ''),
    );
  }

  /** Cut the selected interval out of an uploaded track (A8). */
  async #cutSnippet(job) {
    const { uploadId, startSec, endSec } = job.source ?? {};
    const upload = this.uploads?.get(uploadId);
    if (!upload) {
      throw Object.assign(
        new Error('that upload has expired — pick the file again'),
        { code: 'upload_not_found' },
      );
    }
    this.#update(job, 'cutting', 'cutting the selected snippet …');
    const t0 = Date.now();
    const wav = await cutToWav(upload.path, startSec, endSec, {
      ffmpegBin: this.config.uploads.ffmpegBin,
      signal: job.abort.signal,
    });
    job.timings.cutMs = Date.now() - t0;
    return wav;
  }

  #update(job, status, message, extra = {}) {
    if (TERMINAL.has(job.status)) return; // never resurrect a cancelled/failed job
    job.status = status;
    job.message = message ?? null;
    this.emit('update', job, { message, ...extra });
  }

  #fail(job, e) {
    if (TERMINAL.has(job.status)) return;
    job.status = 'error';
    job.error = { code: e?.code ?? 'internal', message: String(e?.message ?? e) };
    job.finishedAt = Date.now();
    this.emit('update', job, {});
    if (job.error.code !== 'cancelled') this.log?.warn(`job ${job.id} failed [${job.error.code}]: ${job.error.message}`);
  }

  #enqueue(fn) {
    const run = this.#queue.then(fn);
    this.#queue = run.catch(() => {});
    return run;
  }

  #sweep() {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (job.finishedAt && now - job.finishedAt > this.config.jobTtlMs) this.jobs.delete(id);
    }
  }

  close() {
    clearInterval(this.sweeper);
    for (const job of this.jobs.values()) if (!TERMINAL.has(job.status)) job.abort.abort();
  }
}
