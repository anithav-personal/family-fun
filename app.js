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
const gameBadges = [
  { count: 100, icon: "✦", name: "Bronze Booster" },
  { count: 200, icon: "★", name: "Silver Solver" },
  { count: 300, icon: "⚡", name: "Gold Genius" },
  { count: 400, icon: "◆", name: "Diamond Thinker" },
  { count: 500, icon: "♛", name: "Brain Champion" },
];
const plantPointGoal = 5;
const proteinPointGoal = 3;
const healthyFatPointGoal = 2;
const waterCupGoal = 6;
const petDailyPlantGoal = 3;
const petTypes = {
  dragon: "🐉",
  fox: "🦊",
  bunny: "🐰",
  puppy: "🐶",
  kitty: "🐱",
};
const petGrowthStages = [
  { minimum: 0, name: "Egg", icon: "🥚" },
  { minimum: 3, name: "Hatchling" },
  { minimum: 15, name: "Growing Pal" },
  { minimum: 40, name: "Plant Adventurer" },
  { minimum: 100, name: "Legendary Hero" },
];
const puzzleQuotes = [
  "Your brain gets stronger every time you try!",
  "You found the pattern—brilliant thinking!",
  "Curiosity plus practice makes an amazing team.",
  "That solution deserves a victory dance!",
];
const plantQuotes = [
  "A colorful plate gives your Plant Pal growing power!",
  "Six plant points in one meal—what a rainbow feast!",
  "Every plant point is a tiny boost for you and your pet.",
  "Your Plant Pal is cheering for that amazing variety!",
];
const badgeQuotes = [
  "Big goals happen one small win at a time.",
  "You kept going, and now this badge tells the story!",
  "Your effort unlocked something awesome—keep shining!",
  "Consistency is your superpower!",
];
let celebrationTimeout;

let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = todayKey;
let events = readStoredEvents();
let members = readStoredArray("family-fun-members", isValidMember);
let assignments = readStoredArray("family-fun-assignments", isValidAssignment);
let todos = readStoredArray("family-fun-todos", isValidTodo);
let inventory = readStoredArray("family-fun-inventory", isValidInventoryItem);
let meals = readStoredArray("family-fun-meals", isValidMeal);
let alerts = readStoredArray("family-fun-alerts", isValidAlert);
let gameProgress = readGameProgress();
let gameAchievements = readGameAchievements();
let healthyQuest = readHealthyQuest();
let virtualPets = readVirtualPets();
let activeMemberId = "";
let alarmAudioContext;
try {
  activeMemberId = localStorage.getItem("family-fun-active-profile") || "";
} catch {
  // The first family profile will be used when browser storage is unavailable.
}

function activateTheme(theme, focusTab = false) {
  if (theme === "settings" && !canUseParentSettings()) theme = "routine";
  const tabs = [...document.querySelectorAll("[data-theme-tab]")];
  if (!tabs.some((tab) => tab.dataset.themeTab === theme)) theme = "routine";
  for (const tab of tabs) {
    const isActive = tab.dataset.themeTab === theme;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive && focusTab) tab.focus();
  }
  for (const panel of document.querySelectorAll("[data-theme-panel]")) {
    panel.hidden = panel.dataset.themePanel !== theme;
  }
  document.getElementById("section-guide").textContent = {
    routine: "Routine: check off your day, see earned game time and reward stars, and work toward your wish.",
    rewards: "Rewards: add a wish, fill your piggy bank with reward stars, and celebrate your goal.",
    calendar: "Calendar: choose a day to see family plans and timed chores or tasks.",
    meals: "Meals: plan by date, check your kitchen supplies, and spin for dinner.",
    settings: "Settings: manage family profiles, ages, play themes, appearance, and backups.",
    fun: "Play Time: give your brain a boost, grow your pet, and celebrate little wins.",
  }[theme];
  try {
    localStorage.setItem("family-fun-active-tab", theme);
  } catch {
    // Tab navigation remains available without browser storage.
  }
}

const themeTabs = [...document.querySelectorAll("[data-theme-tab]")];
for (const tab of themeTabs) {
  tab.addEventListener("click", () => activateTheme(tab.dataset.themeTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const visibleTabs = themeTabs.filter((candidate) => !candidate.hidden);
    const currentIndex = visibleTabs.indexOf(tab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % visibleTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = visibleTabs.length - 1;
    activateTheme(visibleTabs[nextIndex].dataset.themeTab, true);
  });
}

let initialTheme = "routine";
try {
  initialTheme = localStorage.getItem("family-fun-active-tab") || initialTheme;
} catch {
  // Use the daily routine when browser storage is unavailable.
}
activateTheme(initialTheme);

function applyColorTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  const toggle = document.getElementById("theme-toggle");
  toggle.setAttribute("aria-pressed", String(isDark));
  document.getElementById("theme-icon").textContent = isDark ? "☀" : "☾";
  document.getElementById("theme-label").textContent = isDark ? "Day" : "Night";
  toggle.setAttribute("aria-label", `Switch to ${isDark ? "day" : "night"} mode`);
}

let colorTheme;
try {
  colorTheme = localStorage.getItem("family-fun-color-theme");
} catch {
  // Use the device preference when browser storage is unavailable.
}
if (colorTheme !== "dark" && colorTheme !== "light") {
  colorTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
applyColorTheme(colorTheme);

document.getElementById("theme-toggle").addEventListener("click", () => {
  colorTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyColorTheme(colorTheme);
  try {
    localStorage.setItem("family-fun-color-theme", colorTheme);
  } catch {
    // The theme remains active for this page session.
  }
});

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = dateFromKey(value);
  return Number.isFinite(date.getTime()) && toDateKey(date) === value;
}

function formatMealDate(date) {
  return dateFromKey(date).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function pickQuote(quotes) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function showCelebration({ icon, title, quote, target, activity = "celebration", record = true }) {
  if (record && typeof recordFunActivity === "function") {
    recordFunActivity(activeMemberId, activity, title);
  }
  window.clearTimeout(celebrationTimeout);
  const celebration = document.getElementById("celebration");
  const confetti = document.getElementById("celebration-confetti");
  document.getElementById("celebration-icon").textContent = icon;
  document.getElementById("celebration-title").textContent = title;
  document.getElementById("celebration-quote").textContent = quote;
  confetti.replaceChildren();
  for (let index = 0; index < 22; index += 1) {
    const piece = document.createElement("span");
    piece.style.setProperty("--x", `${Math.round(Math.random() * 100)}vw`);
    piece.style.setProperty("--delay", `${(Math.random() * 0.45).toFixed(2)}s`);
    piece.style.setProperty("--spin", `${Math.round(Math.random() * 540 + 180)}deg`);
    piece.style.setProperty("--hue", `${Math.round(Math.random() * 220 + 30)}`);
    confetti.append(piece);
  }
  celebration.hidden = false;
  celebration.classList.remove("is-visible");
  void celebration.offsetWidth;
  celebration.classList.add("is-visible");
  if (target) {
    target.classList.remove("is-celebrating");
    void target.offsetWidth;
    target.classList.add("is-celebrating");
    window.setTimeout(() => target.classList.remove("is-celebrating"), 900);
  }
  celebrationTimeout = window.setTimeout(() => {
    celebration.classList.remove("is-visible");
    window.setTimeout(() => { celebration.hidden = true; }, 250);
  }, 2400);
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function readStoredEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-events") || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter(isValidEvent);
  } catch {
    return [];
  }
}

function readStoredArray(key, isValid) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(stored) ? stored.filter(isValid) : [];
  } catch {
    return [];
  }
}

function readGameProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-game-progress") || "{}");
    return isValidGameProgress(stored) ? stored : {};
  } catch {
    return {};
  }
}

function isValidGameProgress(progress) {
  return progress &&
    typeof progress === "object" &&
    !Array.isArray(progress) &&
    Object.entries(progress).every(([memberId, date]) =>
      memberId && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    );
}

function readGameAchievements() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-game-achievements") || "{}");
    return isValidGameAchievements(stored) ? stored : {};
  } catch {
    return {};
  }
}

function isValidGameAchievements(achievements) {
  return achievements &&
    typeof achievements === "object" &&
    !Array.isArray(achievements) &&
    Object.entries(achievements).every(([memberId, dates]) =>
      memberId &&
      Array.isArray(dates) &&
      dates.every((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
    );
}

function readHealthyQuest() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-healthy-quest") || "{}");
    return isValidHealthyQuest(stored) ? stored : {};
  } catch {
    return {};
  }
}

function getHealthyPoints(items) {
  return items.reduce((total, item) => total + (item.points ?? 1), 0);
}

