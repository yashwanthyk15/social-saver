import { useEffect, useState } from "react";
import axios from "axios";
import ContentCard from "./components/ContentCard";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const TOKEN = params.get("token");

const BASE_URL = "https://social-saver-backend.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const config = {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  };

  /* ================================
     Fetch All Content
  ================================ */
  const fetchData = async () => {
    if (!TOKEN) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/dashboard/all`,
        config
      );
      setData(res.data);
      setAllData(res.data);
      setCurrentPage(1);
    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Fetch Categories
  ================================ */
  const fetchCategories = async () => {
    if (!TOKEN) return;

    try {
      const res = await axios.get(
        `${BASE_URL}/dashboard/categories`,
        config
      );
      setCategories(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Failed to fetch categories:", error);
    }
  };

  /* ================================
     Search
  ================================ */
  const searchData = async () => {
    if (!TOKEN || !search.trim()) return;

    try {
      setLoading(true);
      setSelectedCategory("");

      const res = await axios.get(
        `${BASE_URL}/dashboard/search?q=${search}`,
        config
      );

      setData(res.data);
      setCurrentPage(1);
    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Filter by Category
  ================================ */
  const filterCategory = async (cat) => {
    if (!TOKEN) return;

    setSelectedCategory(cat);
    setSearch("");

    if (cat === "") {
      fetchData();
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/category/${cat}`,
        config
      );

      setData(res.data);
      setCurrentPage(1);
    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Category filter failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Random Inspiration
  ================================ */
  const getRandomInspiration = async () => {
    if (!TOKEN) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/dashboard/random`,
        config
      );

      if (res.data && !res.data.message) {
        setData([res.data]);   // show only random item
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Random failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Delete
  ================================ */
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/dashboard/delete/${id}`,
        config
      );

      setData((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      if (error.response?.status === 403) {
        setSessionExpired(true);
      }
      console.error("Delete failed:", error);
    }
  };

  /* ================================
     Pagination
  ================================ */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = data.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    if (TOKEN) {
      fetchData();
      fetchCategories();
    }
  }, []);

  /* ================================
     UI
  ================================ */
  if (!TOKEN) {
    return (
      <div className="container">
        <div className="empty">
          Invalid dashboard link. Please restart the bot.
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="container">
        <div className="empty">
          🔐 Your session has expired.
          <br />
          Please go back to Telegram and type <b>/start</b> to get a new secure link.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📚 Social Saver Dashboard</h1>

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

  <button onClick={getRandomInspiration}>
     Random 
  </button>

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
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;