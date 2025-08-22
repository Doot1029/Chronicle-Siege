type Callback = (data: any) => void;

class P2PService {
  private channel: BroadcastChannel;
  private listeners: Map<string, Callback[]>;
  private isHost: boolean = false;
  private userId: string | null = null;

  constructor(gameId: string) {
    this.channel = new BroadcastChannel(`chronicle-siege-${gameId}`);
    this.listeners = new Map();
    this.channel.onmessage = this.handleMessage.bind(this);
    console.log(`P2P Service connected to channel: chronicle-siege-${gameId}`);
  }

  public init(userId: string, isHost: boolean) {
    this.userId = userId;
    this.isHost = isHost;
  }

  private handleMessage(event: MessageEvent) {
    const { type, payload, senderId, target } = event.data;
    if (senderId === this.userId) return;

    if (target === 'host' && !this.isHost) {
        return;
    }

    if (this.listeners.has(type)) {
      this.listeners.get(type)?.forEach(callback => callback(payload));
    }
  }

  public on(type: string, callback: Callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  public off(type: string, callback: Callback) {
    if (this.listeners.has(type)) {
        const filteredListeners = this.listeners.get(type)?.filter(cb => cb !== callback);
        this.listeners.set(type, filteredListeners || []);
    }
  }

  public broadcast(type: string, payload: any) {
    this.channel.postMessage({ type, payload, senderId: this.userId });
  }

  public sendToHost(type: string, payload: any) {
    this.channel.postMessage({ type, payload, senderId: this.userId, target: 'host' });
  }

  public close() {
    this.channel.close();
  }
}

export default P2PService;
