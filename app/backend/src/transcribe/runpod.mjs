// runpod.mjs — RunPod Serverless GPU worker adapter (roadmap A1). STUB: the
// interface is fixed here so wiring the real endpoint later changes nothing
// user-facing; until then it reports transcriber_unavailable.
//
// Contract (docs/application_architecture.md):
//   run input:  { audio_b64: "<16 kHz mono WAV>", model_version: "strudel50-20260713" }
//   run output: { events: [{onset_s, offset_s, pitch, velocity, program, is_drum}],
//                 tempo_bpm, beats_s, downbeats_s, model_version, timings }
// Normalization to the canonical NoteEvent schema:
//   onset=onset_s, duration=offset_s-onset_s, channel=is_drum?'drums':'pitched'.

export function createRunpodTranscriber(config) {
  return {
    name: 'runpod',
    async transcribe() {
      if (!config.runpod.apiKey || !config.runpod.endpointId) {
        throw Object.assign(
          new Error('RunPod transcriber is not configured (RUNPOD_API_KEY / RUNPOD_ENDPOINT_ID)'),
          { code: 'transcriber_unavailable' },
        );
      }
      throw Object.assign(
        new Error('RunPod adapter is not implemented yet (roadmap A1)'),
        { code: 'transcriber_unavailable' },
      );
    },
  };
}
