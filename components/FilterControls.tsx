'use client';

import React from 'react';
import { LogLevel } from '@/lib/types';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLevel: LogLevel | 'ALL';
  onLevelChange: (level: LogLevel | 'ALL') => void;
  selectedService: string;
  onServiceChange: (service: string) => void;
  uniqueServices: string[];
  isPaused: boolean;
  onTogglePause: () => void;
  onClearEvents: () => void;
  onExportLogs?: () => void;
}

export const FilterControls = React.memo(function FilterControls({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedService,
  onServiceChange,
  uniqueServices,
  isPaused,
  onTogglePause,
  onClearEvents,
  onExportLogs,
}: FilterControlsProps) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value as LogLevel | 'ALL')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Critical</option>
          </select>
        </div>

        {/* Service Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {uniqueServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-end">
          <button
            onClick={onTogglePause}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              isPaused
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'border border-input bg-background text-foreground hover:bg-muted'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          {onExportLogs && (
            <button
              onClick={onExportLogs}
              className="flex-1 rounded-md border border-input bg-background text-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              Export
            </button>
          )}
          <button
            onClick={onClearEvents}
            className="flex-1 rounded-md border border-destructive bg-background text-destructive px-3 py-2 text-xs font-medium transition-colors hover:bg-destructive/5"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
});
