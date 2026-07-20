// ws.ts — a small reconnecting WebSocket wrapper. Jobs live on the server, so
// a dropped connection is not fatal: we reconnect with backoff and the app
// re-subscribes to its job via the onReconnect hook.
import type { ServerMsg } from '../protocol';

export type ConnectionState = 'connecting' | 'open' | 'closed';

export class ReconnectingSocket {
  private ws: WebSocket | null = null;
  private backoffMs = 500;
  private closed = false;
  private hasConnectedOnce = false;
  private reconnectTimer: number | undefined;

  onMessage: (msg: ServerMsg) => void = () => {};
  onState: (state: ConnectionState) => void = () => {};
  /** Called on every re-established connection (not the first). */
  onReconnect: () => void = () => {};

  constructor(private url: string) {}

  connect() {
    if (this.closed) return;
    this.onState('connecting');
    const ws = new WebSocket(this.url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    ws.onopen = () => {
      const isReconnect = this.hasConnectedOnce;
      this.hasConnectedOnce = true;
      this.backoffMs = 500;
      this.onState('open');
      if (isReconnect) this.onReconnect();
    };
    ws.onmessage = (ev) => {
      if (typeof ev.data !== 'string') return;
      try {
        this.onMessage(JSON.parse(ev.data) as ServerMsg);
      } catch {
        // ignore unparseable frames
      }
    };
    ws.onclose = () => {
      this.ws = null;
      if (this.closed) return;
      this.onState('closed');
      this.reconnectTimer = window.setTimeout(() => this.connect(), this.backoffMs);
      this.backoffMs = Math.min(this.backoffMs * 2, 8000);
    };
    ws.onerror = () => ws.close();
  }

  get isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(msg: object): boolean {
    if (!this.isOpen) return false;
    this.ws!.send(JSON.stringify(msg));
    return true;
  }

  sendBinary(buf: ArrayBuffer): boolean {
    if (!this.isOpen) return false;
    this.ws!.send(buf);
    return true;
  }

  close() {
    this.closed = true;
    window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

export function wsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.host}/ws`;
}