function isValidHealthyQuest(quest) {
  const isValidFood = (food) =>
    typeof food === "string" ||
    (food &&
      (food.points === undefined
        ? typeof food.name === "string"
        : Number.isSafeInteger(food.points) && food.points > 0) &&
      typeof food.occasion === "string");
  return quest &&
    typeof quest === "object" &&
    !Array.isArray(quest) &&
    Object.values(quest).every((dailyEntries) =>
      dailyEntries &&
      typeof dailyEntries === "object" &&
      !Array.isArray(dailyEntries) &&
      Object.entries(dailyEntries).every(([date, entry]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        entry &&
        Array.isArray(entry.plants) &&
        entry.plants.every(isValidFood) &&
        Number.isSafeInteger(getHealthyPoints(entry.plants)) &&
        (entry.proteins === undefined ||
          (Array.isArray(entry.proteins) &&
            entry.proteins.every(isValidFood) &&
            Number.isSafeInteger(getHealthyPoints(entry.proteins)))) &&
        (entry.fats === undefined ||
          (Array.isArray(entry.fats) &&
            entry.fats.every(isValidFood) &&
            Number.isSafeInteger(getHealthyPoints(entry.fats)))) &&
        Number.isInteger(entry.water) &&
        entry.water >= 0 &&
        entry.water <= 30 &&
        typeof entry.rewarded === "boolean"
      )
    );
}

function readVirtualPets() {
  try {
    const stored = JSON.parse(localStorage.getItem("family-fun-virtual-pets") || "{}");
    return isValidVirtualPets(stored) ? stored : {};
  } catch {
    return {};
  }
}

function isValidVirtualPets(pets) {
  return pets &&
    typeof pets === "object" &&
    !Array.isArray(pets) &&
    Object.values(pets).every((pet) =>
      pet &&
      typeof pet.name === "string" &&
      Object.hasOwn(petTypes, pet.type)
    );
}

function isValidMember(member) {
  return member &&
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    (member.role === "child" || member.role === "adult") &&
    (member.playTheme === undefined || ["classic", "blocks", "cube"].includes(member.playTheme)) &&
    (member.relationship === undefined || typeof member.relationship === "string") &&
    (member.age === undefined || member.age === null ||
      (Number.isInteger(member.age) && member.age > 0 && member.age <= 120)) &&
    (member.gameMinutes === undefined ||
      (Number.isInteger(member.gameMinutes) && member.gameMinutes >= 0)) &&
    (member.brainStars === undefined ||
      (Number.isInteger(member.brainStars) && member.brainStars >= 0)) &&
    Number.isInteger(member.goal) && member.goal > 0 &&
    Number.isInteger(member.points) && member.points >= 0 &&
    Number.isInteger(member.stars) && member.stars >= 0;
}

function isValidEvent(event) {
  return event &&
    typeof event.id === "string" &&
    isValidDateKey(event.date) &&
    typeof event.title === "string" &&
    typeof event.person === "string" &&
    (event.memberId === undefined || typeof event.memberId === "string") &&
    isValidScheduleOptions(event);
}

function isValidAssignment(assignment) {
  return assignment &&
    typeof assignment.id === "string" &&
    typeof assignment.memberId === "string" &&
    typeof assignment.title === "string" &&
    (assignment.kind === "chore" || assignment.kind === "task") &&
    Number.isInteger(assignment.reward) && assignment.reward >= 0 &&
    (assignment.optional === undefined || typeof assignment.optional === "boolean") &&
    (assignment.period === undefined || ["morning", "afternoon", "evening", "anytime"].includes(assignment.period)) &&
    (assignment.routineOrder === undefined || (Number.isSafeInteger(assignment.routineOrder) && assignment.routineOrder >= 0)) &&
    typeof assignment.completed === "boolean" &&
    (assignment.startDate === undefined || isValidDateKey(assignment.startDate)) &&
    isValidScheduleOptions(assignment) &&
    (assignment.completedDates === undefined ||
      (Array.isArray(assignment.completedDates) &&
        new Set(assignment.completedDates).size === assignment.completedDates.length &&
        assignment.completedDates.every((date) => isAssignmentDue(assignment, date)))) &&
    (!(assignment.recurrence && assignment.recurrence !== "none") ||
      (isValidDateKey(assignment.startDate) && Array.isArray(assignment.completedDates) && !assignment.completed)) &&
    ((assignment.recurrence && assignment.recurrence !== "none") || !assignment.completedDates?.length);
}

function isAssignmentDue(assignment, date) {
  const startDate = assignment.startDate || assignment.date;
  if (!isValidDateKey(date) || !isValidDateKey(startDate) || date < startDate) return false;
  const recurrence = assignment.recurrence || "none";
  if (recurrence === "none") return date === startDate;
  if (recurrence === "daily") return true;
  const start = dateFromKey(startDate);
  const occurrence = dateFromKey(date);
  if (recurrence === "weekdays") return occurrence.getDay() >= 1 && occurrence.getDay() <= 5;
  if (recurrence === "weekly") return occurrence.getDay() === start.getDay();
  if (recurrence !== "monthly") return false;
  const lastDay = new Date(occurrence.getFullYear(), occurrence.getMonth() + 1, 0).getDate();
  return occurrence.getDate() === Math.min(start.getDate(), lastDay);
}

function isValidScheduleOptions(plan) {
  const notification = plan.notification;
  return (plan.time === undefined || plan.time === "" ||
      (typeof plan.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(plan.time))) &&
    (plan.recurrence === undefined || ["none", "daily", "weekdays", "weekly", "monthly"].includes(plan.recurrence)) &&
    (notification === undefined ||
      (notification && (notification.kind === "reminder" || notification.kind === "alarm") &&
        Boolean(plan.time) && isValidDateKey(plan.startDate || plan.date) &&
        [0, 5, 15, 30, 60].includes(notification.minutesBefore) &&
        Array.isArray(notification.notifiedDates) &&
        new Set(notification.notifiedDates).size === notification.notifiedDates.length &&
        notification.notifiedDates.every((date) => isAssignmentDue(plan, date))));
}

function getEventsForDate(date, memberId = "") {
  const member = members.find((item) => item.id === memberId);
  return events.filter((event) => isAssignmentDue(event, date) &&
    (!memberId || event.memberId === memberId || (!event.memberId &&
      (event.person === "Everyone" || event.person === member?.name))))
    .sort((a, b) => (a.time || "24:00").localeCompare(b.time || "24:00") || a.title.localeCompare(b.title));
}

function readPlanNotification(form, previous) {
  return form.elements.notificationKind.value === "none" ? undefined : {
    kind: form.elements.notificationKind.value,
    minutesBefore: Number(form.elements.minutesBefore.value),
    notifiedDates: previous?.notifiedDates || [],
  };
}

function isAssignmentComplete(assignment, date) {
  return assignment.recurrence && assignment.recurrence !== "none"
    ? assignment.completedDates.includes(date)
    : assignment.completed;
}

function getAssignmentsForDate(date, memberId = "") {
  return assignments.filter((assignment) =>
    (!memberId || assignment.memberId === memberId) &&
    members.some((member) => member.id === assignment.memberId) &&
    isAssignmentDue(assignment, date))
    .sort((a, b) => (a.time || "24:00").localeCompare(b.time || "24:00") || a.title.localeCompare(b.title));
}

function formatAssignmentTime(time) {
  if (!time) return "Any time";
  const [hour, minute] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function assignmentScheduleLabel(assignment) {
  if (!assignment.startDate) return "Not scheduled - edit schedule to add to the calendar";
  const repeat = { none: "Once", daily: "Daily", weekdays: "Weekdays (Mon-Fri)", weekly: "Weekly", monthly: "Monthly" }[assignment.recurrence || "none"];
  return `${repeat} from ${formatMealDate(assignment.startDate)} · ${formatAssignmentTime(assignment.time)}`;
}

function setAssignmentFeedback(message, isError = false) {
  for (const id of ["assignment-feedback", "calendar-feedback", "routine-feedback"]) {
    const feedback = document.getElementById(id);
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
  }
}

function refreshAssignmentViews() {
  renderRewards();
  renderCalendar();
  renderAgenda();
}

function commitEventChange(change, message) {
  const oldEvents = structuredClone(events);
  try {
    change();
    if (!events.every(isValidEvent)) throw new Error("Invalid event data");
    localStorage.setItem("family-fun-events", JSON.stringify(events));
  } catch {
    events = oldEvents;
    refreshAssignmentViews();
    setAssignmentFeedback("Could not save this event change. No events were changed. Check browser storage and try again.", true);
    return false;
  }
  refreshAssignmentViews();
  setAssignmentFeedback(message);
  return true;
}

function createCalendarEventEntry(event, date) {
  const row = document.createElement("li");
  row.className = "routine-entry event-entry";
  const detail = document.createElement("div");
  detail.className = "routine-detail";
  const title = document.createElement("strong");
  title.textContent = event.title;
  const time = document.createElement(event.time ? "time" : "span");
  if (event.time) time.dateTime = `${date}T${event.time}`;
  time.textContent = formatAssignmentTime(event.time);
  const meta = document.createElement("span");
  meta.textContent = `${event.person} · Event${event.recurrence && event.recurrence !== "none" ? ` · ${event.recurrence}` : ""}`;
  if (event.notification) meta.textContent += ` · ${event.notification.kind} ${event.notification.minutesBefore ? `${event.notification.minutesBefore} min before` : "at start"}`;
  detail.append(time, title, meta);
  const remove = document.createElement("button");
  remove.className = "delete-event";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Remove ${event.title}${event.recurrence && event.recurrence !== "none" ? " and all its repeats" : ""}`);
  remove.addEventListener("click", () => commitEventChange(() => {
    events = events.filter((item) => item.id !== event.id);
  }, `${event.title} and its scheduled repeats removed.`));
  row.append(detail, remove);
  return row;
}

function appendCalendarEntries(list, dayEvents, dayAssignments, date) {
  const entries = [
    ...dayEvents.map((plan) => ({ plan, event: true })),
    ...dayAssignments.map((plan) => ({ plan, event: false })),
  ].sort((a, b) => (a.plan.time || "24:00").localeCompare(b.plan.time || "24:00") || a.plan.title.localeCompare(b.plan.title));
  for (const entry of entries) list.append(entry.event
    ? createCalendarEventEntry(entry.plan, date)
    : createRoutineEntry(entry.plan, date));
}

function commitAssignmentChange(change, message) {
  const oldAssignments = structuredClone(assignments);
  const oldMembers = structuredClone(members);
  let storedAssignments;
  let assignmentsSaved = false;
  try {
    storedAssignments = localStorage.getItem("family-fun-assignments");
    change();
    if (!assignments.every(isValidAssignment) || !members.every(isValidMember)) throw new Error("Invalid assignment data");
    localStorage.setItem("family-fun-assignments", JSON.stringify(assignments));
    assignmentsSaved = true;
    localStorage.setItem("family-fun-members", JSON.stringify(members));
  } catch {
    assignments = oldAssignments;
    members = oldMembers;
    let rollbackFailed = false;
    if (assignmentsSaved) {
      try {
        if (storedAssignments === null) localStorage.removeItem("family-fun-assignments");
        else localStorage.setItem("family-fun-assignments", storedAssignments);
      } catch {
        rollbackFailed = true;
      }
    }
    refreshAssignmentViews();
    setAssignmentFeedback(rollbackFailed
      ? "Saving failed and browser storage could not be restored. Export a backup before reloading."
      : "Could not save this change. No chores, tasks, or rewards were changed. Check browser storage and try again.", true);
    return false;
  }
  refreshAssignmentViews();
  setAssignmentFeedback(message);
  return true;
}

function completeAssignment(assignmentId, date) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  const member = members.find((item) => item.id === assignment?.memberId);
  if (!assignment || !member || !isValidDateKey(date) ||
      (assignment.startDate && !isAssignmentDue(assignment, date)) ||
      isAssignmentComplete(assignment, date) || date > toDateKey(new Date())) {
    setAssignmentFeedback("This occurrence is already complete or is not available to complete yet.", true);
    return;
  }
  const balance = assignment.kind === "chore" ? "points" : "stars";
  const newBalance = member[balance] + assignment.reward;
  const earnedMinutes = assignment.kind === "chore" ? assignment.reward : 0;
  const newGameMinutes = (member.gameMinutes || 0) + earnedMinutes;
  if (!Number.isSafeInteger(newBalance) ||
      (earnedMinutes > 0 && !Number.isSafeInteger(newGameMinutes))) {
    setAssignmentFeedback("The reward total is too large to save safely.", true);
    return;
  }
  const saved = commitAssignmentChange(() => {
    if (assignment.recurrence && assignment.recurrence !== "none") assignment.completedDates.push(date);
    else assignment.completed = true;
    member[balance] = newBalance;
    if (earnedMinutes > 0) member.gameMinutes = newGameMinutes;
  }, `${assignment.title} completed${assignment.startDate ? ` for ${formatMealDate(date)}` : ""}. ${assignment.reward
    ? `+${assignment.reward} ${assignment.kind === "chore" ? "game minutes" : "reward stars"}. Reward earned once for this occurrence!`
    : "Checklist step saved. No reward assigned."}`);
  if (saved) {
    celebrateEarnings(member.id, assignment.kind === "task" ? assignment.reward : 0, earnedMinutes);
    if (typeof recordFunActivity === "function") recordFunActivity(member.id, "chore", `Completed: ${assignment.title}`);
  }
}

function createAssignmentCompleteButton(assignment, date) {
  const complete = document.createElement("button");
  const done = isAssignmentComplete(assignment, date);
  const upcoming = date > toDateKey(new Date()) || (assignment.startDate && !isAssignmentDue(assignment, date));
  complete.className = "complete-button";
  complete.type = "button";
  complete.disabled = done || upcoming;
  complete.textContent = done ? "Done" : upcoming ? "Upcoming" : "Complete";
  complete.setAttribute("aria-label", `${assignment.title}: ${done ? "completed" : upcoming ? "upcoming" : "complete"}${assignment.startDate ? ` for ${formatMealDate(date)}` : ""}`);
  complete.addEventListener("click", () => completeAssignment(assignment.id, date));
  return complete;
}

function createAssignmentScheduleEditor(assignment) {
  const form = document.createElement("form");
  form.className = "assignment-schedule-editor";
  form.hidden = true;
  const locked = assignment.completed || Boolean(assignment.completedDates?.length);
  for (const [name, text, type] of [["startDate", "Start date", "date"], ["time", "Time (optional)", "time"], ["recurrence", "Repeat", "select"], ["period", "Routine block", "select"], ["optional", "Checklist type", "select"], ["notificationKind", "Reminder or alarm", "select"], ["minutesBefore", "Alert timing", "select"]]) {
    const label = document.createElement("label");
    label.textContent = text;
    const input = document.createElement(type === "select" ? "select" : "input");
    input.name = name;
    input.setAttribute("aria-label", `${assignment.title}: ${text}`);
    if (type === "select") {
      const options = name === "recurrence"
        ? [["none", "Does not repeat"], ["daily", "Daily"], ["weekdays", "Weekdays (Mon-Fri)"], ["weekly", "Weekly"], ["monthly", "Monthly"]]
        : name === "period"
          ? [["anytime", "Any time"], ["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]]
          : name === "optional"
            ? [["required", "Daily checklist"], ["optional", "Optional quest"]]
            : name === "notificationKind"
              ? [["none", "No alert"], ["reminder", "Reminder"], ["alarm", "Alarm with sound"]]
              : [["0", "At the scheduled time"], ["5", "5 minutes before"], ["15", "15 minutes before"], ["30", "30 minutes before"], ["60", "1 hour before"]];
      for (const [value, title] of options) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = title;
        input.append(option);
      }
    } else input.type = type;
    input.value = {
      startDate: assignment.startDate || (locked ? "" : toDateKey(new Date())),
      time: assignment.time || "",
      recurrence: assignment.recurrence || "none",
      period: assignment.period || "anytime",
      optional: assignment.optional ? "optional" : "required",
      notificationKind: assignment.notification?.kind || "none",
      minutesBefore: String(assignment.notification?.minutesBefore || 0),
    }[name];
    input.required = name === "startDate";
    input.disabled = locked && (name === "startDate" || name === "recurrence");
    label.append(input);
    form.append(label);
  }
  if (canUseParentSettings()) {
    const label = document.createElement("label");
    label.textContent = assignment.kind === "task" ? "Reward stars (star coins)" : "Game minutes";
    const input = document.createElement("input");
    input.name = "reward";
    input.type = "number";
    input.min = "0";
    input.max = "1000";
    input.step = "1";
    input.value = assignment.reward;
    input.required = true;
    input.setAttribute("aria-label", `${assignment.title}: reward for future completions`);
    label.append(input);
    form.append(label);
    const note = document.createElement("p");
    note.className = "fun-note schedule-note";
    note.textContent = "Reward changes apply to future completions only. Past earnings are kept and are not recalculated.";
    form.append(note);
  }
  const save = document.createElement("button");
  save.className = "text-button";
  save.type = "submit";
  save.textContent = "Save schedule";
  form.append(save);
  updateNotificationControls(form);
  form.elements.time.addEventListener("change", () => updateNotificationControls(form));
  form.elements.notificationKind.addEventListener("change", () => updateNotificationControls(form));
  if (locked) {
    const note = document.createElement("p");
    note.className = "fun-note schedule-note";
    note.textContent = "Dates and repeats are fixed after the first completion to preserve reward history. Times, routine blocks, checklist type, and alerts remain editable.";
    form.append(note);
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updated = {
      ...assignment,
      reward: canUseParentSettings() && form.elements.reward ? Number(form.elements.reward.value) : assignment.reward,
      time: form.elements.time.value,
      period: form.elements.period.value,
      optional: form.elements.optional.value === "optional",
      notification: readPlanNotification(form, assignment.notification),
      ...(locked ? {} : {
        startDate: form.elements.startDate.value,
        recurrence: form.elements.recurrence.value,
        completedDates: [],
      }),
    };
    if (updated.notification) {
      updated.notification.notifiedDates = updated.notification.notifiedDates.filter((date) => isAssignmentDue(updated, date));
    }
    if (!isValidAssignment(updated) || (form.elements.reward && (updated.reward < 0 || updated.reward > 1000))) {
      setAssignmentFeedback("Choose a valid schedule and a whole-number reward from 0 to 1,000.", true);
      return;
    }
    if (commitAssignmentChange(() => Object.assign(assignment, updated), `${assignment.title}'s schedule updated.`) && updated.notification) {
      await prepareCalendarAlerts(updated.notification.kind);
    }
  });
  return form;
}

