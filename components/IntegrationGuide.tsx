'use client';

import React, { useState, useEffect } from 'react';

interface IntegrationGuideProps {
  websiteId: string;
}

export function IntegrationGuide({ websiteId }: IntegrationGuideProps) {
  const [origin, setOrigin] = useState('http://localhost:3000');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const scriptCode = `<script>
  (function() {
    const WEBSITE_ID = '${websiteId}';
    const DASHBOARD_URL = '${origin}';
    
    function sendEvent(level, message, details = {}) {
      fetch(DASHBOARD_URL + '/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          level: level,
          service: 'Client Browser',
          message: message,
          details: details
        })
      }).catch(err => console.warn('Failed to send log to dashboard:', err));
    }

    // 1. Capture uncaught errors
    window.addEventListener('error', function(event) {
      sendEvent('ERROR', 'Uncaught Error: ' + event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });

    // 2. Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      sendEvent('ERROR', 'Unhandled Promise Rejection: ' + event.reason, {
        reason: String(event.reason)
      });
    });

    // 3. Expose global logger for custom events
    window.dashLogger = {
      info: (msg, details) => sendEvent('INFO', msg, details),
      warn: (msg, details) => sendEvent('WARN', msg, details),
      error: (msg, details) => sendEvent('ERROR', msg, details)
    };
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-border bg-card p-5 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Connect your Live Website ({websiteId})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Copy and paste this script tag into the <code className="bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> of your website.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent/90"
        >
          {copied ? 'Copied!' : 'Copy Script'}
        </button>
      </div>

      <div className="mt-4">
        <pre className="overflow-x-auto rounded bg-muted p-4 text-xs font-mono text-foreground border border-border max-h-60">
          {scriptCode}
        </pre>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Features included:</h4>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li><strong>Auto Error Tracking</strong>: Intercepts all uncaught JavaScript and React runtime errors automatically.</li>
          <li><strong>Promise Rejections</strong>: Captures failed fetch requests and async promise errors.</li>
          <li>
            <strong>Custom Event Logger</strong>: Log specific user actions in your code:
            <code className="block bg-muted p-2 rounded mt-1 text-foreground font-mono text-[10px]">
              window.dashLogger.info("User sent message", &#123; roomId: "Lobby" &#125;)
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}
