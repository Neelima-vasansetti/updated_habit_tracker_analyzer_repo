const db = require("./database");

/**
 * Completion logic:
 * completed occurrences / scheduled occurrences up to today
 */
function getSummary(userId, cb) {
  const uid = Number(userId) || 1;
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

  db.all(
    "SELECT * FROM habits WHERE userId = ?",
    [uid],
    (err, habits) => {
      if (err) return cb({ error: err.message });

      let scheduled = 0;
      let completed = 0;
      let doneTodaySet = new Set();

      if (!habits.length)
        return cb({ totalHabits: 0, doneToday: 0, completionRate: 0 });

      habits.forEach(h => {
        let appliesToday =
          h.schedule === "daily" ||
          (h.schedule === "weekly" &&
            JSON.parse(h.days || "[]").includes(weekday));

        if (!appliesToday) return;

        scheduled++;

        db.get(
          "SELECT status FROM logs WHERE habitId=? AND date=?",
          [h.id, todayISO],
          (_, row) => {
            if (row?.status === "done") {
              completed++;
              doneTodaySet.add(h.id);
            }
          }
        );
      });

      setTimeout(() => {
        cb({
          totalHabits: habits.length,
          doneToday: doneTodaySet.size,
          completionRate: scheduled
            ? Math.round((completed / scheduled) * 100)
            : 0
        });
      }, 100);
    }
  );
}

function getStreaks(userId, cb) {
  const uid = Number(userId) || 1;

  db.all(
    `
    SELECT h.id AS habitId, l.date
    FROM habits h
    LEFT JOIN logs l ON h.id = l.habitId AND l.status='done'
    WHERE h.userId = ?
    ORDER BY l.date DESC
    `,
    [uid],
    (err, rows) => {
      if (err) return cb({ error: err.message });

      const map = {};
      rows.forEach(r => {
        map[r.habitId] ??= [];
        if (r.date) map[r.habitId].push(r.date);
      });

      const today = new Date();
      const iso = d => d.toISOString().split("T")[0];

      const result = Object.keys(map).map(hid => {
        let streak = 0;
        let d = new Date(today);

        while (map[hid].includes(iso(d))) {
          streak++;
          d.setDate(d.getDate() - 1);
        }

        return { habitId: Number(hid), streak };
      });

      cb(result);
    }
  );
}

module.exports = { getSummary, getStreaks };
