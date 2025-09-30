(function loadMermaid() {
  const CDN_URL = 'https://unpkg.com/mermaid@10.4.0/dist/mermaid.min.js';

  window.__mermaidInitArgs = window.__mermaidInitArgs || null;

  const placeholderInitialize = function storeMermaidConfig(config) {
    window.__mermaidInitArgs = config;
  };

  window.mermaid = window.mermaid || {};
  window.mermaid.initialize = placeholderInitialize;

  const script = document.createElement('script');
  script.src = CDN_URL;
  script.onload = function onMermaidLoaded() {
    try {
      const config = window.__mermaidInitArgs || { startOnLoad: true };
      if (typeof window.mermaid.initialize === 'function') {
        // If the placeholder is still set, the library may export initialize differently
        if (window.mermaid.initialize === placeholderInitialize && typeof window.mermaid.mermaidAPI === 'object') {
          // Older mermaid builds expose init via mermaidAPI
          window.mermaid.initialize = window.mermaid.mermaidAPI.initialize.bind(window.mermaid.mermaidAPI);
        }
        window.mermaid.initialize(config);
      }
      if (typeof window.mermaid.run === 'function') {
        window.mermaid.run();
      }
    } catch (error) {
      console.error('Mermaid initialization failed:', error);
    }
  };
  script.onerror = function onMermaidError(event) {
    console.error('Failed to load Mermaid library from CDN:', CDN_URL, event);
  };

  document.head.appendChild(script);
})();
