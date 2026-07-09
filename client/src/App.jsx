import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, X, LayoutGrid, Star, Shuffle } from 'lucide-react';
import { setToken, api } from './utils/api';
import { useContent } from './hooks/useContent';
import Navbar from './components/Navbar';
import ContentCard from './components/ContentCard';
import SkeletonCard from './components/SkeletonCard';
import StatsPanel from './components/StatsPanel';
import EmptyState from './components/EmptyState';
import './index.css';
import { getToken } from './utils/api';

// ── Read token from URL query param or localStorage ──
const params = new URLSearchParams(window.location.search);
const urlToken = params.get('token');
if (urlToken) {
  setToken(urlToken);
  // Remove token from URL to prevent accidental sharing
  window.history.replaceState({}, document.title, window.location.pathname);
}
const TOKEN = getToken();

export default function App() {
  const {
    items, total, loading, error,
    fetchAll, search, filterCategory, fetchFavorites, getRandom,
    deleteItem, toggleFavorite, updateNote,
  } = useContent();

  const [categories,    setCategories]    = useState([]);
  const [selectedCat,   setSelectedCat]   = useState('');
  const [activeView,    setActiveView]    = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [sessionExpired,setSessionExpired]= useState(false);
  const [showStats,     setShowStats]     = useState(false);
  const [theme,         setTheme]         = useState(() =>
    localStorage.getItem('ss-theme') || 'dark'
  );

  const searchRef = useRef(null);

  // ── Apply theme to <html> ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ss-theme', theme);
  }, [theme]);

  // ── Session-expired global event from api.js interceptor ──
  useEffect(() => {
    const h = () => setSessionExpired(true);
    window.addEventListener('session-expired', h);
    return () => window.removeEventListener('session-expired', h);
  }, []);

  // ── Initial data load ──
  useEffect(() => {
    if (!TOKEN) return;
    doLoadAll(1);
    loadCategories();
  }, []);

  // ────────────────────────────────────────────
  // Data helpers
  // ────────────────────────────────────────────
  const doLoadAll = async (p = 1) => {
    const res = await fetchAll(p);
    if (res) { setTotalPages(res.totalPages || 1); setPage(p); }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/dashboard/categories');
      setCategories(res.data);
    } catch { /* non-fatal */ }
  };

  // ────────────────────────────────────────────
  // View / filter actions
  // ────────────────────────────────────────────
  const switchView = useCallback(async (view) => {
    setActiveView(view);
    setSelectedCat('');
    setSearchQuery('');
    if (view === 'all')       { doLoadAll(1); }
    else if (view === 'favorites') { fetchFavorites(); }
    else if (view === 'random')    { getRandom(); }
  }, [fetchFavorites, getRandom]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return doLoadAll(1);
    setActiveView('all');
    setSelectedCat('');
    search(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    doLoadAll(1);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const handleCatFilter = (cat) => {
    setSelectedCat(cat);
    setActiveView('all');
    setSearchQuery('');
    filterCategory(cat);
  };

  const handlePage = (p) => {
    doLoadAll(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const emptyView = searchQuery
    ? 'search'
    : activeView === 'favorites'
    ? 'favorites'
    : selectedCat
    ? 'category'
    : 'all';

  // ────────────────────────────────────────────
  // Guard screens
  // ────────────────────────────────────────────
  if (!TOKEN) {
    return (
      <div className="guard-screen">
        <div className="guard-box">
          <div className="guard-icon">🔐</div>
          <h2>Access Required</h2>
          <p>
            Open your Telegram bot and send <code>/start</code> to
            receive your private dashboard link.
          </p>
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="guard-screen">
        <div className="guard-box">
          <div className="guard-icon">⏰</div>
          <h2>Session Expired</h2>
          <p>
            Your 7-day session has ended. Go to Telegram and
            send <code>/start</code> to get a new secure link.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // Main UI
  // ────────────────────────────────────────────
  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      
      <Navbar
        total={total}
        onShowStats={() => setShowStats(true)}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <main className="main-container">

        {/* ── Controls ── */}
        <div className="controls-bar">

          {/* Search row */}
          <div className="search-row">
            <div className="search-wrap">
              <span className="search-icon-wrap"><Search size={15} /></span>
              <input
                ref={searchRef}
                type="text"
                className="search-input"
                placeholder="Search summaries, tags, categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery && (
                <button className="search-clear" onClick={handleClearSearch} aria-label="Clear">
                  <X size={13} />
                </button>
              )}
              <button className="search-btn" onClick={handleSearch}>
                <Search size={13} /> Search
              </button>
            </div>
          </div>

          {/* View tabs */}
          <div className="view-tabs">
            {[
              { id: 'all',       icon: <LayoutGrid size={13} />, label: 'All'       },
              { id: 'favorites', icon: <Star        size={13} />, label: 'Favorites' },
              { id: 'random',    icon: <Shuffle     size={13} />, label: 'Random'    },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`tab-btn ${activeView === id && !selectedCat && !searchQuery ? 'tab-active' : ''}`}
                onClick={() => switchView(id)}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="cat-chips-wrap">
              <button
                className={`chip ${!selectedCat ? 'chip-active' : ''}`}
                onClick={() => handleCatFilter('')}
              >
                All
              </button>
              {categories.map((c, i) => (
                <button
                  key={i}
                  className={`chip ${selectedCat === c.name ? 'chip-active' : ''}`}
                  onClick={() => handleCatFilter(c.name)}
                >
                  {c.name}
                  <span className="chip-count">{c.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results info */}
          {!loading && items.length > 0 && (
            <div className="results-info">
              Showing <span className="results-count">{items.length}</span>
              {total > items.length && <> of <span className="results-count">{total}</span></>}
              {' '}item{items.length !== 1 ? 's' : ''}
              {selectedCat && <> in <strong>{selectedCat}</strong></>}
              {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="cards-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState view={emptyView} />
        ) : (
          <div className="cards-grid fade-in">
            {items.map((item) => (
              <ContentCard
                key={item._id}
                item={item}
                onDelete={deleteItem}
                onToggleFavorite={toggleFavorite}
                onUpdateNote={updateNote}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && activeView === 'all' && !searchQuery && !selectedCat && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => handlePage(page - 1)}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${page === p ? 'page-active' : ''}`}
                onClick={() => handlePage(p)}
              >
                {p}
              </button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => handlePage(page + 1)}>
              Next →
            </button>
          </div>
        )}
      </main>

      {/* ── Stats Modal ── */}
      <AnimatePresence>
        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      </AnimatePresence>
    </>
  );
}
