import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Explore() {
  const [tips, setTips] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Fetch tips from the backend
    axios.get("http://localhost:5000/explore")
      .then(res => setTips(res.data))
      .catch(err => console.error("Failed to load tips", err));
  }, []);

  // Extract categories from keywords (use the first keyword as the primary category)
  const categories = ["All", ...new Set(tips.map(t => t.keywords[0]))];

  const filtered = tips.filter(item => {
    const category = item.keywords[0];
    const text = item.tip;

    const matchesQuery =
      text.toLowerCase().includes(query.toLowerCase()) ||
      category.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      filter === "All" || category === filter;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="page-animate">
      <div className="header-flex" style={{ marginBottom: 24 }}>
        <div>
          <h2>Explore & Motivate</h2>
          <p className="muted">Discover insights to build better habits.</p>
        </div>
      </div>

      {/* Search */}
      <input
        className="search-input"
        placeholder="Search for tips, keywords..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 16, width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
      />

      {/* Category Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              background: filter === cat ? "#6366f1" : "#e2e8f0",
              color: filter === cat ? "#fff" : "#475569",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Masonry-style Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20
      }}>
        {filtered.length === 0 && (
          <p className="muted">No tips found for your search.</p>
        )}

        {filtered.map((item, index) => (
          <div
            key={index}
            className="habit-card"
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
              borderLeft: `4px solid hsl(${Math.random() * 360}, 70%, 60%)`
            }}
          >
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#94a3b8",
              letterSpacing: 0.5
            }}>
              {item.keywords[0]}
            </span>

            <p style={{ fontSize: 16, lineHeight: 1.5, color: "#1e293b", fontWeight: 500 }}>
              "{item.tip}"
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
              {item.keywords.slice(1).map(k => (
                <span key={k} style={{ fontSize: 11, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, color: "#64748b" }}>
                  #{k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
