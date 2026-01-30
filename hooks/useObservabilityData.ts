'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEvent } from '@/lib/types';
import { generateMockEvents } from '@/lib/mockAPI';

export function useObservabilityData() {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const initialEvents = generateMockEvents(50);
    setEvents(initialEvents);
    setIsLoading(false);
  }, []);

  // Set up polling for new events
  useEffect(() => {
    const pollData = () => {
      if (!isPaused) {
        const newEvents = generateMockEvents(3);
        setEvents((prev) => [
          ...newEvents,
          ...prev.slice(0, 499), // Keep max 500 events
        ]);
      }
    };

    if (!isLoading) {
      intervalRef.current = setInterval(pollData, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, isPaused]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isLoading,
    isPaused,
    togglePause,
    clearEvents,
  };
}
