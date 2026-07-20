// client.mjs — LLM completion with three sources:
//   sdk  — @anthropic-ai/sdk when ANTHROPIC_API_KEY is set
//   cli  — `claude -p --model <m>` headless fallback (prompt via stdin)
//   fake — canned code, no network (LLM_PROVIDER=fake; hermetic tests)
import { runCommand } from '../lib/subprocess.mjs';

// Canned pattern matching the mock transcriber's density (14 onsets/cycle).
const FAKE_CODE = `stack(
  s("bd bd bd bd").bank("RolandTR909"),
  s("~ sd ~ sd").bank("RolandTR909"),
  s("~ hh ~ hh ~ hh ~ hh").bank("RolandTR909"),
  note("a1 c2 e2 g2").s("sawtooth").lpf(800).release(.1)
)`;

export function createLlmClient(config) {
  const { provider, model, apiKey, timeoutMs } = config.llm;

  if (provider === 'fake') {
    return {
      async complete() {
        return { text: '```js\n' + FAKE_CODE + '\n```', model: 'fake', source: 'fake' };
      },
    };
  }

  if (apiKey) {
    let client = null;
    return {
      async complete(system, prompt, { signal } = {}) {
        if (!client) {
          const { default: Anthropic } = await import('@anthropic-ai/sdk');
          client = new Anthropic({ apiKey, timeout: timeoutMs });
        }
        const resp = await client.messages.create(
          {
            model,
            max_tokens: 2000,
            system,
            messages: [{ role: 'user', content: prompt }],
          },
          { signal },
        );
        const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
        return { text, model, source: 'sdk' };
      },
    };
  }

  // Claude Code headless fallback — uses the local login, same model.
  return {
    async complete(system, prompt, { signal } = {}) {
      const { stdout } = await runCommand('claude', ['-p', '--model', model], {
        input: `${system}\n\n${prompt}`,
        timeoutMs,
        signal,
      });
      return { text: stdout, model, source: 'cli' };
    },
  };
}
