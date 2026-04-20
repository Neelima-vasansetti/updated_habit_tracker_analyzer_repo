import { useState } from "react";
import axios from "axios";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function HabitForm({ onCreated }) {
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [days, setDays] = useState([]);
  const [time, setTime] = useState("");

  const toggleDay = day => {
    setDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const submit = async e => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/habits", {
        userId: 1,
        name,
        schedule,
        days: schedule === "weekly" ? days : [],
        timing: time
      });

      setName("");
      setDays([]);
      setTime("");
      onCreated && onCreated();
    } catch {
      alert("❌ Failed to create habit. Is backend running?");
    }
  };

  return (
    <form onSubmit={submit} className="habit-card">
      <h3>Create Habit</h3>

      <input
        placeholder="Habit name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <select value={schedule} onChange={e => setSchedule(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>

      {schedule === "weekly" && (
        <div className="weekday-box">
          {WEEKDAYS.map(day => (
            <label key={day}>
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
      )}

      <input
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        required
      />

      <button type="submit">Add Habit</button>
    </form>
  );
}
