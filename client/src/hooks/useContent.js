import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export function useContent() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setResult = (data, totalCount) => {
    setItems(Array.isArray(data) ? data : []);
    setTotal(totalCount ?? (Array.isArray(data) ? data.length : 0));
    setError(null);
  };

  const fetchAll = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/all?page=${page}&limit=12`);
      setResult(res.data.data, res.data.total);
      return res.data;
    } catch (e) {
      setError('Failed to load content.');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) return fetchAll();
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/search?q=${encodeURIComponent(q)}`);
      setResult(res.data.data, res.data.total);
    } catch (e) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const filterCategory = useCallback(async (cat) => {
    if (!cat) return fetchAll();
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/category/${encodeURIComponent(cat)}`);
      setResult(res.data.data, res.data.total);
    } catch (e) {
      setError('Filter failed.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/favorites');
      setResult(res.data.data, res.data.total);
    } catch (e) {
      setError('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/random');
      if (res.data && !res.data.message) {
        setResult([res.data], 1);
      }
    } catch (e) {
      setError('Random fetch failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    await api.delete(`/dashboard/delete/${id}`);
    setItems((prev) => prev.filter((i) => i._id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const res = await api.patch(`/dashboard/favorite/${id}`);
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, isFavorite: res.data.isFavorite } : i))
    );
  }, []);

  const updateNote = useCallback(async (id, note) => {
    await api.patch(`/dashboard/note/${id}`, { note });
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, userNote: note } : i))
    );
  }, []);

  return {
    items, total, loading, error,
    fetchAll, search, filterCategory, fetchFavorites, getRandom,
    deleteItem, toggleFavorite, updateNote,
  };
}
