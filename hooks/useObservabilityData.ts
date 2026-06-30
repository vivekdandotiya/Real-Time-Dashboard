'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEvent } from '@/lib/types';
import { generateMockEvents } from '@/lib/mockAPI';

export function useObservabilityData(selectedWebsiteId: string = 'mock') {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch from custom backend API
  const fetchRealLogs = useCallback(async (siteId: string) => {
    try {
      const res = await fetch(`/api/logs?websiteId=${encodeURIComponent(siteId)}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setEvents(formatted);
      }
    } catch (error) {
      console.error('Error fetching real-time logs:', error);
    }
  }, []);

  // Initialize and poll data
  useEffect(() => {
    setIsLoading(true);
    setEvents([]);

    if (selectedWebsiteId === 'mock') {
      const initialEvents = generateMockEvents(50);
      setEvents(initialEvents);
      setIsLoading(false);
    } else {
      fetchRealLogs(selectedWebsiteId).finally(() => {
        setIsLoading(false);
      });
    }
  }, [selectedWebsiteId, fetchRealLogs]);

  // Set up polling for new events
  useEffect(() => {
    const pollData = () => {
      if (isPaused) return;

      if (selectedWebsiteId === 'mock') {
        const newEvents = generateMockEvents(3);
        setEvents((prev) => [
          ...newEvents,
          ...prev.slice(0, 499), // Keep max 500 events
        ]);
      } else {
        fetchRealLogs(selectedWebsiteId);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollData, 2000);
    return () => clearInterval(interval);
  }, [selectedWebsiteId, isPaused, fetchRealLogs]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const clearEvents = useCallback(async () => {
    if (selectedWebsiteId === 'mock') {
      setEvents([]);
    } else {
      try {
        await fetch(`/api/logs?websiteId=${encodeURIComponent(selectedWebsiteId)}`, {
          method: 'DELETE',
        });
        setEvents([]);
      } catch (error) {
        console.error('Error clearing remote logs:', error);
      }
    }
  }, [selectedWebsiteId]);

  return {
    events,
    isLoading,
    isPaused,
    togglePause,
    clearEvents,
  };
}
