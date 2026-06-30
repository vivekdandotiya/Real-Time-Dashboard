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
import { IntegrationGuide } from './IntegrationGuide';

export function Dashboard() {
  const [selectedError, setSelectedError] = useState(null);
  const [websites, setWebsites] = useState<string[]>(['mock']);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('mock');
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [newWebsiteId, setNewWebsiteId] = useState('');

  const { events, isLoading, isPaused, togglePause, clearEvents } = useObservabilityData(selectedWebsite);
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

  const handleAddWebsite = () => {
    const cleanId = newWebsiteId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    if (cleanId && !websites.includes(cleanId)) {
      setWebsites((prev) => [...prev, cleanId]);
      setSelectedWebsite(cleanId);
      setNewWebsiteId('');
      setIsAddingWebsite(false);
    }
  };

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
          <div className="flex items-center gap-3">
            {/* Website Selector */}
            <select
              value={selectedWebsite}
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') {
                  setIsAddingWebsite(true);
                } else {
                  setSelectedWebsite(e.target.value);
                }
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="mock">Mock Data (Simulated)</option>
              {websites
                .filter((w) => w !== 'mock')
                .map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              <option value="ADD_NEW">+ Add Live Website...</option>
            </select>
            <ThemeToggle />
          </div>
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

        {/* Integration instructions when custom website is active */}
        {selectedWebsite !== 'mock' && (
          <div className="mb-8">
            <IntegrationGuide websiteId={selectedWebsite} />
          </div>
        )}

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

      {/* Add Website Modal */}
      {isAddingWebsite && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddingWebsite(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-foreground">
                Add Live Website to Monitor
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Give your website a unique identifier (e.g.,{' '}
                <code className="bg-muted px-1 py-0.5 rounded">chatting-app</code>
                ).
              </p>
              <input
                type="text"
                placeholder="e.g. chatting-app"
                value={newWebsiteId}
                onChange={(e) => setNewWebsiteId(e.target.value)}
                className="w-full mt-4 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWebsite();
                }}
              />
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setIsAddingWebsite(false)}
                  className="flex-1 rounded-md border border-input bg-background text-foreground px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWebsite}
                  className="flex-1 rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-medium hover:bg-accent/90"
                >
                  Add Website
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
