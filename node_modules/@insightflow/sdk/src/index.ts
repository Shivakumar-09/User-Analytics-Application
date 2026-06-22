interface InsightFlowConfig {
  apiKey: string;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

interface EventData {
  eventType: string;
  pageUrl: string;
  timestamp: Date;
  metadata?: any;
  clickData?: { x: number; y: number };
  sessionId?: string;
}

class InsightFlowSDK {
  private apiKey: string = '';
  private endpoint: string = 'http://localhost:5000/api/events'; // default
  private sessionId: string = '';
  private queue: EventData[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 5000;
  private intervalId: any;

  init(config: InsightFlowConfig) {
    this.apiKey = config.apiKey;
    if (config.endpoint) this.endpoint = config.endpoint;
    if (config.batchSize) this.batchSize = config.batchSize;
    if (config.flushInterval) this.flushInterval = config.flushInterval;

    this.sessionId = this.getOrSetSessionId();
    this.loadQueue();

    // Auto Tracking
    this.trackPageView();
    this.setupAutoTracking();

    // Setup periodic flush
    this.intervalId = setInterval(() => this.flush(), this.flushInterval);

    // Flush on page leave
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
  }

  private getOrSetSessionId(): string {
    let id = localStorage.getItem('insightflow_session');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('insightflow_session', id);
    }
    return id;
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem('insightflow_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      this.queue = [];
    }
  }

  private saveQueue() {
    localStorage.setItem('insightflow_queue', JSON.stringify(this.queue));
  }

  track(eventType: string, extraData?: any) {
    const event: EventData = {
      eventType,
      pageUrl: window.location.href,
      timestamp: new Date(),
      sessionId: this.sessionId,
      metadata: {
        browser: this.getBrowser(),
        os: this.getOS(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        device: this.getDevice()
      },
      ...extraData
    };

    this.queue.push(event);
    this.saveQueue();

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush(useBeacon = false) {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];
    this.saveQueue();

    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventsToSend)], { type: 'application/json' });
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify(eventsToSend),
        });
        if (!res.ok) {
          throw new Error('Failed to send events');
        }
      }
    } catch (error) {
      // Offline or failed, re-queue
      this.queue = [...eventsToSend, ...this.queue];
      this.saveQueue();
    }
  }

  private trackPageView() {
    this.track('page_view');
  }

  private setupAutoTracking() {
    // Click tracking
    document.addEventListener('click', (e) => {
      this.track('click', {
        clickData: { x: e.clientX, y: e.clientY }
      });
    }, { capture: true, passive: true });

    // History API tracking for SPAs
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        this.trackPageView();
      }
    });
    observer.observe(document, { subtree: true, childList: true });
  }

  // Basic Utility to get OS, Browser, etc
  private getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDevice() {
    return window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
  }
}

// Global instance
export const InsightFlow = new InsightFlowSDK();

// Export type
export default InsightFlow;
