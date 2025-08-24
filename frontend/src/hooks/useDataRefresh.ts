import { useState, useEffect, useCallback } from 'react';
import { dataRefreshApi } from '../services/api';

interface DataRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshCount: number;
  error: string | null;
}

interface UseDataRefreshReturn {
  // State
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshCount: number;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  refreshDataSilently: () => Promise<void>;
  
  // Status
  canRefresh: boolean;
  timeSinceLastRefresh: string;
}

export const useDataRefresh = (autoRefreshOnMount: boolean = true): UseDataRefreshReturn => {
  const [state, setState] = useState<DataRefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    refreshCount: 0,
    error: null
  });

  // Auto-refresh on component mount
  useEffect(() => {
    if (autoRefreshOnMount) {
      refreshDataSilently();
    }
  }, [autoRefreshOnMount]);

  // Calculate if we can refresh (prevent spam)
  const canRefresh = !state.isRefreshing && 
    (!state.lastRefresh || Date.now() - state.lastRefresh.getTime() > 10000); // 10 second cooldown

  // Calculate time since last refresh
  const timeSinceLastRefresh = state.lastRefresh 
    ? formatTimeSince(state.lastRefresh)
    : 'Never';

  // Silent refresh (no loading state, used for auto-refresh)
  const refreshDataSilently = useCallback(async () => {
    if (!canRefresh) return;
    
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Trigger data refresh
      await dataRefreshApi.triggerDataRefresh();
      
      // Update state
      setState(prev => ({
        ...prev,
        lastRefresh: new Date(),
        refreshCount: prev.refreshCount + 1,
        error: null
      }));
      
      console.log('🔄 Data refreshed silently');
      
    } catch (error) {
      console.error('❌ Silent data refresh failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [canRefresh]);

  // Manual refresh with loading state
  const refreshData = useCallback(async () => {
    if (!canRefresh) return;
    
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      
      // Trigger data refresh
      await dataRefreshApi.triggerDataRefresh();
      
      // Update state
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: new Date(),
        refreshCount: prev.refreshCount + 1,
        error: null
      }));
      
      console.log('🔄 Data refreshed successfully');
      
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [canRefresh]);

  return {
    // State
    isRefreshing: state.isRefreshing,
    lastRefresh: state.lastRefresh,
    refreshCount: state.refreshCount,
    error: state.error,
    
    // Actions
    refreshData,
    refreshDataSilently,
    
    // Status
    canRefresh,
    timeSinceLastRefresh
  };
};

// Helper function to format time since last refresh
const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};