function renderRoutineChart() {
  const anchor = document.getElementById("routine-week").value;
  const selector = document.getElementById("routine-member");
  const previous = selector.options.length ? selector.value : activeMemberId;
  selector.replaceChildren();
  const family = document.createElement("option");
  family.value = "";
  family.textContent = "Whole family";
  selector.append(family);
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    selector.append(option);
  }
  selector.value = members.some((member) => member.id === previous) ? previous : "";
  const chart = document.getElementById("routine-days");
  chart.replaceChildren();
  if (!isValidDateKey(anchor)) {
    document.getElementById("routine-summary").textContent = "Choose a valid date to view its week.";
    return;
  }
  const monday = dateFromKey(anchor);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const memberId = selector.value;
  const active = members.find((member) => member.id === memberId);
  let count = 0;
  let completed = 0;
  let eventCount = 0;
  for (let index = 0; index < 7; index += 1) {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    const key = toDateKey(day);
    const items = getAssignmentsForDate(key, memberId);
    const dayEvents = getEventsForDate(key, memberId);
    const card = document.createElement("section");
    card.className = `routine-day${key === toDateKey(new Date()) ? " is-today" : ""}`;
    const heading = document.createElement("h4");
    const time = document.createElement("time");
    time.dateTime = key;
    time.textContent = day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    heading.append(time);
    card.append(heading);
    const list = document.createElement("ul");
    list.className = "routine-list";
    for (const assignment of items) {
      count += 1;
      if (isAssignmentComplete(assignment, key)) completed += 1;
    }
    eventCount += dayEvents.length;
    appendCalendarEntries(list, dayEvents, items, key);
    if (!items.length && !dayEvents.length) {
      const empty = document.createElement("p");
      empty.className = "fun-note";
      empty.textContent = "Room for a little adventure!";
      card.append(empty);
    }
    card.append(list);
    chart.append(card);
  }
  document.getElementById("routine-summary").textContent =
    `${memberId ? `${active.name}'s routine` : "Family routine"} · Week of ${formatMealDate(toDateKey(monday))} · ${completed} of ${count} tasks complete · ${eventCount} events`;
}

