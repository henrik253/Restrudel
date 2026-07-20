// index.mjs — transcriber factory. Every adapter implements:
//   { name, async transcribe(wavBuffer, {onProgress, signal}) -> TranscriptionResult }
import { createLocalTranscriber } from './local.mjs';
import { createMockTranscriber } from './mock.mjs';
import { createRunpodTranscriber } from './runpod.mjs';

export function createTranscriber(config) {
  switch (config.transcriber) {
    case 'mock':
      return createMockTranscriber({ delayMs: config.mockDelayMs });
    case 'local':
      return createLocalTranscriber(config);
    case 'runpod':
      return createRunpodTranscriber(config);
    default:
      throw new Error(`unknown TRANSCRIBER "${config.transcriber}" (mock | local | runpod)`);
  }
}
