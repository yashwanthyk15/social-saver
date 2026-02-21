import { useEffect, useState } from "react";
import axios from "axios";
import ContentCard from "./components/ContentCard";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const PHONE = params.get("user");

const BASE_URL = "https://social-saver-backend.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================================
     Fetch All Content
  ================================ */
  const fetchData = async () => {
    if (!PHONE) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/dashboard/all/${PHONE}`
      );
      setData(res.data);
      setAllData(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Fetch Categories
  ================================ */
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

  /* ================================
     Search
  ================================ */
  const searchData = async () => {
    if (!PHONE || !search.trim()) return;

    try {
      setLoading(true);
      setSelectedCategory("");

      const res = await axios.get(
        `${BASE_URL}/dashboard/search/${PHONE}?q=${search}`
      );

      setData(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Filter by Category
  ================================ */
  const filterCategory = async (cat) => {
    if (!PHONE) return;

    setSelectedCategory(cat);
    setSearch("");

    if (cat === "") {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/dashboard/category/${PHONE}/${cat}`
      );
      setData(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Category filter failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Pagination Logic
  ================================ */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = data.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleDelete = (id) => {
    const updated = data.filter((item) => item._id !== id);
    setData(updated);
  };

  useEffect(() => {
    if (PHONE) {
      fetchData();
      fetchCategories();
    }
  }, []);

  /* ================================
     UI
  ================================ */
  return (
    <div className="container">
      <h1>📚 Social Saver Dashboard</h1>

      {PHONE && (
        <>
          <div className="total-count">
            Total Saved: {data.length}
          </div>

          <div className="controls">
            <input
              type="text"
              placeholder="Search saved content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button onClick={searchData}>Search</button>
            <button onClick={fetchData}>All</button>

            <select
              value={selectedCategory}
              onChange={(e) => filterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => {
                const count = allData.filter(
                  (item) => item.category === cat
                ).length;

                return (
                  <option key={index} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {loading ? (
            <div className="empty">Loading...</div>
          ) : (
            <>
              <div className="cards fade-in">
                {currentItems.map((item) => (
                  <ContentCard
                    key={item._id}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={
                        currentPage === index + 1
                          ? "active-page"
                          : ""
                      }
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;