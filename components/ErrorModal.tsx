'use client';

import React from 'react';
import { LogEvent } from '@/lib/types';

interface ErrorModalProps {
  event: LogEvent | null;
  onClose: () => void;
}

const highlightJSON = (details: any) => {
  if (!details) return null;
  const str = JSON.stringify(details, null, 2);

  return str.split('\n').map((line, i) => {
    const match = line.match(/^(\s*)"([^"]+)":\s*(.*)$/);
    if (match) {
      const indent = match[1];
      const key = match[2];
      const val = match[3];

      let valSpan = <span className="text-foreground">{val}</span>;
      if (val.startsWith('"')) {
        valSpan = <span className="text-green-600 dark:text-green-400">{val}</span>;
      } else if (!isNaN(Number(val.replace(/,$/, '')))) {
        valSpan = <span className="text-amber-600 dark:text-amber-400">{val}</span>;
      } else if (val.startsWith('true') || val.startsWith('false') || val.startsWith('null')) {
        valSpan = <span className="text-blue-600 dark:text-blue-400">{val}</span>;
      }

      return (
        <div key={i} className="leading-5">
          <span>{indent}</span>
          <span className="text-purple-600 dark:text-purple-400">"{key}"</span>: {valSpan}
        </div>
      );
    }
    return (
      <div key={i} className="text-muted-foreground leading-5">
        {line}
      </div>
    );
  });
};

export const ErrorModal = React.memo(function ErrorModal({ event, onClose }: ErrorModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!event) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <h2 className="text-base font-semibold">
                  Error Details
                </h2>
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event ID</p>
                  <p className="font-mono text-foreground mt-1">{event.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="text-foreground mt-1">{event.service}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</p>
                  <p className="text-foreground mt-1">{event.message}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</p>
                  <p className="font-mono text-foreground mt-1">
                    {event.timestamp.toLocaleString()}
                  </p>
                </div>
                {event.details && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
                    <div className="overflow-auto rounded bg-muted p-3 text-xs mt-1 font-mono whitespace-pre border border-border text-left">
                      {highlightJSON(event.details)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/90"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
});