function renderDailyRoutine() {
  if (typeof renderGratitudeJournal === "function") renderGratitudeJournal();
  const member = members.find((candidate) => candidate.id === activeMemberId);
  const panel = document.getElementById("routine-panel");
  if (panel.dataset.memberId !== (member?.id || "")) {
    document.getElementById("routine-feedback").textContent = "";
    panel.dataset.memberId = member?.id || "";
  }
  const rewards = document.getElementById("daily-routine-rewards");
  rewards.replaceChildren();
  if (member) rewards.append(createProfileRewardSummary(member));
  document.getElementById("daily-routine-heading").textContent = member ? `${member.name}'s routine` : "Your daily routine";
  const list = document.getElementById("daily-routine-list");
  const optionalList = document.getElementById("daily-optional-list");
  list.replaceChildren();
  optionalList.replaceChildren();
  const date = document.getElementById("daily-routine-date").value;
  const summary = document.getElementById("daily-routine-summary");
  const progress = document.getElementById("daily-routine-progress");
  progress.max = 1;
  progress.value = 0;
  document.getElementById("daily-optional-quests").hidden = true;
  if (!member || !isValidDateKey(date)) {
    summary.textContent = !member
      ? "Choose who's playing above, or add a profile in Settings to start your routine."
      : "Choose a valid date to see your routine.";
    return;
  }
  const items = getAssignmentsForDate(date, member.id);
  const required = items.filter((item) => !item.optional);
  const optional = items.filter((item) => item.optional);
  const completed = required.filter((item) => isAssignmentComplete(item, date)).length;
  progress.max = Math.max(1, required.length);
  progress.value = completed;
  summary.textContent = `${formatMealDate(date)} · ${required.length
    ? `${completed} of ${required.length} daily responsibilities complete${completed === required.length ? " — all done!" : ""}`
    : "No daily responsibilities scheduled. Plan them in Calendar."}`;
  for (const [period, label] of [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"], ["anytime", "Any time"]]) {
    const block = required.filter((item) => (item.period || "anytime") === period)
      .sort((a, b) => (a.routineOrder ?? Number.MAX_SAFE_INTEGER) - (b.routineOrder ?? Number.MAX_SAFE_INTEGER));
    if (!block.length) continue;
    const heading = document.createElement("li");
    heading.className = "daily-period-heading";
    const title = document.createElement("h4");
    title.textContent = label;
    const count = document.createElement("span");
    count.className = "daily-period-count";
    count.textContent = `${block.filter((item) => isAssignmentComplete(item, date)).length} / ${block.length} done`;
    heading.append(title, count);
    list.append(heading);
    for (const item of block) list.append(createRoutineEntry(item, date, true));
  }
  for (const item of optional) optionalList.append(createRoutineEntry(item, date, true));
  document.getElementById("daily-optional-quests").hidden = !optional.length;
}

function createRoutineEntry(assignment, date, daily = false) {
  const row = document.createElement("li");
  row.className = `routine-entry${isAssignmentComplete(assignment, date) ? " is-complete" : ""}`;
  const detail = document.createElement("div");
  detail.className = "routine-detail";
  const title = document.createElement("strong");
  title.textContent = assignment.title;
  title.className = "routine-task-title";
  const time = document.createElement(assignment.time ? "time" : "span");
  if (assignment.time) time.dateTime = `${date}T${assignment.time}`;
  time.textContent = `\u2022 ${formatAssignmentTime(assignment.time)}`;
  time.className = "routine-time-note";
  const meta = document.createElement("span");
  const member = members.find((item) => item.id === assignment.memberId);
  meta.textContent = `${daily ? "" : `${member.name} · `}${assignment.kind === "chore" ? "Chore" : "Task"}`;
  if (assignment.notification) meta.textContent += ` · ${assignment.notification.kind} ${assignment.notification.minutesBefore ? `${assignment.notification.minutesBefore} min before` : "at start"}`;
  const reward = document.createElement("span");
  reward.className = `routine-reward-badge ${assignment.kind === "task" ? "routine-star-coins" : "routine-game-minutes"}`;
  reward.textContent = assignment.kind === "task"
    ? `\u2605 ${assignment.reward ? "+" : ""}${assignment.reward} ${daily ? assignment.reward === 1 ? "coin" : "coins" : "Reward stars"}`
    : `${daily ? "" : "\u{1F3AE} "}${assignment.reward ? "+" : ""}${assignment.reward} ${daily ? "min" : "game minutes"}`;
  reward.setAttribute("aria-label", `${assignment.reward} ${assignment.kind === "task" ? "reward stars (coins)" : "game minutes"} per completion`);
  reward.title = assignment.reward ? "Earned once when this occurrence is completed."
    : "No reward assigned. An unlocked parent can set a reward in Calendar using Edit schedule & rewards.";
  if (daily) {
    const secondary = document.createElement("div");
    secondary.className = "routine-secondary";
    secondary.append(meta, reward);
    detail.append(title);
    if (assignment.time) detail.append(time);
    detail.append(secondary);
  } else detail.append(title, time, meta, reward);
  row.append(detail, createAssignmentCompleteButton(assignment, date));
  return row;
}

function isValidTodo(todo) {
  return todo &&
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    Array.isArray(todo.memberIds) &&
    todo.memberIds.every((id) => typeof id === "string") &&
    (todo.deadline === "" || typeof todo.deadline === "string") &&
    (todo.reminderAt === "" || typeof todo.reminderAt === "string") &&
    typeof todo.reminded === "boolean" &&
    typeof todo.completed === "boolean";
}

function isValidInventoryItem(item) {
  return item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.amount === "string" &&
    (item.location === "fridge" || item.location === "freezer");
}

function isValidMeal(meal) {
  return meal &&
    typeof meal.id === "string" &&
    (meal.date !== undefined
      ? isValidDateKey(meal.date)
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(meal.day)) &&
    typeof meal.name === "string" &&
    typeof meal.inventoryItemId === "string";
}

function isValidAlert(alert) {
  return alert &&
    typeof alert.id === "string" &&
    typeof alert.title === "string" &&
    typeof alert.memberId === "string" &&
    typeof alert.at === "string" &&
    (alert.kind === "reminder" || alert.kind === "alarm") &&
    typeof alert.triggered === "boolean";
}

function saveRewards() {
  try {
    localStorage.setItem("family-fun-members", JSON.stringify(members));
    localStorage.setItem("family-fun-assignments", JSON.stringify(assignments));
    localStorage.setItem("family-fun-todos", JSON.stringify(todos));
    return true;
  } catch {
    document.getElementById("empty-assignments").textContent =
      "Browser storage is unavailable. Your family rewards may not be saved.";
    return false;
  }
}

function saveTodos() {
  try {
    localStorage.setItem("family-fun-todos", JSON.stringify(todos));
  } catch {
    document.getElementById("todo-feedback").textContent =
      "Browser storage is unavailable. Your to-dos may not be saved.";
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

function saveMealPlanner() {
  try {
    localStorage.setItem("family-fun-inventory", JSON.stringify(inventory));
    localStorage.setItem("family-fun-meals", JSON.stringify(meals));
    return true;
  } catch {
    document.getElementById("meal-feedback").textContent =
      "Browser storage is unavailable. Your meal plan may not be saved.";
    return false;
  }
}

function saveAlerts() {
  try {
    localStorage.setItem("family-fun-alerts", JSON.stringify(alerts));
  } catch {
    document.getElementById("alert-feedback").textContent =
      "Browser storage is unavailable. Your alerts may not be saved.";
  }
}

function createDataExport() {
  let gameCompleted = "";
  try {
    gameCompleted = localStorage.getItem("family-fun-game-completed") || "";
  } catch {
    // Other app data is still available for export.
  }
  return {
    app: "family-fun",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      events,
      members,
      assignments,
      todos,
      inventory,
      meals,
      alerts,
      gameProgress,
      gameAchievements,
      healthyQuest,
      virtualPets,
      funState,
      gameCompleted,
    },
  };
}

function setDataFeedback(message, isError = false) {
  const feedback = document.getElementById("data-feedback");
  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
}

async function exportData() {
  if (!requireParentSettings()) return;
  const content = JSON.stringify(createDataExport(), null, 2);
  const filename = `family-fun-backup-${toDateKey(new Date())}.json`;
  try {
    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        startIn: "documents",
        types: [{
          description: "Family Fun backup",
          accept: { "application/json": [".json"] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      setDataFeedback("Backup saved. Choose your OneDrive folder in the save window to sync it.");
      return;
    }
    const blobUrl = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
    setDataFeedback("Backup downloaded. Move it to OneDrive if your Downloads folder is not synced.");
  } catch (error) {
    if (error?.name === "AbortError") {
      setDataFeedback("Export canceled.");
      return;
    }
    setDataFeedback("The backup could not be saved. Please try again.", true);
  }
}

function validateImportedData(backup) {
  const data = backup?.data;
  if (backup?.app !== "family-fun" || backup.version !== 1 || !data) return null;
  const importedAlerts = data.alerts ?? [];
  const importedGameProgress = data.gameProgress ??
    (data.gameCompleted && data.members?.[0] ? { [data.members[0].id]: data.gameCompleted } : {});
  const importedGameAchievements = data.gameAchievements ??
    Object.fromEntries(Object.entries(importedGameProgress).map(([memberId, date]) => [memberId, [date]]));
  const importedHealthyQuest = data.healthyQuest ?? {};
  const importedVirtualPets = data.virtualPets ?? {};
  const importedFunState = data.funState ?? createDefaultFunState();
  const collections = [
    [data.events, isValidEvent],
    [data.members, isValidMember],
    [data.assignments, isValidAssignment],
    [data.todos, isValidTodo],
    [data.inventory, isValidInventoryItem],
    [data.meals, isValidMeal],
    [importedAlerts, isValidAlert],
  ];
  if (collections.some(([items, validator]) =>
    !Array.isArray(items) || !items.every(validator))) return null;
  if (typeof data.gameCompleted !== "string") return null;
  if (!isValidGameProgress(importedGameProgress)) return null;
  if (!isValidGameAchievements(importedGameAchievements)) return null;
  if (!isValidHealthyQuest(importedHealthyQuest)) return null;
  if (!isValidVirtualPets(importedVirtualPets)) return null;
  if (!isValidFunState(importedFunState, data.members)) return null;
  return {
    ...data,
    alerts: importedAlerts,
    gameProgress: importedGameProgress,
    gameAchievements: importedGameAchievements,
    healthyQuest: importedHealthyQuest,
    virtualPets: importedVirtualPets,
    funState: importedFunState,
  };
}

function importData(data) {
  const values = {
    "family-fun-events": data.events,
    "family-fun-members": data.members,
    "family-fun-assignments": data.assignments,
    "family-fun-todos": data.todos,
    "family-fun-inventory": data.inventory,
    "family-fun-meals": data.meals,
    "family-fun-alerts": data.alerts,
    "family-fun-game-progress": data.gameProgress,
    "family-fun-game-achievements": data.gameAchievements,
    "family-fun-healthy-quest": data.healthyQuest,
    "family-fun-virtual-pets": data.virtualPets,
    "family-fun-extra-fun": data.funState,
  };
  for (const [key, value] of Object.entries(values)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  if (data.gameCompleted) {
    localStorage.setItem("family-fun-game-completed", data.gameCompleted);
  } else {
    localStorage.removeItem("family-fun-game-completed");
  }
  unlockedParentId = "";
  parentSetupUnlocked = false;
  events = data.events;
  members = data.members;
  assignments = data.assignments;
  todos = data.todos;
  inventory = data.inventory;
  meals = data.meals;
  alerts = data.alerts;
  gameProgress = data.gameProgress;
  gameAchievements = data.gameAchievements;
  healthyQuest = data.healthyQuest;
  virtualPets = data.virtualPets;
  funState = data.funState;
  funStorageBlocked = false;
  resetMemoryGame();
  renderCalendar();
  renderAgenda();
  renderRewards();
  renderMealPlanner();
  renderAlerts();
  renderGameForProfile();
}

document.getElementById("export-data").addEventListener("click", exportData);
document.getElementById("import-data").addEventListener("click", () => {
  if (!requireParentSettings()) return;
  document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  input.value = "";
  if (!file || !requireParentSettings()) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!requireParentSettings()) return;
    const data = validateImportedData(backup);
    if (!data) {
      setDataFeedback("That file is not a valid Family Fun backup.", true);
      return;
    }
    if (!window.confirm("Importing will replace the Family Fun data in this browser. Continue?")) {
      setDataFeedback("Import canceled.");
      return;
    }
    importData(data);
    setDataFeedback(`Imported backup from ${file.name}.`);
  } catch {
    setDataFeedback("The selected backup could not be read.", true);
  }
});

function renderMealPlanner() {
  if (typeof renderDinnerSpinner === "function") renderDinnerSpinner();
  const fridgeItems = inventory.filter((item) => item.location === "fridge");
  const freezerItems = inventory.filter((item) => item.location === "freezer");
  renderInventoryList("fridge-list", "empty-fridge", fridgeItems);
  renderInventoryList("freezer-list", "empty-freezer", freezerItems);
  document.getElementById("inventory-count").textContent =
    `${inventory.length} ${inventory.length === 1 ? "item" : "items"}`;

  const itemSelect = document.getElementById("meal-inventory-item");
  const selectedItem = itemSelect.value;
  itemSelect.replaceChildren();
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "No item selected";
  itemSelect.append(emptyOption);
  for (const item of inventory) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} · ${item.location}`;
    option.selected = item.id === selectedItem;
    itemSelect.append(option);
  }

  const mealList = document.getElementById("meal-list");
  mealList.replaceChildren();
  document.getElementById("empty-meals").hidden = meals.length > 0;
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedMeals = [...meals].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date || b.date) return a.date ? -1 : 1;
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });
  for (const meal of sortedMeals) {
    const row = document.createElement("li");
    row.className = "meal-row";
    const day = document.createElement(meal.date ? "time" : "span");
    day.className = "meal-day";
    if (meal.date) {
      day.dateTime = meal.date;
      day.textContent = formatMealDate(meal.date);
    } else {
      day.textContent = `${meal.day} (date not set)`;
    }
    const detail = document.createElement("div");
    detail.className = "meal-detail";
    const name = document.createElement("strong");
    name.textContent = meal.name;
    detail.append(name);
    const item = inventory.find((candidate) => candidate.id === meal.inventoryItemId);
    if (item) {
      const using = document.createElement("span");
      using.textContent = `Using ${item.name} from the ${item.location}`;
      detail.append(using);
    }
    const dateForm = document.createElement("form");
    dateForm.className = "meal-date-form";
    dateForm.hidden = Boolean(meal.date);
    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Meal date";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.required = true;
    dateInput.value = meal.date || "";
    dateInput.setAttribute("aria-label", `Date for ${meal.name}`);
    dateLabel.append(dateInput);
    const saveDate = document.createElement("button");
    saveDate.className = "text-button";
    saveDate.type = "submit";
    saveDate.textContent = "Save date";
    dateForm.append(dateLabel, saveDate);
    dateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isValidDateKey(dateInput.value)) {
        document.getElementById("meal-feedback").textContent = "Choose a valid calendar date for this meal.";
        return;
      }
      meal.date = dateInput.value;
      delete meal.day;
      const saved = saveMealPlanner();
      document.getElementById("meal-feedback").textContent = saved
        ? `${meal.name} planned for ${formatMealDate(meal.date)}.`
        : "Meal date changed for this visit, but could not be saved. Check browser storage.";
      renderMealPlanner();
    });
    if (meal.date) {
      const changeDate = document.createElement("button");
      changeDate.type = "button";
      changeDate.className = "text-button";
      changeDate.textContent = "Change date";
      changeDate.setAttribute("aria-label", `Change date for ${meal.name}`);
      changeDate.addEventListener("click", () => {
        dateForm.hidden = !dateForm.hidden;
        if (!dateForm.hidden) dateInput.focus();
      });
      detail.append(changeDate);
    }
    const remove = createMealPlannerRemoveButton(`Remove ${meal.name}`, () => {
      meals = meals.filter((item) => item.id !== meal.id);
      saveMealPlanner();
      renderMealPlanner();
    });
    row.append(day, detail, remove, dateForm);
    mealList.append(row);
  }
}

function renderAlerts() {
  const memberSelect = document.getElementById("alert-member");
  const selectedMember = memberSelect.value || activeMemberId;
  memberSelect.replaceChildren();
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    option.selected = member.id === selectedMember;
    memberSelect.append(option);
  }
  memberSelect.disabled = members.length === 0;
  document.querySelector("#alert-form button[type='submit']").disabled = members.length === 0;

  const list = document.getElementById("alert-list");
  list.replaceChildren();
  const upcoming = alerts
    .filter((alert) => !alert.triggered)
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  document.getElementById("empty-alerts").hidden = upcoming.length > 0;
  for (const alert of upcoming) {
    const row = document.createElement("li");
    row.className = "alert-row";
    const kind = document.createElement("span");
    kind.className = `alert-kind ${alert.kind}`;
    kind.textContent = alert.kind === "alarm" ? "♪" : "!";
    const detail = document.createElement("div");
    detail.className = "alert-detail";
    const title = document.createElement("strong");
    title.textContent = alert.title;
    const member = members.find((candidate) => candidate.id === alert.memberId);
    const timing = document.createElement("span");
    timing.textContent = `${member?.name || "Family"} · ${new Date(alert.at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;
    detail.append(title, timing);
    const remove = createMealPlannerRemoveButton(`Remove ${alert.title}`, () => {
      alerts = alerts.filter((candidate) => candidate.id !== alert.id);
      saveAlerts();
      renderAlerts();
    });
    row.append(kind, detail, remove);
    list.append(row);
  }
}

function playAlarm() {
  try {
    alarmAudioContext ||= new AudioContext();
    if (alarmAudioContext.state !== "running") return false;
    const start = alarmAudioContext.currentTime;
    for (let index = 0; index < 3; index += 1) {
      const oscillator = alarmAudioContext.createOscillator();
      const gain = alarmAudioContext.createGain();
      oscillator.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, start + index * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.25, start + index * 0.45 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.45 + 0.28);
      oscillator.connect(gain);
      gain.connect(alarmAudioContext.destination);
      oscillator.start(start + index * 0.45);
      oscillator.stop(start + index * 0.45 + 0.3);
    }
    return true;
  } catch {
    return false;
  }
}

async function prepareCalendarAlerts(kind) {
  const warnings = [];
  if (kind === "alarm") {
    try {
      alarmAudioContext ||= new AudioContext();
      await alarmAudioContext.resume();
      if (alarmAudioContext.state !== "running") warnings.push("Sound is blocked by the browser.");
    } catch {
      warnings.push("Sound is unavailable in this browser.");
    }
  }
  if ("Notification" in window) {
    try {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") warnings.push("Browser notifications are not allowed.");
    } catch {
      warnings.push("Browser notification permission could not be requested.");
    }
  } else warnings.push("Browser notifications are unavailable.");
  if (warnings.length) {
    setAssignmentFeedback(`${warnings.join(" ")} In-page alerts still work while this page is open.`, true);
  }
  return warnings.length === 0;
}

function showCalendarNotice(kind, message) {
  const banner = document.getElementById("alarm-banner");
  banner.textContent = `${kind === "alarm" ? "Alarm" : "Reminder"}: ${message}`;
  banner.hidden = false;
  if (kind === "alarm" && !playAlarm()) {
    banner.textContent += " (Sound blocked. Use Enable sound & notifications in Calendar.)";
  }
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(kind === "alarm" ? "Family Fun alarm" : "Family Fun reminder", { body: message });
    } catch {
      setAssignmentFeedback("The browser notification could not be shown. The alert is visible at the top of this page.", true);
    }
  }
}

function checkScheduledNotifications(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dates = [toDateKey(now), toDateKey(tomorrow)];
  for (const [plans, key] of [[events, "family-fun-events"], [assignments, "family-fun-assignments"]]) {
    let changed = false;
    for (const plan of plans) {
      if (!plan.notification) continue;
      for (const date of dates) {
        if (!isAssignmentDue(plan, date) || plan.notification.notifiedDates.includes(date) ||
            (plan.kind && isAssignmentComplete(plan, date))) continue;
        const scheduledAt = new Date(`${date}T${plan.time}`);
        const notifyAt = scheduledAt.getTime() - plan.notification.minutesBefore * 60000;
        if (notifyAt > now.getTime()) continue;
        plan.notification.notifiedDates.push(date);
        changed = true;
        const member = members.find((item) => item.id === plan.memberId);
        showCalendarNotice(plan.notification.kind, `${member?.name || plan.person || "Family"}: ${plan.title} · ${formatAssignmentTime(plan.time)}`);
      }
    }
    if (changed) {
      try {
        localStorage.setItem(key, JSON.stringify(plans));
      } catch {
        setAssignmentFeedback("The alert was shown, but its history could not be saved. It may repeat after reloading. Check browser storage.", true);
      }
    }
  }
}

document.getElementById("enable-calendar-alerts").addEventListener("click", async () => {
  if (await prepareCalendarAlerts("alarm")) {
    setAssignmentFeedback("Sound and notifications are ready while this page stays open. Browser and device sleep settings can delay alerts.");
  }
});

function checkAlerts() {
  const now = Date.now();
  const dueAlerts = alerts.filter((alert) =>
    !alert.triggered && new Date(alert.at).getTime() <= now
  );
  if (!dueAlerts.length) return;
  for (const alert of dueAlerts) {
    alert.triggered = true;
    const member = members.find((candidate) => candidate.id === alert.memberId);
    const message = `${member?.name ? `${member.name}: ` : ""}${alert.title}`;
    showCalendarNotice(alert.kind, message);
  }
  saveAlerts();
  renderAlerts();
}

document.getElementById("alert-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const memberId = form.elements.member.value;
  const at = form.elements.at.value;
  const kind = form.elements.kind.value;
  const timestamp = new Date(at).getTime();
  if (!title || !members.some((member) => member.id === memberId) ||
      !["reminder", "alarm"].includes(kind) || !Number.isFinite(timestamp) ||
      timestamp <= Date.now()) {
    document.getElementById("alert-feedback").textContent =
      "Choose a family member and a time in the future.";
    return;
  }
  if (kind === "alarm") {
    try {
      alarmAudioContext ||= new AudioContext();
      await alarmAudioContext.resume();
    } catch {
      // Notifications and the visible alert still work if audio is blocked.
    }
  }
  if ("Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // In-page alerts remain available if permission cannot be requested.
    }
  }
  alerts.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    memberId,
    at,
    kind,
    triggered: false,
  });
  saveAlerts();
  form.reset();
  form.elements.member.value = activeMemberId;
  document.getElementById("alert-feedback").textContent = "Alert set.";
  renderAlerts();
});

