// frontend/src/App.js
import React, { useState } from "react";

import Dashboard from "./components/Dashboard";
import HabitForm from "./components/HabitForm";
import CalendarView from "./components/CalendarView";
import Reports from "./components/Reports";
import Journal from "./components/Journal";
import Explore from "./components/Explore";
import Chatbot from "./components/Chatbot";
import FocusAlert from "./components/FocusAlert";

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState(null); // null until user selects

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="brand">Habit Tracker</h2>

        <nav>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("create")}>Create Habit</button>
          <button onClick={() => setPage("calendar")}>Calendar</button>
          <button onClick={() => setPage("reports")}>Reports</button>
          <button onClick={() => setPage("journal")}>Journal</button>
          <button onClick={() => setPage("explore")}>Explore</button>
          <button onClick={() => setPage("chatbot")}>Chatbot</button>
          <button onClick={() => setPage("focus")}>Focus</button>
        </nav>

        <div className="sidebar-footer">Built with ❤️</div>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>Habit Tracker Analyzer</h1>
        </header>

        <section className="page">
          {page === "dashboard" && <Dashboard />}
          {page === "create" && <HabitForm />}
          {page === "calendar" && (
            <CalendarView habitId={selectedHabitForCalendar || undefined} />
          )}
          {page === "reports" && <Reports />}
          {page === "journal" && <Journal />}
          {page === "explore" && <Explore />}
          {page === "chatbot" && <Chatbot />}
          {page === "focus" && <FocusAlert />}
        </section>
      </main>
    </div>
  );
}

export default App;
