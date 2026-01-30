'use client';

import React, { useState, useMemo } from 'react';
import { useObservabilityData } from '@/hooks/useObservabilityData';
import { useSearch } from '@/hooks/useSearch';
import { getMetrics } from '@/lib/mockAPI';
import { ThemeToggle } from './ThemeToggle';
import { FilterControls } from './FilterControls';
import { MetricCard } from './MetricCard';
import { LogsTable } from './LogsTable';
import { ErrorModal } from './ErrorModal';

export function Dashboard() {
  const [selectedError, setSelectedError] = useState(null);
  const { events, isLoading, isPaused, togglePause, clearEvents } = useObservabilityData();
  const {
    searchQuery,
    selectedLevel,
    selectedService,
    filteredEvents,
    uniqueServices,
    handleSearchChange,
    handleLevelChange,
    handleServiceChange,
  } = useSearch(events);

  const metrics = useMemo(() => getMetrics(events), [events]);
  const filteredMetrics = useMemo(() => getMetrics(filteredEvents), [filteredEvents]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Observability
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Real-time system monitoring and event analysis
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        {/* Metrics Grid */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Events"
            value={metrics.totalEvents}
            level="TOTAL"
            isLoading={isLoading}
          />
          <MetricCard
            label="Critical"
            value={filteredMetrics.errorCount}
            level="ERROR"
            isLoading={isLoading}
          />
          <MetricCard
            label="Warnings"
            value={filteredMetrics.warningCount}
            level="WARN"
            isLoading={isLoading}
          />
          <MetricCard
            label="Info"
            value={filteredMetrics.infoCount}
            level="INFO"
            isLoading={isLoading}
          />
        </div>

        {/* Live Status Bar */}
        <div className="mb-6 rounded-md border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${isPaused ? 'bg-muted-foreground' : 'animate-pulse bg-accent'}`}
              />
              <span className="font-medium">
                {isPaused ? 'Paused' : 'Live'}
              </span>
            </div>
            <span className="ml-auto text-muted-foreground">
              {filteredEvents.length} of {events.length} events
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          selectedService={selectedService}
          onServiceChange={handleServiceChange}
          uniqueServices={uniqueServices}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onClearEvents={clearEvents}
        />

        {/* Logs Table */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">
            Events
          </h2>
          <LogsTable
            events={filteredEvents}
            isLoading={isLoading}
            onErrorClick={setSelectedError}
          />
        </div>
      </main>

      {/* Error Modal */}
      <ErrorModal event={selectedError} onClose={() => setSelectedError(null)} />
    </div>
  );
}
