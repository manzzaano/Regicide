declare module 'sockjs-client' {
  export default class SockJS extends EventTarget {
    constructor(url: string, protocols?: string | string[], options?: any);
    send(data: string): void;
    close(code?: number, reason?: string): void;
    readyState: number;
    onopen: ((this: SockJS, ev: Event) => any) | null;
    onmessage: ((this: SockJS, ev: MessageEvent) => any) | null;
    onerror: ((this: SockJS, ev: Event) => any) | null;
    onclose: ((this: SockJS, ev: CloseEvent) => any) | null;
  }
}
