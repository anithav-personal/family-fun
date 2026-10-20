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
  const tabs = [...document.querySelectorAll("[data-theme-tab]")];
  if (!tabs.some((tab) => tab.dataset.themeTab === theme)) theme = "calendar";
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
    const currentIndex = themeTabs.indexOf(tab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + themeTabs.length) % themeTabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % themeTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = themeTabs.length - 1;
    activateTheme(themeTabs[nextIndex].dataset.themeTab, true);
  });
}

let initialTheme = "calendar";
try {
  initialTheme = localStorage.getItem("family-fun-active-tab") || initialTheme;
} catch {
  // Use the calendar tab when browser storage is unavailable.
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

function pickQuote(quotes) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function showCelebration({ icon, title, quote, target }) {
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

function isValidHealthyQuest(quest) {
  const isValidFood = (food) =>
    typeof food === "string" ||
    (food &&
      typeof food.name === "string" &&
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
        (entry.proteins === undefined ||
          (Array.isArray(entry.proteins) &&
            entry.proteins.every(isValidFood))) &&
        (entry.fats === undefined ||
          (Array.isArray(entry.fats) &&
            entry.fats.every(isValidFood))) &&
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
    typeof event.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
    typeof event.title === "string" &&
    typeof event.person === "string";
}

function isValidAssignment(assignment) {
  return assignment &&
    typeof assignment.id === "string" &&
    typeof assignment.memberId === "string" &&
    typeof assignment.title === "string" &&
    (assignment.kind === "chore" || assignment.kind === "task") &&
    Number.isInteger(assignment.reward) && assignment.reward > 0 &&
    typeof assignment.completed === "boolean";
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
    typeof meal.day === "string" &&
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
  } catch {
    document.getElementById("empty-assignments").textContent =
      "Browser storage is unavailable. Your family rewards may not be saved.";
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
  } catch {
    document.getElementById("meal-feedback").textContent =
      "Browser storage is unavailable. Your meal plan may not be saved.";
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
  return {
    ...data,
    alerts: importedAlerts,
    gameProgress: importedGameProgress,
    gameAchievements: importedGameAchievements,
    healthyQuest: importedHealthyQuest,
    virtualPets: importedVirtualPets,
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
  };
  for (const [key, value] of Object.entries(values)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  if (data.gameCompleted) {
    localStorage.setItem("family-fun-game-completed", data.gameCompleted);
  } else {
    localStorage.removeItem("family-fun-game-completed");
  }
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
  renderCalendar();
  renderAgenda();
  renderRewards();
  renderMealPlanner();
  renderAlerts();
  renderGameForProfile();
}

document.getElementById("export-data").addEventListener("click", exportData);
document.getElementById("import-data").addEventListener("click", () => {
  document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
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
  const sortedMeals = [...meals].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  for (const meal of sortedMeals) {
    const row = document.createElement("li");
    row.className = "meal-row";
    const day = document.createElement("span");
    day.className = "meal-day";
    day.textContent = meal.day.slice(0, 3);
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
    const remove = createMealPlannerRemoveButton(`Remove ${meal.name}`, () => {
      meals = meals.filter((item) => item.id !== meal.id);
      saveMealPlanner();
      renderMealPlanner();
    });
    row.append(day, detail, remove);
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
  } catch {
    // The visible alert and browser notification remain available without audio.
  }
}

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
    const banner = document.getElementById("alarm-banner");
    banner.textContent = `${alert.kind === "alarm" ? "Alarm" : "Reminder"}: ${message}`;
    banner.hidden = false;
    if (alert.kind === "alarm") playAlarm();
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(alert.kind === "alarm" ? "Family Fun alarm" : "Family Fun reminder", {
        body: message,
      });
    }
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

document.getElementById("meal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const day = form.elements.day.value;
  const inventoryItemId = form.elements.inventoryItem.value;
  if (!name || !["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day)) return;
  if (inventoryItemId && !inventory.some((item) => item.id === inventoryItemId)) return;
  meals.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    day,
    name,
    inventoryItemId,
  });
  saveMealPlanner();
  form.reset();
  document.getElementById("meal-feedback").textContent = "";
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

function renderRewards() {
  const memberList = document.getElementById("member-list");
  memberList.replaceChildren();
  document.getElementById("empty-members").hidden = members.length > 0;
  renderProfileSelector();
  const childMembers = members.filter((member) => member.role === "child");
  const memberSelect = document.getElementById("assignment-member");
  memberSelect.replaceChildren();
  for (const child of childMembers) {
    const option = document.createElement("option");
    option.value = child.id;
    option.textContent = child.name;
    memberSelect.append(option);
  }
  renderTodos();
  memberSelect.disabled = childMembers.length === 0;
  document.querySelector("#assignment-form button[type='submit']").disabled = childMembers.length === 0;
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
    const stars = document.createElement("span");
    stars.className = "member-stars";
    const gameMinutes = member.gameMinutes || 0;
    stars.textContent = member.role === "child"
      ? `★ ${member.stars} · 🎮 ${gameMinutes} min`
      : `★ ${member.stars}`;
    stars.setAttribute("aria-label", member.role === "child"
      ? `${member.stars} stars and ${gameMinutes} screen-time minutes`
      : `${member.stars} stars`);
    heading.append(identity, stars);

    const score = document.createElement("p");
    score.className = "goal-score";
    score.textContent = `${member.points} / ${member.goal} points`;
    const progress = document.createElement("progress");
    progress.max = member.goal;
    progress.value = Math.min(member.points, member.goal);
    progress.setAttribute("aria-label", `${member.name}'s points goal progress`);
    const goalForm = document.createElement("form");
    goalForm.className = "goal-form";
    const goalLabel = document.createElement("label");
    goalLabel.textContent = "Goal";
    const goalInput = document.createElement("input");
    goalInput.type = "number";
    goalInput.min = "1";
    goalInput.max = "100000";
    goalInput.value = String(member.goal);
    goalInput.setAttribute("aria-label", `${member.name}'s points goal`);
    const updateGoal = document.createElement("button");
    updateGoal.className = "text-button";
    updateGoal.type = "submit";
    updateGoal.textContent = "Update";
    goalLabel.append(goalInput);
    goalForm.append(goalLabel, updateGoal);
    goalForm.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      const newGoal = Number(goalInput.value);
      if (!Number.isInteger(newGoal) || newGoal < 1 || newGoal > 100000) return;
      member.goal = newGoal;
      saveRewards();
      renderRewards();
    });
    card.append(heading, score, progress, goalForm);
    memberList.append(card);
  }

  const assignmentList = document.getElementById("assignment-list");
  assignmentList.replaceChildren();
  for (const assignment of assignments) {
    const member = members.find((candidate) => candidate.id === assignment.memberId);
    if (!member) continue;
    const row = document.createElement("li");
    row.className = `assignment-row${assignment.completed ? " is-complete" : ""}`;
    const title = document.createElement("span");
    title.className = "assignment-title";
    title.textContent = assignment.title;
    const assignee = document.createElement("span");
    assignee.className = "assignment-assignee";
    assignee.textContent = member.name;
    const reward = document.createElement("span");
    reward.className = "assignment-reward";
    reward.textContent = assignment.kind === "chore"
      ? `+${assignment.reward} pts`
      : `+${assignment.reward} ★`;
    const complete = document.createElement("button");
    complete.className = "complete-button";
    complete.type = "button";
    complete.disabled = assignment.completed;
    complete.textContent = assignment.completed ? "Done ✓" : "Complete";
    complete.setAttribute("aria-label", assignment.completed
      ? `${assignment.title} completed`
      : `Mark ${assignment.title} complete`);
    complete.addEventListener("click", () => {
      if (assignment.completed) return;
      assignment.completed = true;
      if (assignment.kind === "chore") member.points += assignment.reward;
      else member.stars += assignment.reward;
      saveRewards();
      renderRewards();
    });
    const remove = document.createElement("button");
    remove.className = "delete-event";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${assignment.title}`);
    remove.addEventListener("click", () => {
      assignments = assignments.filter((item) => item.id !== assignment.id);
      saveRewards();
      renderRewards();
    });
    row.append(title, assignee, reward, complete, remove);
    assignmentList.append(row);
  }
}

function renderProfileSelector() {
  const selector = document.getElementById("active-profile");
  const eventPerson = document.getElementById("event-person");
  const selectedEventPerson = eventPerson.value;
  if (!members.some((member) => member.id === activeMemberId)) {
    activeMemberId = members[0]?.id || "";
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
    for (const member of members) {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.name;
      option.selected = member.id === activeMemberId;
      selector.append(option);
    }
  }

  eventPerson.replaceChildren();
  const everyone = document.createElement("option");
  everyone.value = "Everyone";
  everyone.textContent = "Everyone";
  eventPerson.append(everyone);
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.name;
    option.textContent = member.name;
    eventPerson.append(option);
  }
  const activeMember = members.find((member) => member.id === activeMemberId);
  const eventPersonExists = [...eventPerson.options]
    .some((option) => option.value === selectedEventPerson);
  eventPerson.value = eventPersonExists
    ? selectedEventPerson
    : (activeMember?.name || "Everyone");
  document.getElementById("welcome-heading").textContent = activeMember
    ? `Make today a good one, ${activeMember.name}.`
    : "Make today a good one.";
}

document.getElementById("active-profile").addEventListener("change", (event) => {
  activeMemberId = event.currentTarget.value;
  try {
    localStorage.setItem("family-fun-active-profile", activeMemberId);
  } catch {
    // The selected profile remains active for this page session.
  }
  renderProfileSelector();
  const activeMember = members.find((member) => member.id === activeMemberId);
  document.getElementById("event-person").value = activeMember?.name || "Everyone";
  document.getElementById("alert-member").value = activeMemberId;
  renderGameForProfile();
});

document.getElementById("member-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const goal = Number(form.elements.goal.value);
  const age = form.elements.age.value ? Number(form.elements.age.value) : null;
  const relationship = form.elements.relationship.value;
  if (!name || !["Kid", "Mom", "Dad", "Adult"].includes(relationship) ||
      (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) ||
      !Number.isInteger(goal) || goal < 1 || goal > 100000) return;
  members.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    role: relationship === "Kid" ? "child" : "adult",
    relationship,
    age,
    goal,
    points: 0,
    stars: 0,
    gameMinutes: 0,
    brainStars: 0,
  });
  saveRewards();
  form.reset();
  form.elements.goal.value = "100";
  renderRewards();
});

const assignmentForm = document.getElementById("assignment-form");
assignmentForm.elements.kind.addEventListener("change", () => {
  const isChore = assignmentForm.elements.kind.value === "chore";
  document.getElementById("reward-label").textContent = isChore ? "Points" : "Stars";
  assignmentForm.elements.reward.value = isChore ? "10" : "1";
});

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = assignmentForm.elements.title.value.trim();
  const member = members.find((candidate) => candidate.id === assignmentForm.elements.member.value);
  const reward = Number(assignmentForm.elements.reward.value);
  if (!title || !member || member.role !== "child" ||
      !Number.isInteger(reward) || reward < 1 || reward > 1000) return;
  assignments.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    memberId: member.id,
    kind: assignmentForm.elements.kind.value,
    reward,
    completed: false,
  });
  saveRewards();
  assignmentForm.reset();
  document.getElementById("reward-label").textContent = "Points";
  assignmentForm.elements.reward.value = "10";
  renderRewards();
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
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
  if (member.role !== "child") {
    const note = document.createElement("p");
    note.className = "adult-game-note";
    note.textContent = "Kids earn stars and badges here. Grown-ups can still play for fun!";
    container.append(note);
    return;
  }
  const dates = [...new Set(gameAchievements[member.id] || [])].sort();
  const earnedCount = dates.length;
  const streak = calculateGameStreak(dates);
  const brainStars = member.brainStars || 0;
  const summary = document.createElement("div");
  summary.className = "game-reward-summary";
  summary.innerHTML = `
    <span><strong>${earnedCount}</strong> challenges</span>
    <span><strong>${streak}</strong> day streak</span>
    <span><strong>${brainStars}</strong> brain stars</span>
    <span><strong>${member.gameMinutes || 0}</strong> screen mins</span>
  `;
  const heading = document.createElement("div");
  heading.className = "badge-heading";
  const title = document.createElement("h3");
  title.textContent = "Badge trail";
  const nextBadge = gameBadges.find((badge) => badge.count > brainStars);
  const progress = document.createElement("span");
  progress.textContent = nextBadge
    ? `${nextBadge.count - brainStars} more stars to ${nextBadge.name} + 10 screen mins`
    : `${100 - (brainStars % 100)} more stars to the next +10 screen mins`;
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
    requirement.textContent = `${badge.count} stars · +10 min`;
    item.append(icon, label, requirement);
    grid.append(item);
  }
  container.append(summary, heading, grid);
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
  } catch {
    document.getElementById("healthy-feedback").textContent =
      "Browser storage is unavailable. Healthy Quest progress may not be saved.";
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
    .reduce((total, entry) => total + entry.plants.length, 0);
}

function getPetFeedingStreak(memberId) {
  const entries = healthyQuest[memberId] || {};
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if ((entries[toDateKey(cursor)]?.plants.length || 0) < petDailyPlantGoal) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while ((entries[toDateKey(cursor)]?.plants.length || 0) >= petDailyPlantGoal) {
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
  const todayPlants = getHealthyEntry(member.id).plants.length;
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
      entry.plants.length < plantPointGoal ||
      entry.proteins.length < proteinPointGoal ||
      entry.fats.length < healthyFatPointGoal ||
      entry.water < waterCupGoal) return false;
  entry.rewarded = true;
  member.stars += 1;
  saveHealthyQuest();
  saveRewards();
  renderRewards();
  document.getElementById("healthy-feedback").textContent =
    `${member.name} completed the Healthy Hero Quest and earned a bonus star!`;
  showCelebration({
    icon: "🏆",
    title: `${member.name} is a Healthy Hero!`,
    quote: pickQuote(badgeQuotes),
    target: document.querySelector(".healthy-quest"),
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
  document.getElementById("plant-point-count").textContent =
    `${entry.plants.length} / ${plantPointGoal}`;
  document.getElementById("plant-progress").value = Math.min(entry.plants.length, plantPointGoal);
  document.getElementById("protein-point-count").textContent =
    `${entry.proteins.length} / ${proteinPointGoal}`;
  document.getElementById("protein-progress").value =
    Math.min(entry.proteins.length, proteinPointGoal);
  document.getElementById("fat-point-count").textContent =
    `${entry.fats.length} / ${healthyFatPointGoal}`;
  document.getElementById("fat-progress").value =
    Math.min(entry.fats.length, healthyFatPointGoal);
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
      label.textContent = `${food.occasion} · ${group.label}: ${food.name}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${food.name} from ${food.occasion}`);
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
    { earned: entry.plants.length >= 1, icon: "🌱", name: "First Plant" },
    { earned: entry.plants.length >= plantPointGoal, icon: "🌈", name: "Plant Power" },
    { earned: entry.proteins.length >= proteinPointGoal, icon: "💪", name: "Protein Power" },
    { earned: entry.fats.length >= healthyFatPointGoal, icon: "🥑", name: "Good Fats" },
    { earned: entry.water >= waterCupGoal, icon: "💧", name: "Water Hero" },
    {
      earned: entry.plants.length >= plantPointGoal &&
        entry.proteins.length >= proteinPointGoal &&
        entry.fats.length >= healthyFatPointGoal &&
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
}

function renderGameForProfile() {
  const member = members.find((candidate) => candidate.id === activeMemberId);
  document.getElementById("game-heading").textContent = member
    ? `${member.name}'s brain break`
    : "Brain break";
  document.getElementById("game-intro").textContent = member
    ? `A quick puzzle picked for ${member.name}.`
    : "Choose a family profile to play.";
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
  const food = form.elements.food.value.trim();
  const category = form.elements.category.value;
  const occasion = form.elements.occasion.value;
  const entry = getHealthyEntry(member.id);
  const plantsAtThisMeal = entry.plants.filter((item) => item.occasion === occasion).length;
  if (!food || !occasion || !["plants", "proteins", "fats"].includes(category)) return;
  if (entry[category].some((item) =>
    item.name.toLowerCase() === food.toLowerCase() && item.occasion === occasion)) {
    document.getElementById("healthy-feedback").textContent =
      `${food} is already counted for ${occasion}. Add it under another meal or snack if eaten again.`;
    return;
  }
  entry[category].push({ name: food, occasion });
  saveHealthyQuest();
  form.reset();
  document.getElementById("healthy-feedback").textContent =
    `Food point added for ${member.name}!`;
  const badgeTargets = {
    plants: { count: plantPointGoal, icon: "🌈", name: "Plant Power" },
    proteins: { count: proteinPointGoal, icon: "💪", name: "Protein Power" },
    fats: { count: healthyFatPointGoal, icon: "🥑", name: "Good Fats" },
  };
  const badge = badgeTargets[category];
  if (entry[category].length === badge.count) {
    showCelebration({
      icon: badge.icon,
      title: `${badge.name} badge unlocked!`,
      quote: pickQuote(badgeQuotes),
      target: document.querySelector(".healthy-quest"),
    });
  }
  if (category === "plants" && plantsAtThisMeal === 5) {
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
      saveRewards();
      renderRewards();
    }
    try {
      localStorage.setItem("family-fun-game-achievements", JSON.stringify(gameAchievements));
    } catch {
      // Keep the current session usable even if progress cannot be saved.
    }
    if (member.role === "child") {
      feedback.textContent = member.brainStars % 100 === 0
        ? `${member.name} earned a Brain Booster badge and 10 screen-time minutes!`
        : `${member.name} solved it and earned a brain star!`;
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
window.setInterval(checkTodoReminders, 30000);
window.setInterval(checkAlerts, 1000);
