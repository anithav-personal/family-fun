const today = new Date();
const todayKey = toDateKey(today);
const puzzles = [
  { sequence: "2, 4, 8, 16, ?", hint: "Each number doubles.", answer: 32 },
  { sequence: "3, 6, 9, 12, ?", hint: "Count by threes.", answer: 15 },
  { sequence: "1, 1, 2, 3, 5, ?", hint: "Add the last two numbers.", answer: 8 },
  { sequence: "20, 17, 14, 11, ?", hint: "Count backwards by threes.", answer: 8 },
  { sequence: "5, 10, 20, 40, ?", hint: "Each number doubles.", answer: 80 },
  { sequence: "1, 4, 9, 16, ?", hint: "Think of square numbers.", answer: 25 },
  { sequence: "2, 5, 8, 11, ?", hint: "The gap stays the same.", answer: 14 },
];

let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = todayKey;
let events = readStoredEvents();

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function readStoredEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-events") || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((event) =>
      event &&
      typeof event.id === "string" &&
      typeof event.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
      typeof event.title === "string" &&
      typeof event.person === "string"
    );
  } catch {
    return [];
  }
}

function saveEvents() {
  try {
    localStorage.setItem("family-fun-events", JSON.stringify(events));
  } catch {
    document.getElementById("empty-events").textContent =
      "Browser storage is unavailable. Your plans may not be saved.";
  }
}

function renderCalendar() {
  const monthLabel = displayedMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  document.getElementById("month-label").textContent = monthLabel;
  const grid = document.getElementById("calendar-days");
  grid.replaceChildren();

  const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = toDateKey(date);
    const dayEvents = events.filter((event) => event.date === key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(date.getDate());
    button.setAttribute("aria-label", `${date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}` : ""}`);
    if (date.getMonth() !== displayedMonth.getMonth()) button.classList.add("outside-month");
    if (key === todayKey) button.classList.add("is-today");
    if (key === selectedDate) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    if (dayEvents.length) {
      const dot = document.createElement("span");
      dot.className = "event-dot";
      dot.setAttribute("aria-hidden", "true");
      button.append(dot);
    }
    button.addEventListener("click", () => {
      selectedDate = key;
      renderCalendar();
      renderAgenda();
    });
    grid.append(button);
  }
}

function renderAgenda() {
  const date = dateFromKey(selectedDate);
  document.getElementById("selected-date-label").textContent =
    date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const list = document.getElementById("event-list");
  const dayEvents = events.filter((event) => event.date === selectedDate);
  list.replaceChildren();
  document.getElementById("event-count").textContent =
    `${dayEvents.length} ${dayEvents.length === 1 ? "plan" : "plans"}`;
  document.getElementById("empty-events").hidden = dayEvents.length > 0;
  document.getElementById("event-title").placeholder =
    selectedDate === todayKey ? "Add a family plan…" : "Add a plan for this day…";

  for (const event of dayEvents) {
    const row = document.createElement("li");
    row.className = "event-row";
    const marker = document.createElement("span");
    marker.className = "event-marker";
    marker.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "event-title";
    title.textContent = event.title;
    const person = document.createElement("span");
    person.className = "event-person";
    person.textContent = event.person;
    const remove = document.createElement("button");
    remove.className = "delete-event";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${event.title}`);
    remove.addEventListener("click", () => {
      events = events.filter((item) => item.id !== event.id);
      saveEvents();
      renderCalendar();
      renderAgenda();
    });
    row.append(marker, title, person, remove);
    list.append(row);
  }
}

document.getElementById("today-label").textContent =
  today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

document.getElementById("previous-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById("event-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  if (!title) return;
  events.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: selectedDate,
    title,
    person: form.elements.person.value,
  });
  saveEvents();
  form.reset();
  renderCalendar();
  renderAgenda();
});

const dayNumber = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
  Date.UTC(today.getFullYear(), 0, 0)) / 86400000);
const puzzle = puzzles[dayNumber % puzzles.length];
document.getElementById("puzzle-prompt").textContent = puzzle.sequence;
document.getElementById("puzzle-hint").textContent = puzzle.hint;

const feedback = document.getElementById("answer-feedback");
const answerButton = document.getElementById("answer-button");
const answerInput = document.getElementById("answer");

function showCompletedGame() {
  feedback.textContent = "You got it! Brain break complete for today.";
  feedback.classList.remove("is-incorrect");
  answerButton.disabled = true;
  answerInput.disabled = true;
}

try {
  if (localStorage.getItem("family-fun-game-completed") === todayKey) showCompletedGame();
} catch {
  // The game still works when browser storage is unavailable.
}

document.getElementById("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (Number(answerInput.value) === puzzle.answer) {
    try {
      localStorage.setItem("family-fun-game-completed", todayKey);
    } catch {
      // Keep the current session usable even if progress cannot be saved.
    }
    showCompletedGame();
  } else {
    feedback.textContent = "Not quite—try again!";
    feedback.classList.add("is-incorrect");
    answerInput.select();
  }
});

renderCalendar();
renderAgenda();
