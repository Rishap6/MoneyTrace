import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export const useInvestigations = (params?: any) => {
  return useQuery({
    queryKey: ['investigations-list', params],
    queryFn: async () => {
      const res = await api.get<any>('/investigation', { params });
      return res.data;
    },
  });
};

export const useInvestigationDetail = (caseId: string | null) => {
  return useQuery({
    queryKey: ['investigation-detail', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const res = await api.get<any>(`/investigation/${caseId}`);
      return res.data;
    },
    enabled: !!caseId,
  });
};

export const useInvestigationFilters = () => {
  const [filters, setFilters] = useState<any>({
    status: '',
    priority: '',
    search: '',
    page: 1,
  });

  const clearFilters = () => setFilters({ status: '', priority: '', search: '', page: 1 });

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters: Boolean(filters.status || filters.priority || filters.search),
  };
};
