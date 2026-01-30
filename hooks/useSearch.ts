'use client';

import { useState, useCallback, useMemo } from 'react';
import { LogEvent, LogLevel } from '@/lib/types';

export function useSearch(events: LogEvent[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.includes(searchQuery);

      const matchesLevel = selectedLevel === 'ALL' || event.level === selectedLevel;
      const matchesService = selectedService === 'ALL' || event.service === selectedService;

      return matchesSearch && matchesLevel && matchesService;
    });
  }, [events, searchQuery, selectedLevel, selectedService]);

  const uniqueServices = useMemo(() => {
    return ['ALL', ...new Set(events.map((e) => e.service))];
  }, [events]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLevelChange = useCallback((level: LogLevel | 'ALL') => {
    setSelectedLevel(level);
  }, []);

  const handleServiceChange = useCallback((service: string) => {
    setSelectedService(service);
  }, []);

  return {
    searchQuery,
    selectedLevel,
    selectedService,
    filteredEvents,
    uniqueServices,
    handleSearchChange,
    handleLevelChange,
    handleServiceChange,
  };
}
