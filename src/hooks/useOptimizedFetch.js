import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../lib/axiosInstance';

/**
 * Optimized fetch hook that reduces unnecessary API calls and re-renders
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} options.cacheTime - Cache duration in ms (default: 5 minutes)
 * @param {boolean} options.immediate - Fetch immediately on mount (default: true)
 * @param {Array} options.dependencies - Dependencies for refetch (default: [])
 */
export const useOptimizedFetch = (url, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    immediate = true,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return;

    // Check cache first
    const cacheKey = url;
    const cachedData = cacheRef.current.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < cacheTime) {
      setData(cachedData.data);
      setLoading(false);
      setError(null);
      return cachedData.data;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(url, {
        signal: abortControllerRef.current.signal
      });

      const result = response.data;

      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: now
      });

      // Clean up old cache entries
      setTimeout(() => {
        cacheRef.current.delete(cacheKey);
      }, cacheTime);

      setData(result);
      lastFetchRef.current = now;
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error(`Fetch error for ${url}:`, err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cacheTime]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Clear cache for specific URL
  const clearCache = useCallback(() => {
    cacheRef.current.delete(url);
  }, [url]);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    isStale: lastFetchRef.current && (Date.now() - lastFetchRef.current) > cacheTime
  };
};

/**
 * Hook for paginated data with optimized caching
 */
export const useOptimizedPaginatedFetch = (baseUrl, initialParams = {}) => {
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const url = baseUrl + '?' + new URLSearchParams(params).toString();

  const { data, loading, error, refetch } = useOptimizedFetch(url, {
    dependencies: [JSON.stringify(params)]
  });

  useEffect(() => {
    if (data) {
      if (params.page === 0) {
        // First page - replace all data
        setAllData(data.content || []);
      } else {
        // Subsequent pages - append data
        setAllData(prev => [...prev, ...(data.content || [])]);
      }
      
      setHasMore(!data.last && (data.content?.length > 0));
    }
  }, [data, params.page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setParams(prev => ({ ...prev, page: (prev.page || 0) + 1 }));
    }
  }, [loading, hasMore]);

  const resetData = useCallback(() => {
    setParams(prev => ({ ...prev, page: 0 }));
    setAllData([]);
    setHasMore(true);
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 0 }));
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    resetData,
    updateParams,
    refetch,
    currentPage: params.page || 0,
    totalPages: data?.totalPages || 0
  };
}; 