function renderInventoryList(listId, emptyId, items) {
  const list = document.getElementById(listId);
  list.replaceChildren();
  document.getElementById(emptyId).hidden = items.length > 0;
  for (const item of items) {
    const row = document.createElement("li");
    row.className = "inventory-row";
    const detail = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name;
    detail.append(name);
    if (item.amount) {
      const amount = document.createElement("span");
      amount.textContent = item.amount;
      detail.append(amount);
    }
    const remove = createMealPlannerRemoveButton(`Remove ${item.name}`, () => {
      inventory = inventory.filter((candidate) => candidate.id !== item.id);
      saveMealPlanner();
      renderMealPlanner();
    });
    row.append(detail, remove);
    list.append(row);
  }
}

function createMealPlannerRemoveButton(label, onClick) {
  const button = document.createElement("button");
  button.className = "delete-event";
  button.type = "button";
  button.textContent = "×";
  button.setAttribute("aria-label", label);
  button.addEventListener("click", onClick);
  return button;
}

document.getElementById("inventory-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const amount = form.elements.amount.value.trim();
  const location = form.elements.location.value;
  if (!name || !["fridge", "freezer"].includes(location)) return;
  inventory.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    amount,
    location,
  });
  saveMealPlanner();
  form.reset();
  document.getElementById("meal-feedback").textContent = "";
  renderMealPlanner();
});

document.getElementById("meal-date").value = toDateKey(new Date());
document.getElementById("meal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const date = form.elements.date.value;
  const inventoryItemId = form.elements.inventoryItem.value;
  if (!name || !isValidDateKey(date)) {
    document.getElementById("meal-feedback").textContent = "Enter a meal name and a valid calendar date.";
    return;
  }
  if (inventoryItemId && !inventory.some((item) => item.id === inventoryItemId)) {
    document.getElementById("meal-feedback").textContent = "Choose an inventory item that is still available.";
    return;
  }
  meals.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date,
    name,
    inventoryItemId,
  });
  const saved = saveMealPlanner();
  form.reset();
  form.elements.date.value = date;
  document.getElementById("meal-feedback").textContent = saved
    ? `${name} planned for ${formatMealDate(date)}.`
    : "Meal added for this visit, but could not be saved. Check browser storage.";
  renderMealPlanner();
});

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
    const dayEvents = getEventsForDate(key);
    const dayAssignments = getAssignmentsForDate(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(date.getDate());
    button.setAttribute("aria-label", `${date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}` : ""}${dayAssignments.length ? `, ${dayAssignments.length} chores or tasks` : ""}`);
    if (date.getMonth() !== displayedMonth.getMonth()) button.classList.add("outside-month");
    if (key === toDateKey(new Date())) button.classList.add("is-today");
    if (key === selectedDate) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    if (dayEvents.length || dayAssignments.length) {
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
  const dayEvents = getEventsForDate(selectedDate);
  const dayAssignments = getAssignmentsForDate(selectedDate);
  const planCount = dayEvents.length + dayAssignments.length;
  list.replaceChildren();
  document.getElementById("event-count").textContent =
    `${planCount} ${planCount === 1 ? "plan" : "plans"}`;
  document.getElementById("empty-events").hidden = planCount > 0;
  appendCalendarEntries(list, dayEvents, dayAssignments, selectedDate);
}

document.getElementById("today-label").textContent =
  today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

document.getElementById("open-today").addEventListener("click", () => {
  const current = new Date();
  selectedDate = toDateKey(current);
  displayedMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  activateTheme("calendar");
  renderCalendar();
  renderAgenda();
  document.getElementById("calendar-tab").focus({ preventScroll: true });
  document.getElementById("calendar-panel").scrollIntoView({ block: "start" });
});
document.getElementById("open-routine").addEventListener("click", () => {
  document.getElementById("daily-routine-date").value = toDateKey(new Date());
  activateTheme("routine");
  renderDailyRoutine();
  document.getElementById("daily-routine-heading").focus({ preventScroll: true });
  document.getElementById("routine-panel").scrollIntoView({ block: "start" });
});
document.getElementById("daily-routine-date").addEventListener("change", renderDailyRoutine);
document.getElementById("daily-routine-today").addEventListener("click", () => document.getElementById("open-routine").click());
document.getElementById("routine-calendar").addEventListener("click", () => {
  activateTheme("calendar");
  document.getElementById("plan-heading").focus({ preventScroll: true });
  document.getElementById("calendar-plans").scrollIntoView({ block: "start" });
});
function openRewardPage() {
  activateTheme("rewards");
  document.getElementById("rewards-heading").focus({ preventScroll: true });
  document.getElementById("rewards-panel").scrollIntoView({ block: "start" });
}
document.getElementById("open-rewards").addEventListener("click", openRewardPage);
document.getElementById("routine-view-rewards").addEventListener("click", openRewardPage);
document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("open-today").click();
});

document.getElementById("previous-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById("open-plan-form").addEventListener("click", () => {
  assignmentForm.elements.startDate.value = selectedDate;
  document.getElementById("calendar-plans").scrollIntoView({ block: "start" });
  assignmentForm.elements.title.focus({ preventScroll: true });
});

function createProfileRewardSummary(member) {
  const summary = document.createElement("dl");
  summary.className = "profile-reward-summary";
  summary.setAttribute("aria-label", `${member.name}'s rewards and earned game time`);
  for (const [label, value, unit, icon] of [
    ["Game time earned", member.gameMinutes || 0, " min", "\u{1F3AE}"],
    ["Reward stars available", member.stars, ""],
    ["Brain stars earned", member.brainStars || 0, ""],
  ]) {
    const tile = document.createElement("div");
    tile.className = `profile-reward-tile${unit ? " profile-reward-time" : ""}`;
    const title = document.createElement("dt");
    title.textContent = label;
    const badge = document.createElement("span");
    badge.className = "reward-tile-icon";
    badge.textContent = icon || (label === "Reward stars available" ? "\u{2B50}" : "\u{1F9E0}");
    badge.setAttribute("aria-hidden", "true");
    title.prepend(badge);
    const amount = document.createElement("dd");
    const number = document.createElement("strong");
    number.textContent = value.toLocaleString();
    amount.append(number, document.createTextNode(unit));
    tile.append(title, amount);
    summary.append(tile);
  }
  return summary;
}

