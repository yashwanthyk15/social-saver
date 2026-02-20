import { useEffect, useState } from "react";
import axios from "axios";
import ContentCard from "./components/ContentCard";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const PHONE = params.get("user");

function App() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]); // separate state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch ALL content
  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:5000/dashboard/all`
    );
    setData(res.data);
  };

  // Fetch categories ONLY ONCE
  const fetchCategories = async () => {
    const res = await axios.get(
      `http://localhost:5000/dashboard/categories`
    );
    setCategories(res.data);
  };

  const searchData = async () => {
    const res = await axios.get(
      `http://localhost:5000/dashboard/search/${PHONE}?q=${search}`
    );
    setData(res.data);
  };

  const filterCategory = async (cat) => {
    setSelectedCategory(cat);

    if (!cat) {
      fetchData();
      return;
    }

    const res = await axios.get(
      `http://localhost:5000/dashboard/category/${PHONE}/${cat}`
    );
    setData(res.data);
  };

  const randomItem = async () => {
    const res = await axios.get(
      `http://localhost:5000/dashboard/random/${PHONE}`
    );

    if (res.data && !res.data.message) {
      setData([res.data]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories(); // fetch only once
  }, []);

  return (
    <div className="container">
      <h1>📚 Social Saver Dashboard</h1>

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

      {data.length === 0 ? (
        <div className="empty">No saved content yet.</div>
      ) : (
        <div className="cards">
          {data.map((item) => (
            <ContentCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
