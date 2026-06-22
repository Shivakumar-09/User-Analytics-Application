/**
 * InsightFlow Analytics SDK
 * A standalone script for tracking user events and sending them to the backend API.
 */
const Analytics = (function () {
  let apiUrl = "";
  let sessionId = "";
  let queue = [];
  const BATCH_SIZE = 5;
  const FLUSH_INTERVAL = 3000; // 3 seconds
  let flushTimer = null;

  /**
   * Generates a unique UUIDv4 for session identification.
   */
  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  /**
   * Retrieves or generates a session ID, storing it in localStorage.
   */
  function initSession() {
    sessionId = localStorage.getItem("insightflow_session");
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem("insightflow_session", sessionId);
    }
    return sessionId;
  }

  /**
   * Loads previously queued (offline/failed) events from localStorage.
   */
  function loadOfflineQueue() {
    try {
      const stored = localStorage.getItem("insightflow_offline_queue");
      if (stored) {
        queue = JSON.parse(stored);
      }
    } catch (e) {
      queue = [];
    }
  }

  /**
   * Saves current queue to localStorage for offline persistence.
   */
  function saveOfflineQueue() {
    try {
      localStorage.setItem("insightflow_offline_queue", JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to save offline queue", e);
    }
  }

  /**
   * Sends the current queue to the backend API.
   * Handles success and failure (retry mechanism).
   */
  async function flushEvents() {
    if (queue.length === 0) return;

    // Snapshot the events to send
    const eventsToSend = [...queue];
    queue = [];
    saveOfflineQueue();

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventsToSend),
      });

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      console.log(`[Analytics] Successfully sent ${eventsToSend.length} events.`);
    } catch (error) {
      console.warn("[Analytics] Failed to send events, requeuing...", error.message);
      // Re-queue the failed events at the beginning of the queue
      queue = [...eventsToSend, ...queue];
      saveOfflineQueue();
    }
  }

  /**
   * Internal method to enqueue a new event payload.
   */
  function pushEvent(payload) {
    queue.push(payload);
    saveOfflineQueue();
    console.log(`[Analytics] Tracked event: ${payload.eventType}`);

    // Flush immediately if we hit the batch size
    if (queue.length >= BATCH_SIZE) {
      flushEvents();
    }
  }

  /**
   * Tracks a generic event payload.
   */
  function track(eventType, extraData = {}) {
    const event = {
      sessionId: sessionId,
      eventType: eventType,
      pageUrl: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      ...extraData,
    };
    pushEvent(event);
  }

  /**
   * Automatically sets up tracking for clicks globally.
   */
  function setupAutoTracking() {
    document.addEventListener(
      "click",
      (e) => {
        // Only track meaningful clicks (e.g., buttons, links) to avoid noise,
        // or track everything if full heatmap is desired.
        track("click", {
          coordinates: {
            x: e.clientX,
            y: e.clientY,
          },
        });
      },
      { capture: true, passive: true }
    );
  }

  return {
    /**
     * Initializes the SDK.
     * @param {Object} config - Configuration object containing apiUrl.
     */
    init: function (config) {
      if (!config || !config.apiUrl) {
        console.error("Analytics.init requires an apiUrl");
        return;
      }
      apiUrl = config.apiUrl;

      // 1. Initialize session and load any pending offline events
      initSession();
      loadOfflineQueue();

      // 2. Setup periodic flush interval
      flushTimer = setInterval(() => {
        flushEvents();
      }, FLUSH_INTERVAL);

      // 3. Flush queue immediately on page exit
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          flushEvents();
        }
      });

      // 4. Track initial page view automatically
      track("page_view");

      // 5. Hook up automatic click tracking
      setupAutoTracking();

      console.log(`[Analytics] Initialized. Session ID: ${sessionId}`);
    },

    /**
     * Expose manual tracking method if needed.
     */
    track: track,
  };
})();