function renderRewards() {
  const memberList = document.getElementById("member-list");
  memberList.replaceChildren();
  document.getElementById("empty-members").hidden = members.length > 0;
  renderProfileSelector();
  renderPlanAssignees();
  renderTodos();
  document.getElementById("empty-assignments").hidden = assignments.length > 0;

  for (const member of members) {
    const card = document.createElement("article");
    card.className = "member-card";
    const heading = document.createElement("div");
    heading.className = "member-heading";
    const identity = document.createElement("div");
    const name = document.createElement("h4");
    name.textContent = member.name;
    const role = document.createElement("span");
    role.className = "member-role";
    const relationship = member.relationship || (member.role === "child" ? "Kid" : "Adult");
    role.textContent = member.age ? `${relationship} · ${member.age}` : relationship;
    identity.append(name, role);
    heading.append(identity);
    const rewards = createProfileRewardSummary(member);

    const score = document.createElement("p");
    score.className = "goal-score";
    score.textContent = `Chore-history target: ${member.goal} points`;
    const progress = document.createElement("progress");
    progress.max = member.goal;
    progress.value = Math.min(member.points, member.goal);
    progress.setAttribute("aria-label", `${member.name}'s game points goal progress`);
    const goalForm = document.createElement("form");
    goalForm.className = "goal-form";
    const goalLabel = document.createElement("label");
    goalLabel.textContent = "Chore target";
    const goalInput = document.createElement("input");
    goalInput.type = "number";
    goalInput.min = "1";
    goalInput.max = "100000";
    goalInput.value = String(member.goal);
    goalInput.setAttribute("aria-label", `${member.name}'s game points goal`);
    const updateGoal = document.createElement("button");
    updateGoal.className = "text-button";
    updateGoal.type = "submit";
    updateGoal.textContent = "Update";
    goalLabel.append(goalInput);
    goalForm.append(goalLabel, updateGoal);
    goalForm.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      if (!requireParentSettings()) return;
      const newGoal = Number(goalInput.value);
      if (!Number.isInteger(newGoal) || newGoal < 1 || newGoal > 100000) return;
      member.goal = newGoal;
      saveRewards();
      renderRewards();
    });
    const ageForm = document.createElement("form");
    ageForm.className = "goal-form";
    const ageLabel = document.createElement("label");
    ageLabel.textContent = "Age";
    const ageInput = document.createElement("input");
    ageInput.type = "number";
    ageInput.min = "1";
    ageInput.max = "120";
    ageInput.step = "1";
    ageInput.value = member.age ? String(member.age) : "";
    ageInput.setAttribute("aria-label", `${member.name}'s age`);
    const saveAge = document.createElement("button");
    saveAge.className = "text-button";
    saveAge.type = "submit";
    saveAge.textContent = "Update age";
    ageLabel.append(ageInput);
    ageForm.append(ageLabel, saveAge);
    ageForm.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      if (!requireParentSettings()) return;
      const age = ageInput.value ? Number(ageInput.value) : null;
      if (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) {
        document.getElementById("profile-feedback").textContent = "Use a whole-number age between 1 and 120, or leave it blank.";
        return;
      }
      member.age = age;
      const saved = saveRewards();
      if (typeof resetMemoryGame === "function") resetMemoryGame();
      renderRewards();
      renderGameForProfile();
      document.getElementById("profile-feedback").textContent = saved
        ? `${member.name}'s age updated. Game difficulty now matches their profile.`
        : `${member.name}'s age changed for this visit, but could not be saved. Check browser storage.`;
    });
    card.append(heading, rewards, score, progress, goalForm, ageForm);
    if (member.role === "child") {
      const themeLabel = document.createElement("label");
      themeLabel.className = "profile-theme-field";
      themeLabel.textContent = "Play theme";
      const themeSelect = document.createElement("select");
      themeSelect.setAttribute("aria-label", `${member.name}'s play theme`);
      for (const [value, title] of [["blocks", "Block World"], ["cube", "Cube Puzzle"], ["classic", "Classic"]]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = title;
        themeSelect.append(option);
      }
      themeSelect.value = member.playTheme || "blocks";
      themeSelect.addEventListener("change", () => {
        if (!requireParentSettings()) return;
        member.playTheme = themeSelect.value;
        const saved = saveRewards();
        renderRewards();
        renderGameForProfile();
        document.getElementById("profile-feedback").textContent = saved
          ? `${member.name}'s play theme updated.`
          : "Theme changed for this visit, but could not be saved. Check browser storage.";
      });
      themeLabel.append(themeSelect);
      card.append(themeLabel);
    }
    memberList.append(card);
  }

  const assignmentList = document.getElementById("assignment-list");
  assignmentList.replaceChildren();
  for (const assignment of assignments) {
    const member = members.find((candidate) => candidate.id === assignment.memberId);
    if (!member) continue;
    const row = document.createElement("li");
    const occurrenceDate = !assignment.recurrence || assignment.recurrence === "none"
      ? assignment.startDate || toDateKey(new Date()) : toDateKey(new Date());
    row.className = `assignment-row${isAssignmentComplete(assignment, occurrenceDate) ? " is-complete" : ""}`;
    const detail = document.createElement("div");
    detail.className = "assignment-detail";
    const title = document.createElement("span");
    title.className = "assignment-title";
    title.textContent = assignment.title;
    const schedule = document.createElement("span");
    schedule.className = "assignment-schedule";
    schedule.textContent = assignmentScheduleLabel(assignment);
    const editor = createAssignmentScheduleEditor(assignment);
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "text-button";
    edit.textContent = canUseParentSettings() ? "Edit schedule & rewards" : "Edit schedule";
    edit.setAttribute("aria-label", `Edit schedule for ${assignment.title}`);
    edit.setAttribute("aria-expanded", "false");
    edit.addEventListener("click", () => {
      editor.hidden = !editor.hidden;
      edit.setAttribute("aria-expanded", String(!editor.hidden));
      if (!editor.hidden) editor.querySelector("input:not(:disabled)").focus();
    });
    detail.append(title, schedule, edit);
    const assignee = document.createElement("span");
    assignee.className = "assignment-assignee";
    assignee.textContent = member.name;
    const reward = document.createElement("span");
    reward.className = "assignment-reward";
    reward.textContent = !assignment.reward ? "No reward" : assignment.kind === "chore"
      ? `+${assignment.reward} min`
      : `+${assignment.reward} ★`;
    reward.setAttribute("aria-label", assignment.reward
      ? `+${assignment.reward} ${assignment.kind === "chore" ? "game minutes" : "reward stars"}`
      : "Checklist step, no reward");
    const complete = createAssignmentCompleteButton(assignment, occurrenceDate);
    const remove = document.createElement("button");
    remove.className = "delete-event";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${assignment.title}`);
    remove.addEventListener("click", () => {
      commitAssignmentChange(() => {
        assignments = assignments.filter((item) => item.id !== assignment.id);
      }, `${assignment.title} removed from the routine and calendar. Earned rewards are kept.`);
    });
    row.append(detail, assignee, reward, complete, remove, editor);
    assignmentList.append(row);
  }
  renderRoutineChart();
  if (typeof renderFunHub === "function") renderFunHub();
}

function renderProfileSelector() {
  const selector = document.getElementById("active-profile");
  const selectedMember = members.find((member) => member.id === activeMemberId);
  if ((!selectedMember && !parentSetupUnlocked) || (selectedMember?.role === "adult" && !isUnlockedParent(selectedMember))) {
    activeMemberId = members.find((member) => member.role === "child")?.id || "";
  }

  selector.replaceChildren();
  if (!members.length) {
    const option = document.createElement("option");
    option.textContent = "No profiles";
    option.value = "";
    selector.append(option);
    selector.disabled = true;
  } else {
    selector.disabled = false;
    if (!activeMemberId) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a family member";
      placeholder.disabled = true;
      placeholder.selected = true;
      selector.append(placeholder);
    }
    for (const member of members) {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = `${member.name}${member.role === "adult" ? " (parent PIN)" : ""}`;
      option.selected = member.id === activeMemberId;
      selector.append(option);
    }
  }

  const activeMember = members.find((member) => member.id === activeMemberId);
  document.documentElement.dataset.playTheme = activeMember?.role === "child"
    ? activeMember.playTheme || "blocks"
    : "classic";
  document.getElementById("welcome-heading").textContent = activeMember
    ? `Make today a good one, ${activeMember.name}.`
    : "Make today a good one.";
  document.getElementById("active-person-badge").textContent = activeMember
    ? `Playing as ${activeMember.name}` : "Choose who's playing";
  const rewards = document.getElementById("active-profile-rewards");
  rewards.replaceChildren();
  if (activeMember) rewards.append(createProfileRewardSummary(activeMember));
  else {
    const note = document.createElement("p");
    note.className = "fun-note";
    note.textContent = "No profiles yet. A grown-up can use Parent setup to get started.";
    rewards.append(note);
  }
  updateParentControls();
  renderDailyRoutine();
}

const profilePicker = document.getElementById("profile-picker");
document.getElementById("active-person-badge").addEventListener("click", () => {
  renderProfileSelector();
  profilePicker.showModal();
  document.getElementById("active-person-badge").setAttribute("aria-expanded", "true");
  const selector = document.getElementById("active-profile");
  (selector.disabled ? document.getElementById("close-profile-picker") : selector).focus();
});
document.getElementById("close-profile-picker").addEventListener("click", () => profilePicker.close());
profilePicker.addEventListener("close", () => {
  document.getElementById("active-person-badge").setAttribute("aria-expanded", String(profilePicker.open));
});
profilePicker.addEventListener("click", (event) => {
  const bounds = profilePicker.getBoundingClientRect();
  if (event.target === profilePicker &&
      (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
    profilePicker.close();
  }
});
document.getElementById("profile-picker-settings").addEventListener("click", () => {
  profilePicker.close();
  document.getElementById("manage-profiles").click();
});

function applyProfileSelection(memberId) {
  const member = members.find((candidate) => candidate.id === memberId);
  if (!member || (member.role === "adult" && !isUnlockedParent(member))) return;
  if (member.role !== "adult") {
    unlockedParentId = "";
    parentSetupUnlocked = false;
  }
  activeMemberId = memberId;
  document.getElementById("earnings-celebration").hidden = true;
  try {
    localStorage.setItem("family-fun-active-profile", activeMemberId);
  } catch {
    setDataFeedback("Profile changed for this visit, but could not be saved. Check browser storage before closing the page.", true);
  }
  renderRewards();
  document.getElementById("alert-member").value = activeMemberId;
  document.getElementById("routine-member").value = activeMemberId;
  renderRoutineChart();
  renderGameForProfile();
  profilePicker.close();
}
document.getElementById("active-profile").addEventListener("change", (event) => {
  const member = members.find((candidate) => candidate.id === event.currentTarget.value);
  if (member?.role === "adult" && !isUnlockedParent(member)) {
    renderProfileSelector();
    requestParentUnlock(member.id);
  } else applyProfileSelection(event.currentTarget.value);
});

document.getElementById("manage-profiles").addEventListener("click", () => {
  if (!requireParentSettings()) return;
  activateTheme("settings");
  document.getElementById("settings-panel").scrollIntoView({ block: "start" });
  document.getElementById("settings-heading").focus({ preventScroll: true });
});

document.getElementById("member-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requireParentSettings()) return;
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const goal = Number(form.elements.goal.value);
  const age = form.elements.age.value ? Number(form.elements.age.value) : null;
  const relationship = form.elements.relationship.value;
  const playTheme = form.elements.playTheme.value;
  if (parentSetupUnlocked && relationship === "Kid") {
    document.getElementById("profile-feedback").textContent = "Add a parent profile first to finish parent setup.";
    return;
  }
  if (!name || !["Kid", "Mom", "Dad", "Adult"].includes(relationship) ||
      !["blocks", "cube", "classic"].includes(playTheme) ||
      (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) ||
      !Number.isInteger(goal) || goal < 1 || goal > 100000) return;
  const memberId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  members.push({
    id: memberId,
    name,
    role: relationship === "Kid" ? "child" : "adult",
    relationship,
    playTheme: relationship === "Kid" ? playTheme : "classic",
    age,
    goal,
    points: 0,
    stars: 0,
    gameMinutes: 0,
    brainStars: 0,
  });
  activeMemberId = memberId;
  unlockedParentId = relationship === "Kid" ? "" : memberId;
  parentSetupUnlocked = false;
  let selectedProfileSaved = true;
  try {
    localStorage.setItem("family-fun-active-profile", memberId);
  } catch {
    selectedProfileSaved = false;
  }
  const profileSaved = saveRewards();
  form.reset();
  form.elements.goal.value = "100";
  renderRewards();
  renderAlerts();
  document.getElementById("routine-member").value = memberId;
  renderRoutineChart();
  document.getElementById("alert-member").value = memberId;
  renderGameForProfile();
  document.getElementById("profile-feedback").textContent = profileSaved && selectedProfileSaved
    ? `Profile added for ${name}. Select Play Time to start playing.`
    : `Profile added for this visit, but could not be fully saved. Check browser storage before closing the page.`;
});

function renderPlanAssignees() {
  const form = document.getElementById("assignment-form");
  const selector = form.elements.member;
  const previous = selector.value;
  const isEvent = form.elements.kind.value === "event";
  selector.replaceChildren();
  if (isEvent) {
    const everyone = document.createElement("option");
    everyone.value = "";
    everyone.textContent = "Everyone";
    selector.append(everyone);
  }
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    selector.append(option);
  }
  if ([...selector.options].some((option) => option.value === previous)) selector.value = previous;
  else if (members.some((member) => member.id === activeMemberId)) selector.value = activeMemberId;
  selector.required = !isEvent;
  selector.disabled = !isEvent && !members.length;
  form.querySelector("button[type=submit]").disabled = !isEvent && !members.length;
}

function updateNotificationControls(form) {
  if (!form.elements.time.value) form.elements.notificationKind.value = "none";
  form.elements.notificationKind.disabled = !form.elements.time.value;
  form.elements.minutesBefore.disabled = form.elements.notificationKind.value === "none";
}

function updatePlanForm(resetReward = false) {
  const form = document.getElementById("assignment-form");
  const isEvent = form.elements.kind.value === "event";
  const isChore = form.elements.kind.value === "chore";
  document.getElementById("plan-reward-field").hidden = isEvent;
  document.getElementById("plan-optional-field").hidden = isEvent;
  form.elements.optional.disabled = isEvent;
  document.getElementById("plan-period-field").hidden = isEvent;
  form.elements.period.disabled = isEvent;
  form.elements.reward.disabled = isEvent;
  form.elements.reward.required = !isEvent;
  document.getElementById("reward-label").textContent = isChore ? "Game minutes (1 per point)" : "Reward stars";
  if (resetReward) form.elements.reward.value = isChore ? "10" : "1";
  renderPlanAssignees();
  updateNotificationControls(form);
}

const assignmentForm = document.getElementById("assignment-form");
assignmentForm.elements.startDate.value = toDateKey(new Date());
document.getElementById("routine-week").value = toDateKey(new Date());
document.getElementById("daily-routine-date").value = toDateKey(new Date());
updatePlanForm();
assignmentForm.elements.kind.addEventListener("change", () => updatePlanForm(true));
assignmentForm.elements.time.addEventListener("change", () => updateNotificationControls(assignmentForm));
assignmentForm.elements.notificationKind.addEventListener("change", () => updateNotificationControls(assignmentForm));

assignmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = assignmentForm.elements.title.value.trim();
  const member = members.find((candidate) => candidate.id === assignmentForm.elements.member.value);
  const reward = assignmentForm.elements.reward.valueAsNumber;
  const startDate = assignmentForm.elements.startDate.value;
  const time = assignmentForm.elements.time.value;
  const recurrence = assignmentForm.elements.recurrence.value;
  const kind = assignmentForm.elements.kind.value;
  const notification = readPlanNotification(assignmentForm);
  const isEvent = kind === "event";
  if (!title || (!isEvent && (!member || !Number.isInteger(reward) || reward < 0 || reward > 1000)) ||
      (isEvent && assignmentForm.elements.member.value && !member) ||
      !isValidDateKey(startDate) || !["event", "chore", "task"].includes(kind) ||
      !["none", "daily", "weekdays", "weekly", "monthly"].includes(recurrence) ||
      !isValidScheduleOptions({ startDate, time, recurrence, notification })) {
    setAssignmentFeedback("Choose a title, valid date, family member for chores or tasks, and valid schedule. Alerts need a time; rewards must be between 0 and 1000 (0 for a checklist step).", true);
    return;
  }
  const assignment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    memberId: member?.id || "",
    kind,
    reward,
    optional: assignmentForm.elements.optional.checked,
    period: assignmentForm.elements.period.value,
    completed: false,
    startDate,
    time,
    recurrence,
    completedDates: [],
    notification,
  };
  const message = `${title} added to the calendar and routine chart.`;
  const saved = isEvent
    ? commitEventChange(() => events.push({
      id: assignment.id, title, date: startDate, person: member?.name || "Everyone",
      memberId: member?.id || "", time, recurrence, notification,
    }), message)
    : commitAssignmentChange(() => assignments.unshift(assignment), message);
  if (!saved) return;
  selectedDate = startDate;
  const date = dateFromKey(startDate);
  displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  document.getElementById("routine-week").value = startDate;
  document.getElementById("routine-member").value = member?.id || "";
  assignmentForm.reset();
  assignmentForm.elements.startDate.value = startDate;
  updatePlanForm(true);
  renderCalendar();
  renderAgenda();
  renderRoutineChart();
  if (notification) await prepareCalendarAlerts(notification.kind);
});

document.getElementById("routine-week").addEventListener("change", renderRoutineChart);
document.getElementById("routine-member").addEventListener("change", renderRoutineChart);
for (const [id, offset] of [["routine-previous", -7], ["routine-next", 7], ["routine-today", 0]]) {
  document.getElementById(id).addEventListener("click", () => {
    const input = document.getElementById("routine-week");
    const date = offset && isValidDateKey(input.value) ? dateFromKey(input.value) : new Date();
    date.setDate(date.getDate() + offset);
    const key = toDateKey(date);
    if (!isValidDateKey(key)) {
      setAssignmentFeedback("That week is outside the supported date range.", true);
      return;
    }
    input.value = key;
    renderRoutineChart();
  });
}

let routineToday = toDateKey(new Date());
function refreshRoutineDay() {
  const current = toDateKey(new Date());
  if (current === routineToday) return;
  if (document.getElementById("routine-week").value === routineToday) {
    document.getElementById("routine-week").value = current;
  }
  if (document.getElementById("daily-routine-date").value === routineToday) {
    document.getElementById("daily-routine-date").value = current;
  }
  if (selectedDate === routineToday) {
    const previous = dateFromKey(routineToday);
    selectedDate = current;
    if (displayedMonth.getFullYear() === previous.getFullYear() && displayedMonth.getMonth() === previous.getMonth()) {
      const date = dateFromKey(current);
      displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    }
  }
  document.getElementById("today-label").textContent =
    dateFromKey(current).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  routineToday = current;
  refreshAssignmentViews();
}
window.setInterval(refreshRoutineDay, 30000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshRoutineDay();
});

function renderTodos() {
  const memberSelect = document.getElementById("todo-members");
  const selectedMembers = new Set([...memberSelect.selectedOptions].map((option) => option.value));
  memberSelect.replaceChildren();
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    option.selected = selectedMembers.has(member.id);
    memberSelect.append(option);
  }
  memberSelect.disabled = members.length === 0;
  const form = document.getElementById("todo-form");
  form.querySelector("button[type='submit']").disabled = members.length === 0;

  const list = document.getElementById("todo-list");
  list.replaceChildren();
  document.getElementById("empty-todos").hidden = todos.length > 0;
  const incomplete = todos.filter((todo) => !todo.completed).length;
  document.getElementById("todo-count").textContent = `${incomplete} open`;

  for (const todo of todos) {
    const row = document.createElement("li");
    row.className = `todo-row${todo.completed ? " is-complete" : ""}`;
    const complete = document.createElement("button");
    complete.className = "todo-check";
    complete.type = "button";
    complete.textContent = todo.completed ? "✓" : "";
    complete.disabled = todo.completed;
    complete.setAttribute("aria-label", todo.completed ? `${todo.title} completed` : `Complete ${todo.title}`);
    complete.addEventListener("click", () => {
      todo.completed = true;
      saveTodos();
      renderTodos();
    });
    const detail = document.createElement("div");
    detail.className = "todo-detail";
    const title = document.createElement("strong");
    title.textContent = todo.title;
    const assignees = todo.memberIds
      .map((id) => members.find((member) => member.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    const people = document.createElement("span");
    people.className = "todo-assignees";
    people.textContent = assignees || "Family member";
    detail.append(title, people);
    if (todo.deadline) {
      const deadline = document.createElement("span");
      deadline.className = "todo-deadline";
      deadline.textContent = `Due ${new Date(todo.deadline).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`;
      detail.append(deadline);
    }
    if (todo.reminderAt) {
      const reminder = document.createElement("span");
      reminder.className = "todo-reminder";
      reminder.textContent = "Reminder set";
      detail.append(reminder);
    }
    const remove = document.createElement("button");
    remove.className = "delete-event";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${todo.title}`);
    remove.addEventListener("click", () => {
      todos = todos.filter((item) => item.id !== todo.id);
      saveTodos();
      renderTodos();
    });
    row.append(complete, detail, remove);
    list.append(row);
  }
}

