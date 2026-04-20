// frontend/src/components/Journal.js
import React, { useEffect, useState } from "react";

export default function Journal() {
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("siteTheme") || "light");

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("journal_entries") || "[]"));
    applyTheme(theme);
  }, []);

  const applyTheme = (t) => {
    localStorage.setItem("siteTheme", t);
    setTheme(t);
    if (t === "dark") document.documentElement.style.setProperty("--card","#0f172a");
    else document.documentElement.style.removeProperty("--card");
  };

  const save = () => {
    if (!note.trim()) return;
    const entry = { id: Date.now(), date: new Date().toISOString(), text: note };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem("journal_entries", JSON.stringify(updated));
    setNote("");
  };

  const remove = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("journal_entries", JSON.stringify(updated));
  };

  const edit = (id) => {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    const newText = prompt("Edit entry:", e.text);
    if (newText == null) return;
    const updated = entries.map(x => x.id === id ? {...x, text:newText} : x);
    setEntries(updated);
    localStorage.setItem("journal_entries", JSON.stringify(updated));
  };

  return (
    <div className="page-card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3>Journal</h3>
        <div>
          <button onClick={() => applyTheme(theme === "light" ? "dark" : "light")}>
            Theme: {theme === "light" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      <textarea rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Daily reflection..." />
      <div style={{ marginTop: 8 }}>
        <button onClick={save}>Save Entry</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {entries.map(en => (
          <div key={en.id} className="journal-entry">
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(en.date).toLocaleString()}</div>
              <div>
                <button className="small" onClick={()=>edit(en.id)}>Edit</button>
                <button className="small" onClick={()=>remove(en.id)} style={{ marginLeft: 8 }}>Delete</button>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>{en.text}</div>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color:"#6b7280" }}>No entries yet.</div>}
      </div>
    </div>
  );
}
