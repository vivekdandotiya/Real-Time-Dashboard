'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

  const [isGuideDismissed, setIsGuideDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const lastErrorIdRef = React.useRef<string | null>(null);

  // Dynamic chime builder using Web Audio API
  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

  // Load saved websites on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWebsites = localStorage.getItem('dash_added_websites');
      if (savedWebsites) {
        try {
          const parsed = JSON.parse(savedWebsites);
          if (Array.isArray(parsed)) {
            setWebsites(['mock', ...parsed.filter((w) => w !== 'mock')]);
          }
        } catch (e) {
          console.error('Failed to parse saved websites', e);
        }
      }
      const savedSelected = localStorage.getItem('dash_selected_website');
      if (savedSelected) {
        setSelectedWebsite(savedSelected);
      }
      const savedMuted = localStorage.getItem('dash_muted') === 'true';
      setIsMuted(savedMuted);
    }
  }, []);

  const { events, isLoading, isPaused, togglePause, clearEvents } = useObservabilityData(selectedWebsite);

  // Monitor incoming logs to trigger chime on new critical errors
  useEffect(() => {
    const errorLogs = events.filter((e) => e.level === 'ERROR');
    if (errorLogs.length > 0) {
      const newestError = errorLogs[0]; // newest is first in the array
      if (lastErrorIdRef.current && newestError.id !== lastErrorIdRef.current && !isMuted) {
        playChime();
      }
      lastErrorIdRef.current = newestError.id;
    } else {
      lastErrorIdRef.current = null;
    }
  }, [events, isMuted]);
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

  // Sync isGuideDismissed state whenever selectedWebsite changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedWebsite !== 'mock') {
      const dismissed = localStorage.getItem(`dash_guide_dismissed_${selectedWebsite}`) === 'true';
      setIsGuideDismissed(dismissed);
    } else {
      setIsGuideDismissed(false);
    }
  }, [selectedWebsite]);

  const metrics = useMemo(() => getMetrics(events), [events]);
  const filteredMetrics = useMemo(() => getMetrics(filteredEvents), [filteredEvents]);

  const handleAddWebsite = () => {
    const cleanId = newWebsiteId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    if (cleanId && !websites.includes(cleanId)) {
      const updatedWebsites = [...websites, cleanId];
      setWebsites(updatedWebsites);
      setSelectedWebsite(cleanId);

      // Save custom websites list to localStorage
      if (typeof window !== 'undefined') {
        const customOnly = updatedWebsites.filter((w) => w !== 'mock');
        localStorage.setItem('dash_added_websites', JSON.stringify(customOnly));
        localStorage.setItem('dash_selected_website', cleanId);
      }

      setNewWebsiteId('');
      setIsAddingWebsite(false);
    }
  };

  const handleDismissGuide = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dash_guide_dismissed_${selectedWebsite}`, 'true');
      setIsGuideDismissed(true);
    }
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dash_muted', String(newMute));
    }
  };

  const handleExportLogs = () => {
    if (filteredEvents.length === 0) return;
    try {
      const headers = ['ID', 'Timestamp', 'Level', 'Service', 'Message', 'Metadata'];
      const rows = filteredEvents.map((e) => [
        e.id,
        e.timestamp instanceof Date ? e.timestamp.toISOString() : new Date(e.timestamp).toISOString(),
        e.level,
        e.service,
        e.message.replace(/"/g, '""'),
        e.details ? JSON.stringify(e.details).replace(/"/g, '""') : '',
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_${selectedWebsite}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export CSV:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Observability
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
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
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('dash_selected_website', e.target.value);
                  }
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
            <button
              onClick={toggleMute}
              className="rounded-md border border-border bg-card p-2 transition-colors hover:bg-muted text-accent"
              aria-label={isMuted ? 'Unmute error alerts' : 'Mute error alerts'}
              title={isMuted ? 'Unmute error alerts' : 'Mute error alerts'}
            >
              {isMuted ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                </svg>
              )}
            </button>
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
        <div className="mb-6 rounded-xl border border-border bg-card px-4 py-3 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] dark:shadow-[6px_6px_5px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 text-sm font-semibold">
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

        {/* Integration instructions inline when custom website is active AND not yet dismissed */}
        {selectedWebsite !== 'mock' && !isGuideDismissed && (
          <div className="mb-8">
            <IntegrationGuide websiteId={selectedWebsite} onDone={handleDismissGuide} />
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
          onExportLogs={handleExportLogs}
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

      {/* Floating Corner Script Button */}
      {selectedWebsite !== 'mock' && isGuideDismissed && (
        <button
          onClick={() => setShowGuideModal(true)}
          className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none"
          title="View setup script"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
      )}

      {/* Integration Guide Modal */}
      {showGuideModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGuideModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-2">
                <IntegrationGuide websiteId={selectedWebsite} />
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="mt-6 w-full rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:bg-accent/90"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

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
