const express = require("express");
const cors = require("cors");
const db = require("./database");
const analyzer = require("./analyzer");
const { chatbotReply } = require("./chatbot");

require("dotenv").config();
const app = express();

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(express.json());

app.get("/", (_, res) =>
  res.send("Habit Tracker Backend is running 🚀")
);

/* ---------- CREATE HABIT ---------- */
app.post("/habits", (req, res) => {
  const {
    userId = 1,
    name,
    schedule,
    days = [],
    timing,
    goalType = "count",
    goalValue = 1
  } = req.body;

  if (!name || !schedule || !timing)
    return res.status(400).json({ error: "Missing required fields" });

  const daysJson = schedule === "weekly" ? JSON.stringify(days) : null;

  db.run(
    `
    INSERT INTO habits (userId,name,schedule,days,goalType,goalValue,timing)
    VALUES (?,?,?,?,?,?,?)
    `,
    [userId, name, schedule, daysJson, goalType, goalValue, timing],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

/* ---------- GET HABITS ---------- */
app.get("/habits/:userId", (req, res) => {
  const uid = Number(req.params.userId) || 1;

  db.all(
    "SELECT * FROM habits WHERE userId=?",
    [uid],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(
        rows.map(h => ({
          ...h,
          days: h.days ? JSON.parse(h.days) : []
        }))
      );
    }
  );
});

/* ---------- MARK DONE ---------- */
app.post("/logs", (req, res) => {
  const { habitId, date, status } = req.body;

  if (!habitId || !date || !status)
    return res.status(400).json({ error: "Missing fields" });

  db.run(
    `
    INSERT OR REPLACE INTO logs (habitId,date,status)
    VALUES (?,?,?)
    `,
    [habitId, date, status],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

/* ---------- DASHBOARD (Summary + Habits) ---------- */
app.get("/dashboard/:userId/:day", (req, res) => {
  const uid = Number(req.params.userId) || 1;
  const dayOffset = req.params.day === "tomorrow" ? 1 : 0;

  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const targetISO = date.toISOString().split("T")[0];
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

  // 1. Get Habits
  db.all("SELECT * FROM habits WHERE userId=?", [uid], (err, habits) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Get Logs for these habits
    const habitIds = habits.map(h => h.id);
    if (habitIds.length === 0) return res.json({ summary: {}, habits: [] });

    db.all(
      `SELECT * FROM logs WHERE habitId IN (${habitIds.join(",")})`,
      [],
      (err, logs) => {
        if (err) return res.status(500).json({ error: err.message });

        // Global Stats
        const now = new Date();
        const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
        const oneMonthAgo = new Date(now); oneMonthAgo.setDate(now.getDate() - 30);

        const doneThisWeek = logs.filter(l => l.status === "done" && new Date(l.date) >= oneWeekAgo).length;
        const doneThisMonth = logs.filter(l => l.status === "done" && new Date(l.date) >= oneMonthAgo).length;

        let maxStreak = 0;

        // Process Habits
        const processedHabits = habits.map(h => {
          const habitLogs = logs.filter(l => l.habitId === h.id);

          // Done Today?
          const doneToday = habitLogs.some(l => l.date === targetISO && l.status === "done");

          // Last Done
          const doneDates = habitLogs.filter(l => l.status === "done").map(l => l.date).sort().reverse();
          const lastDoneDate = doneDates[0] || null;

          // Streak
          let streak = 0;
          let checkDate = new Date();
          if (!doneToday) checkDate.setDate(checkDate.getDate() - 1); // start from yesterday if not done today

          while (doneDates.includes(checkDate.toISOString().split("T")[0])) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
          if (streak > maxStreak) maxStreak = streak;

          // 30-day Completion Rate
          const done30 = habitLogs.filter(l => l.status === "done" && new Date(l.date) >= oneMonthAgo).length;
          const denominator = h.schedule === "daily" ? 30 : 4;
          const completionRate = Math.min(100, Math.round((done30 / denominator) * 100));

          // Status
          let status = "⚠️ Missed today";
          if (doneToday) status = "✅ On track";
          if (streak === 0 && h.schedule === 'daily' && !doneToday) status = "❌ Broken streak";

          return {
            ...h,
            days: h.days ? JSON.parse(h.days) : [],
            doneToday,
            streak,
            completionRate,
            totalLogs: habitLogs.length,
            lastDoneDate,
            status
          };
        });

        // Filter for View (Today/Tomorrow)
        const relevantHabits = processedHabits.filter(h =>
          h.schedule === "daily" || h.days.includes(weekday)
        );

        // Overall Completion
        const avgCompletion = processedHabits.length
          ? Math.round(processedHabits.reduce((acc, h) => acc + h.completionRate, 0) / processedHabits.length)
          : 0;

        res.json({
          summary: {
            completionRate: avgCompletion,
            longestStreak: maxStreak,
            doneThisWeek,
            doneThisMonth
          },
          habits: relevantHabits
        });
      }
    );
  });
});

/* ---------- EXPLORE (TIPS) ---------- */
app.get("/explore", (req, res) => {
  try {
    const tips = require("./tips.json");
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: "Could not load tips" });
  }
});

/* ---------- REPORT ---------- */
app.get("/habits/:habitId/report", (req, res) => {
  const hid = Number(req.params.habitId);

  db.all(
    "SELECT status FROM logs WHERE habitId=?",
    [hid],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const total = rows.length;
      const done = rows.filter(r => r.status === "done").length;

      res.json({
        totalOccurrences: total,
        completed: done,
        completionRate: total ? Math.round((done / total) * 100) : 0
      });
    }
  );
});

/* ---------- ANALYTICS ---------- */
app.get("/analytics/summary/:userId", (req, res) => {
  analyzer.getSummary(req.params.userId, data => res.json(data));
});

app.get("/habits/streaks/:userId", (req, res) => {
  analyzer.getStreaks(req.params.userId, data => res.json(data));
});

/* ---------- CHATBOT ---------- */
app.post("/chatbot", async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await chatbotReply(message || "", history || []);
    res.json({ reply });
  } catch {
    res.json({ reply: "Something went wrong 😔" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);