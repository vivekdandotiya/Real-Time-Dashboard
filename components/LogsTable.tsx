'use client';

import React from 'react';
import { LogEvent } from '@/lib/types';

interface LogsTableProps {
  events: LogEvent[];
  isLoading: boolean;
  onErrorClick: (event: LogEvent) => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'INFO':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'WARN':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'ERROR':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const LogsTable = React.memo(function LogsTable({
  events,
  isLoading,
  onErrorClick,
}: LogsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border">
        <svg
          className="mb-3 h-10 w-10 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-muted-foreground text-sm">No events to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr
                key={event.id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getLevelColor(event.level)}`}>
                    {event.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                  {event.service}
                </td>
                <td className="px-4 py-3 text-sm text-foreground max-w-md truncate">
                  {event.message}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                  {event.timestamp.toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {event.level === 'ERROR' && (
                    <button
                      onClick={() => onErrorClick(event)}
                      className="rounded px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
