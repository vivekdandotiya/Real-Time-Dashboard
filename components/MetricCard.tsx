'use client';

import React from 'react';
import { LogLevel } from '@/lib/types';

interface MetricCardProps {
  label: string;
  value: number;
  level: LogLevel | 'TOTAL';
  isLoading?: boolean;
}

export const MetricCard = React.memo(function MetricCard({
  label,
  value,
  level,
  isLoading = false,
}: MetricCardProps) {
  const getAccentColor = (lvl: LogLevel | 'TOTAL') => {
    switch (lvl) {
      case 'INFO':
        return 'text-chart-2';
      case 'WARN':
        return 'text-chart-4';
      case 'ERROR':
        return 'text-destructive';
      case 'TOTAL':
        return 'text-accent';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] dark:shadow-[6px_6px_5px_rgba(0,0,0,0.45)] transition-all duration-300">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="mt-4 flex items-end gap-2">
        {isLoading ? (
          <div className="h-10 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <span className={`text-5xl font-bold tabular-nums ${getAccentColor(level)}`}>
              {value}
            </span>
          </>
        )}
      </div>
    </div>
  );
});