function checkTodoReminders() {
  const now = Date.now();
  const dueTodos = todos.filter((todo) =>
    !todo.completed && !todo.reminded && todo.reminderAt &&
    new Date(todo.reminderAt).getTime() <= now
  );
  if (!dueTodos.length) return;
  const titles = dueTodos.map((todo) => todo.title);
  document.getElementById("todo-feedback").textContent =
    `${titles.length === 1 ? "Reminder" : "Reminders"}: ${titles.join(", ")}`;
  for (const todo of dueTodos) {
    todo.reminded = true;
    const message = `Reminder: ${todo.title}`;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Family Fun to-do", { body: message });
    }
  }
  saveTodos();
}

const todoForm = document.getElementById("todo-form");
const reminderToggle = todoForm.elements.reminderEnabled;
const reminderTimeLabel = document.getElementById("reminder-time-label");
const reminderTimeInput = todoForm.elements.reminderAt;
reminderToggle.addEventListener("change", () => {
  reminderTimeLabel.hidden = !reminderToggle.checked;
  reminderTimeInput.disabled = !reminderToggle.checked;
  reminderTimeInput.required = reminderToggle.checked;
});

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = todoForm.elements.title.value.trim();
  const memberIds = [...todoForm.elements.members.selectedOptions].map((option) => option.value);
  const deadline = todoForm.elements.deadline.value;
  const reminderAt = reminderToggle.checked ? reminderTimeInput.value : "";
  if (!title || !memberIds.length ||
      memberIds.some((id) => !members.some((member) => member.id === id))) return;
  if (reminderAt && (!Number.isFinite(new Date(reminderAt).getTime()) ||
      new Date(reminderAt).getTime() <= Date.now())) {
    document.getElementById("todo-feedback").textContent = "Choose a reminder time in the future.";
    return;
  }
  if (deadline && !Number.isFinite(new Date(deadline).getTime())) {
    document.getElementById("todo-feedback").textContent = "Choose a valid deadline.";
    return;
  }
  if (deadline && reminderAt && new Date(reminderAt) > new Date(deadline)) {
    document.getElementById("todo-feedback").textContent = "Set the reminder before the deadline.";
    return;
  }
  if (reminderAt && "Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // In-page reminders remain available if notification permission cannot be requested.
    }
  }
  todos.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    memberIds,
    deadline,
    reminderAt,
    reminded: false,
    completed: false,
  });
  saveTodos();
  todoForm.reset();
  reminderTimeLabel.hidden = true;
  reminderTimeInput.disabled = true;
  reminderTimeInput.required = false;
  document.getElementById("todo-feedback").textContent = "";
  renderTodos();
});

const feedback = document.getElementById("answer-feedback");
const answerButton = document.getElementById("answer-button");
const answerInput = document.getElementById("answer");
let activePuzzle = puzzles[0];

function getPuzzleForProfile(memberId) {
  const dayNumber = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
    Date.UTC(today.getFullYear(), 0, 0)) / 86400000);
  const profileSeed = [...memberId].reduce((total, character) => total + character.charCodeAt(0), 0);
  const solvedCount = gameAchievements[memberId]?.length || 0;
  const seed = dayNumber + profileSeed + solvedCount;
  const member = members.find((candidate) => candidate.id === memberId);
  const puzzleAge = member?.age || (member?.role === "adult" ? 18 : 8);
  if (puzzleAge <= 9) {
    const step = puzzleAge <= 6 ? 1 : 2 + seed % 4;
    const start = 1 + seed % (puzzleAge <= 6 ? 3 : 10);
    return {
      sequence: `${Array.from({ length: 4 }, (_, index) => start + step * index).join(", ")}, ?`,
      hint: `Count forward by ${step}.`,
      answer: start + step * 4,
    };
  }
  const pattern = seed % 5;
  if (pattern === 0) {
    const start = 1 + (seed % 8);
    const step = 2 + (Math.floor(seed / 5) % 7);
    const values = Array.from({ length: 4 }, (_, index) => start + step * index);
    return {
      sequence: `${values.join(", ")}, ?`,
      hint: `Add ${step} each time.`,
      answer: start + step * 4,
    };
  }
  if (pattern === 1) {
    const start = 1 + (seed % 5);
    const values = Array.from({ length: 4 }, (_, index) => start * (2 ** index));
    return {
      sequence: `${values.join(", ")}, ?`,
      hint: "Each number doubles.",
      answer: start * 16,
    };
  }
  if (pattern === 2) {
    const step = 2 + (seed % 6);
    const answer = 3 + (seed % 9);
    const start = answer + step * 4;
    const values = Array.from({ length: 4 }, (_, index) => start - step * index);
    return {
      sequence: `${values.join(", ")}, ?`,
      hint: `Subtract ${step} each time.`,
      answer,
    };
  }
  if (pattern === 3) {
    const start = 1 + (seed % 4);
    const values = Array.from({ length: 4 }, (_, index) => (start + index) ** 2);
    return {
      sequence: `${values.join(", ")}, ?`,
      hint: "These are square numbers.",
      answer: (start + 4) ** 2,
    };
  }
  const first = 1 + (seed % 4);
  const second = first + 1 + (seed % 3);
  const third = first + second;
  const fourth = second + third;
  return {
    sequence: `${first}, ${second}, ${third}, ${fourth}, ?`,
    hint: "Add the last two numbers.",
    answer: third + fourth,
  };
}

