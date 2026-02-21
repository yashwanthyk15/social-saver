import { useEffect, useState } from "react";
import axios from "axios";
import ContentCard from "./components/ContentCard";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const PHONE = params.get("user");

// 🔥 Production Backend URL
const BASE_URL = "https://social-saver-backend.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // Fetch ALL content for this user
  // ===============================
  const fetchData = async () => {
    if (!PHONE) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/all/${PHONE}`
      );

      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Fetch categories for this user
  // ===============================
  const fetchCategories = async () => {
    if (!PHONE) return;

    try {
      const res = await axios.get(
        `${BASE_URL}/dashboard/categories/${PHONE}`
      );

      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // ===============================
  // Search
  // ===============================
  const searchData = async () => {
    if (!PHONE || !search.trim()) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/search/${PHONE}?q=${search}`
      );

      setData(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Filter by category
  // ===============================
  const filterCategory = async (cat) => {
    if (!PHONE) return;

    setSelectedCategory(cat);

    if (!cat) {
      fetchData();
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/category/${PHONE}/${cat}`
      );

      setData(res.data);
    } catch (error) {
      console.error("Category filter failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Random
  // ===============================
  const randomItem = async () => {
    if (!PHONE) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/random/${PHONE}`
      );

      if (res.data && !res.data.message) {
        setData([res.data]);
      }
    } catch (error) {
      console.error("Random fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (PHONE) {
      fetchData();
      fetchCategories();
    }
  }, []);

  // ===============================
  // UI
  // ===============================
  return (
    <div className="container">
      <h1>📚 Social Saver Dashboard</h1>

      {!PHONE && (
        <div className="empty">
          Invalid dashboard link. Please access from Telegram.
        </div>
      )}

      {PHONE && (
        <>
          <div className="controls">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button onClick={searchData}>Search</button>
            <button onClick={fetchData}>All</button>
            <button onClick={randomItem}>🎲 Random</button>

            <select
              value={selectedCategory}
              onChange={(e) => filterCategory(e.target.value)}
            >
              <option value="">Filter by Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="empty">Loading...</div>
          ) : data.length === 0 ? (
            <div className="empty">No saved content yet.</div>
          ) : (
            <div className="cards">
              {data.map((item) => (
                <ContentCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;