function calculateGameStreak(dates) {
  const completed = new Set(dates);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!completed.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderGameRewards(member) {
  const container = document.getElementById("game-rewards");
  container.replaceChildren();
  if (!member) return;
  const choreProgress = document.createElement("p");
  choreProgress.className = "fun-note";
  choreProgress.textContent = "Chores add 1 game minute per point. Brain-game badges add bonus minutes to the same earned total.";
  if (member.role !== "child") {
    const note = document.createElement("p");
    note.className = "adult-game-note";
    note.textContent = "Brain games award reward stars, brain stars, and badges to kids. Everyone can earn game minutes from chores.";
    container.append(note, choreProgress);
    return;
  }
  const arcadeDates = typeof getArcadeCompletionDates === "function"
    ? getArcadeCompletionDates(member.id)
    : [];
  const completedDates = [...(gameAchievements[member.id] || []), ...arcadeDates];
  const dates = [...new Set(completedDates)].sort();
  const earnedCount = completedDates.length;
  const streak = calculateGameStreak(dates);
  const brainStars = member.brainStars || 0;
  const summary = document.createElement("div");
  summary.className = "game-reward-summary";
  summary.innerHTML = `
    <span><strong>${earnedCount}</strong> challenges</span>
    <span><strong>${streak}</strong> day streak</span>
    <span><strong>${brainStars}</strong> brain stars</span>
    <span><strong>${member.gameMinutes || 0}</strong> game mins</span>
  `;
  const heading = document.createElement("div");
  heading.className = "badge-heading";
  const title = document.createElement("h3");
  title.textContent = "Badge trail";
  const nextBadge = gameBadges.find((badge) => badge.count > brainStars);
  const progress = document.createElement("span");
  progress.textContent = nextBadge
    ? `${nextBadge.count - brainStars} more brain stars to ${nextBadge.name} + 10 game mins`
    : `${100 - (brainStars % 100)} more brain stars to the next +10 game mins`;
  heading.append(title, progress);
  const grid = document.createElement("div");
  grid.className = "badge-grid";
  for (const badge of gameBadges) {
    const earned = brainStars >= badge.count;
    const item = document.createElement("div");
    item.className = `badge-item${earned ? " is-earned" : ""}`;
    item.title = earned
      ? `${badge.name} earned`
      : `Earn ${badge.count} brain stars to unlock ${badge.name}`;
    const icon = document.createElement("span");
    icon.className = "badge-icon";
    icon.textContent = badge.icon;
    const label = document.createElement("strong");
    label.textContent = badge.name;
    const requirement = document.createElement("small");
    requirement.textContent = `${badge.count} brain stars · +10 min`;
    item.append(icon, label, requirement);
    grid.append(item);
  }
  container.append(summary, choreProgress, heading, grid);
}

function getHealthyEntry(memberId) {
  healthyQuest[memberId] ||= {};
  healthyQuest[memberId][todayKey] ||= {
    plants: [],
    proteins: [],
    fats: [],
    water: 0,
    rewarded: false,
  };
  const entry = healthyQuest[memberId][todayKey];
  entry.proteins ||= [];
  entry.fats ||= [];
  for (const key of ["plants", "proteins", "fats"]) {
    entry[key] = entry[key].map((food) =>
      typeof food === "string" ? { name: food, occasion: "Previously logged" } : food
    );
  }
  return entry;
}

function saveHealthyQuest() {
  try {
    localStorage.setItem("family-fun-healthy-quest", JSON.stringify(healthyQuest));
    return true;
  } catch {
    document.getElementById("healthy-feedback").textContent =
      "Browser storage is unavailable. Healthy Quest progress may not be saved.";
    return false;
  }
}

function saveVirtualPets() {
  try {
    localStorage.setItem("family-fun-virtual-pets", JSON.stringify(virtualPets));
  } catch {
    document.getElementById("healthy-feedback").textContent =
      "Browser storage is unavailable. Your virtual pet may not be saved.";
  }
}

function getLifetimePlantPoints(memberId) {
  return Object.values(healthyQuest[memberId] || {})
    .reduce((total, entry) => total + getHealthyPoints(entry.plants), 0);
}

function getPetFeedingStreak(memberId) {
  const entries = healthyQuest[memberId] || {};
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (getHealthyPoints(entries[toDateKey(cursor)]?.plants || []) < petDailyPlantGoal) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (getHealthyPoints(entries[toDateKey(cursor)]?.plants || []) >= petDailyPlantGoal) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderVirtualPet(member) {
  const form = document.getElementById("pet-form");
  const display = document.getElementById("pet-display");
  if (!member) {
    form.hidden = true;
    display.hidden = true;
    return;
  }
  const pet = virtualPets[member.id];
  if (!pet) {
    form.hidden = false;
    display.hidden = true;
    form.elements.name.value = "";
    return;
  }

  form.hidden = true;
  display.hidden = false;
  const totalPlants = getLifetimePlantPoints(member.id);
  const todayPlants = getHealthyPoints(getHealthyEntry(member.id).plants);
  const stageIndex = petGrowthStages.findLastIndex((stage) => totalPlants >= stage.minimum);
  const stage = petGrowthStages[Math.max(stageIndex, 0)];
  const nextStage = petGrowthStages[stageIndex + 1];
  const fedToday = todayPlants >= petDailyPlantGoal;
  const streak = getPetFeedingStreak(member.id);
  const avatar = document.getElementById("pet-avatar");
  avatar.textContent = stageIndex === 0 ? stage.icon : petTypes[pet.type];
  avatar.className = `pet-avatar stage-${stageIndex}${fedToday ? " is-fed" : " is-hungry"}`;
  document.getElementById("pet-stage").textContent = stage.name;
  document.getElementById("virtual-pet-heading").textContent = pet.name;
  document.getElementById("pet-message").textContent = fedToday
    ? `${pet.name} is happy, energized, and ready to grow!`
    : `${pet.name} is hungry—add ${Math.max(petDailyPlantGoal - todayPlants, 0)} more plant point${petDailyPlantGoal - todayPlants === 1 ? "" : "s"} today.`;
  document.getElementById("pet-fed-status").textContent =
    `🌿 ${Math.min(todayPlants, petDailyPlantGoal)} / ${petDailyPlantGoal} fed`;
  document.getElementById("pet-streak").textContent = `🔥 ${streak} day streak`;
  document.getElementById("pet-total-plants").textContent = `✨ ${totalPlants} growth points`;
  if (typeof decoratePet === "function") decoratePet(member);

  const progress = document.getElementById("pet-growth-progress");
  if (nextStage) {
    progress.max = nextStage.minimum - stage.minimum;
    progress.value = totalPlants - stage.minimum;
    document.getElementById("pet-growth-message").textContent =
      `${nextStage.minimum - totalPlants} more plant points to become ${nextStage.name}`;
  } else {
    progress.min = 0;
    progress.max = Math.max(totalPlants, 1);
    progress.value = totalPlants;
    document.getElementById("pet-growth-message").textContent =
      `${pet.name} reached the legendary stage!`;
  }
}

function awardHealthyQuestIfComplete(member, entry) {
  if (entry.rewarded ||
      getHealthyPoints(entry.plants) < plantPointGoal ||
      getHealthyPoints(entry.proteins) < proteinPointGoal ||
      getHealthyPoints(entry.fats) < healthyFatPointGoal ||
      entry.water < waterCupGoal) return false;
  entry.rewarded = true;
  member.stars += 1;
  const questSaved = saveHealthyQuest();
  const rewardSaved = saveRewards();
  renderRewards();
  if (questSaved && rewardSaved) celebrateEarnings(member.id, 1);
  document.getElementById("healthy-feedback").textContent =
    `${member.name} completed the Healthy Hero Quest and earned a bonus reward star!`;
  showCelebration({
    icon: "🏆",
    title: `${member.name} is a Healthy Hero!`,
    quote: pickQuote(badgeQuotes),
    target: document.querySelector(".healthy-quest"),
    activity: "healthy",
  });
  return true;
}

function renderHealthyQuest(member) {
  const controls = document.querySelectorAll(
    "#healthy-food-form input, #healthy-food-form select, #healthy-food-form button, #remove-water, #add-water"
  );
  for (const control of controls) control.disabled = !member;
  const entry = member
    ? getHealthyEntry(member.id)
    : { plants: [], proteins: [], fats: [], water: 0, rewarded: false };
  const plants = getHealthyPoints(entry.plants);
  const proteins = getHealthyPoints(entry.proteins);
  const fats = getHealthyPoints(entry.fats);
  document.getElementById("plant-point-count").textContent =
    `${plants} / ${plantPointGoal}`;
  document.getElementById("plant-progress").value = Math.min(plants, plantPointGoal);
  document.getElementById("protein-point-count").textContent =
    `${proteins} / ${proteinPointGoal}`;
  document.getElementById("protein-progress").value =
    Math.min(proteins, proteinPointGoal);
  document.getElementById("fat-point-count").textContent =
    `${fats} / ${healthyFatPointGoal}`;
  document.getElementById("fat-progress").value =
    Math.min(fats, healthyFatPointGoal);
  document.getElementById("water-cup-count").textContent =
    `${entry.water} / ${waterCupGoal}`;
  document.getElementById("water-progress").value = Math.min(entry.water, waterCupGoal);
  document.getElementById("water-control-count").textContent =
    `${entry.water} ${entry.water === 1 ? "cup" : "cups"}`;
  document.getElementById("remove-water").disabled = !member || entry.water === 0;
  document.getElementById("add-water").disabled = !member || entry.water >= 30;

  const plantList = document.getElementById("plant-list");
  plantList.replaceChildren();
  const foodGroups = [
    { key: "plants", label: "Plant", items: entry.plants },
    { key: "proteins", label: "Protein", items: entry.proteins },
    { key: "fats", label: "Healthy fat", items: entry.fats },
  ];
  for (const group of foodGroups) {
    group.items.forEach((food, foodIndex) => {
      const chip = document.createElement("span");
      chip.className = `plant-chip ${group.key}`;
      const label = document.createElement("span");
      const points = food.points ?? 1;
      const description = `${points} ${points === 1 ? "point" : "points"}${food.name ? ` (${food.name})` : ""}`;
      label.textContent = `${food.occasion} · ${group.label}: ${description}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${group.label.toLowerCase()} ${description} from ${food.occasion}`);
      remove.addEventListener("click", () => {
        entry[group.key] = entry[group.key].filter((_, index) => index !== foodIndex);
        saveHealthyQuest();
        renderHealthyQuest(member);
      });
      chip.append(label, remove);
      plantList.append(chip);
    });
  }

  const badgeDefinitions = [
    { earned: plants >= 1, icon: "🌱", name: "First Plant" },
    { earned: plants >= plantPointGoal, icon: "🌈", name: "Plant Power" },
    { earned: proteins >= proteinPointGoal, icon: "💪", name: "Protein Power" },
    { earned: fats >= healthyFatPointGoal, icon: "🥑", name: "Good Fats" },
    { earned: entry.water >= waterCupGoal, icon: "💧", name: "Water Hero" },
    {
      earned: plants >= plantPointGoal &&
        proteins >= proteinPointGoal &&
        fats >= healthyFatPointGoal &&
        entry.water >= waterCupGoal,
      icon: "🏆",
      name: "Healthy Hero",
    },
  ];
  const badges = document.getElementById("healthy-badges");
  badges.replaceChildren();
  for (const badge of badgeDefinitions) {
    const item = document.createElement("div");
    item.className = `healthy-badge${badge.earned ? " is-earned" : ""}`;
    item.innerHTML = `<span>${badge.icon}</span><strong>${badge.name}</strong>`;
    badges.append(item);
  }
  renderVirtualPet(member);
  if (typeof renderFunHub === "function") renderFunHub();
}

function renderGameForProfile() {
  const member = members.find((candidate) => candidate.id === activeMemberId);
  document.getElementById("game-heading").textContent = member
    ? `${member.name}'s Play Time`
    : "Play Time";
  document.getElementById("game-intro").textContent = member
    ? `Brain games, pet care, and little adventures for ${member.name}.`
    : "Use the Playing as button above to choose a family member.";
  activePuzzle = getPuzzleForProfile(member?.id || "family");
  document.getElementById("puzzle-prompt").textContent = activePuzzle.sequence;
  document.getElementById("puzzle-hint").textContent = activePuzzle.hint;
  feedback.textContent = "";
  feedback.classList.remove("is-incorrect");
  answerInput.value = "";
  answerInput.disabled = !member;
  answerButton.disabled = !member;
  renderGameRewards(member);
  renderHealthyQuest(member);
}

document.getElementById("pet-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = members.find((candidate) => candidate.id === activeMemberId);
  if (!member) return;
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const type = form.elements.type.value;
  if (!name || !Object.hasOwn(petTypes, type)) return;
  virtualPets[member.id] = { name, type };
  saveVirtualPets();
  renderVirtualPet(member);
  if (typeof renderFunHub === "function") renderFunHub();
  document.getElementById("healthy-feedback").textContent =
    `${name} joined ${member.name}'s Healthy Hero Quest!`;
});

document.getElementById("customize-pet").addEventListener("click", () => {
  const member = members.find((candidate) => candidate.id === activeMemberId);
  const pet = member ? virtualPets[member.id] : null;
  if (!pet) return;
  const form = document.getElementById("pet-form");
  form.elements.type.value = pet.type;
  form.elements.name.value = pet.name;
  form.hidden = false;
});

document.getElementById("healthy-food-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = members.find((candidate) => candidate.id === activeMemberId);
  if (!member) return;
  const form = event.currentTarget;
  const points = form.elements.points.valueAsNumber;
  const category = form.elements.category.value;
  const occasion = form.elements.occasion.value;
  const entry = getHealthyEntry(member.id);
  if (!Number.isSafeInteger(points) || points < 1 || !occasion ||
      !["plants", "proteins", "fats"].includes(category)) {
    document.getElementById("healthy-feedback").textContent =
      "Choose a category and meal, and enter a positive whole number of points.";
    return;
  }
  const previousPoints = getHealthyPoints(entry[category]);
  if (!Number.isSafeInteger(previousPoints + points)) {
    document.getElementById("healthy-feedback").textContent =
      "That total is too large. Enter fewer points.";
    return;
  }
  const plantsAtThisMeal = getHealthyPoints(entry.plants.filter((item) => item.occasion === occasion));
  entry[category].push({ points, occasion });
  saveHealthyQuest();
  form.reset();
  document.getElementById("healthy-feedback").textContent =
    `${points} ${points === 1 ? "point" : "points"} added for ${member.name}!`;
  const badgeTargets = {
    plants: { count: plantPointGoal, icon: "🌈", name: "Plant Power" },
    proteins: { count: proteinPointGoal, icon: "💪", name: "Protein Power" },
    fats: { count: healthyFatPointGoal, icon: "🥑", name: "Good Fats" },
  };
  const badge = badgeTargets[category];
  if (previousPoints < badge.count && previousPoints + points >= badge.count) {
    showCelebration({
      icon: badge.icon,
      title: `${badge.name} badge unlocked!`,
      quote: pickQuote(badgeQuotes),
      target: document.querySelector(".healthy-quest"),
    });
  }
  if (category === "plants" && plantsAtThisMeal < 6 && plantsAtThisMeal + points >= 6) {
    showCelebration({
      icon: "🌿",
      title: `Six plant points at ${occasion}!`,
      quote: pickQuote(plantQuotes),
      target: document.querySelector(".healthy-quest"),
    });
  }
  awardHealthyQuestIfComplete(member, entry);
  renderHealthyQuest(member);
});

document.getElementById("add-water").addEventListener("click", () => {
  const member = members.find((candidate) => candidate.id === activeMemberId);
  if (!member) return;
  const entry = getHealthyEntry(member.id);
  entry.water = Math.min(entry.water + 1, 30);
  saveHealthyQuest();
  document.getElementById("healthy-feedback").textContent =
    `Water logged for ${member.name}.`;
  if (entry.water === waterCupGoal) {
    showCelebration({
      icon: "💧",
      title: "Water Hero badge unlocked!",
      quote: pickQuote(badgeQuotes),
      target: document.querySelector(".healthy-quest"),
    });
  }
  awardHealthyQuestIfComplete(member, entry);
  renderHealthyQuest(member);
});

document.getElementById("remove-water").addEventListener("click", () => {
  const member = members.find((candidate) => candidate.id === activeMemberId);
  if (!member) return;
  const entry = getHealthyEntry(member.id);
  entry.water = Math.max(entry.water - 1, 0);
  saveHealthyQuest();
  renderHealthyQuest(member);
});

document.getElementById("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = members.find((candidate) => candidate.id === activeMemberId);
  if (!member) return;
  if (Number(answerInput.value) === activePuzzle.answer) {
    gameAchievements[member.id] ||= [];
    gameAchievements[member.id].push(todayKey);
    let earnedBrainBadge = false;
    if (member.role === "child") {
      const previousBadgeCount = Math.floor((member.brainStars || 0) / 100);
      member.brainStars = (member.brainStars || 0) + 1;
      const newBadgeCount = Math.floor(member.brainStars / 100);
      member.stars += 1;
      if (newBadgeCount > previousBadgeCount) {
        member.gameMinutes = (member.gameMinutes || 0) + (newBadgeCount - previousBadgeCount) * 10;
        earnedBrainBadge = true;
      }
      const rewardSaved = saveRewards();
      renderRewards();
      if (rewardSaved) celebrateEarnings(member.id, 1, earnedBrainBadge ? 10 : 0);
    }
    try {
      localStorage.setItem("family-fun-game-achievements", JSON.stringify(gameAchievements));
    } catch {
      // Keep the current session usable even if progress cannot be saved.
    }
    if (member.role === "child") {
      feedback.textContent = member.brainStars % 100 === 0
        ? `${member.name} earned a Brain Booster badge and 10 screen-time minutes!`
        : `${member.name} solved it and earned a reward star and a brain star!`;
    } else {
      feedback.textContent = `${member.name} solved it! Here's the next puzzle.`;
    }
    showCelebration({
      icon: earnedBrainBadge ? "🏅" : "✨",
      title: earnedBrainBadge
        ? `${member.name} unlocked a Brain Booster badge!`
        : `${member.name} solved it!`,
      quote: pickQuote(earnedBrainBadge ? badgeQuotes : puzzleQuotes),
      target: document.querySelector(".puzzle"),
      activity: "brain",
    });
    renderGameRewards(member);
    activePuzzle = getPuzzleForProfile(member.id);
    document.getElementById("puzzle-prompt").textContent = activePuzzle.sequence;
    document.getElementById("puzzle-hint").textContent = activePuzzle.hint;
    answerInput.value = "";
    answerInput.focus();
  } else {
    feedback.textContent = "Not quite—try again!";
    feedback.classList.add("is-incorrect");
    answerInput.select();
  }
});

renderCalendar();
renderAgenda();
renderRewards();
renderMealPlanner();
renderAlerts();
renderGameForProfile();
checkTodoReminders();
checkAlerts();
checkScheduledNotifications();
window.setInterval(checkTodoReminders, 30000);
window.setInterval(checkAlerts, 1000);
window.setInterval(checkScheduledNotifications, 1000);
