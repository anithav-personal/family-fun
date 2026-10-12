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
let members = readStoredArray("family-fun-members", isValidMember);
let assignments = readStoredArray("family-fun-assignments", isValidAssignment);
let todos = readStoredArray("family-fun-todos", isValidTodo);
let meals = readStoredArray("family-fun-meals", isValidMeal);
let pantryItems = readStoredArray("family-fun-pantry", isValidPantryItem);

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

function readStoredArray(key, isValid) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(stored) ? stored.filter(isValid) : [];
  } catch {
    return [];
  }
}

function isValidMember(member) {
  return member &&
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    (member.role === "child" || member.role === "adult") &&
    Number.isInteger(member.goal) && member.goal > 0 &&
    Number.isInteger(member.points) && member.points >= 0 &&
    Number.isInteger(member.stars) && member.stars >= 0;
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

function isValidMeal(meal) {
  return meal &&
    typeof meal.id === "string" &&
    typeof meal.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(meal.date) &&
    typeof meal.type === "string" &&
    typeof meal.name === "string";
}

function isValidPantryItem(item) {
  return item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.quantity === "string" &&
    (item.location === "fridge" || item.location === "freezer") &&
    (item.expires === "" || typeof item.expires === "string");
}

function saveMeals() {
  try {
    localStorage.setItem("family-fun-meals", JSON.stringify(meals));
  } catch {
    document.getElementById("meal-feedback").textContent =
      "Browser storage is unavailable. Your meal plan may not be saved.";
  }
}

function savePantry() {
  try {
    localStorage.setItem("family-fun-pantry", JSON.stringify(pantryItems));
  } catch {
    document.getElementById("pantry-feedback").textContent =
      "Browser storage is unavailable. Your food list may not be saved.";
  }
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
    role.textContent = member.role === "child" ? "Kid" : "Adult";
    identity.append(name, role);
    const stars = document.createElement("span");
    stars.className = "member-stars";
    stars.textContent = `★ ${member.stars}`;
    stars.setAttribute("aria-label", `${member.stars} stars`);
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

document.getElementById("member-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const goal = Number(form.elements.goal.value);
  if (!name || !Number.isInteger(goal) || goal < 1 || goal > 100000) return;
  members.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    role: form.elements.role.value,
    goal,
    points: 0,
    stars: 0,
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

function renderMeals() {
  const list = document.getElementById("meal-list");
  list.replaceChildren();
  document.getElementById("empty-meals").hidden = meals.length > 0;
  const sortedMeals = [...meals].sort((left, right) =>
    left.date.localeCompare(right.date) ||
    ["Breakfast", "Lunch", "Dinner", "Snack"].indexOf(left.type) -
      ["Breakfast", "Lunch", "Dinner", "Snack"].indexOf(right.type)
  );

  for (const meal of sortedMeals) {
    const row = document.createElement("li");
    row.className = "meal-row";
    row.dataset.mealId = meal.id;
    const date = document.createElement("span");
    date.className = "meal-date";
    date.textContent = dateFromKey(meal.date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const type = document.createElement("span");
    type.className = "meal-type";
    type.textContent = meal.type;
    const name = document.createElement("span");
    name.className = "meal-name";
    name.textContent = meal.name;
    const edit = document.createElement("button");
    edit.className = "text-button";
    edit.type = "button";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${meal.type}: ${meal.name}`);
    edit.addEventListener("click", () => editMeal(meal));
    const remove = document.createElement("button");
    remove.className = "delete-event";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${meal.type}: ${meal.name}`);
    remove.addEventListener("click", () => {
      meals = meals.filter((item) => item.id !== meal.id);
      saveMeals();
      renderMeals();
    });
    row.append(date, type, name, edit, remove);
    list.append(row);
  }
}

function editMeal(meal) {
  const list = document.getElementById("meal-list");
  const row = [...list.children].find((child) => child.dataset.mealId === meal.id);
  if (!row) return;
  row.replaceChildren();
  row.className = "meal-edit-row";
  const form = document.createElement("form");
  form.className = "meal-edit-form";
  const date = document.createElement("input");
  date.type = "date";
  date.value = meal.date;
  date.required = true;
  date.setAttribute("aria-label", "Meal date");
  const type = document.createElement("select");
  type.setAttribute("aria-label", "Meal type");
  for (const optionText of ["Breakfast", "Lunch", "Dinner", "Snack"]) {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    option.selected = meal.type === optionText;
    type.append(option);
  }
  const name = document.createElement("input");
  name.value = meal.name;
  name.maxLength = 100;
  name.required = true;
  name.setAttribute("aria-label", "Meal plan");
  const save = document.createElement("button");
  save.className = "text-button";
  save.type = "submit";
  save.textContent = "Save";
  const cancel = document.createElement("button");
  cancel.className = "text-button";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", renderMeals);
  form.append(date, type, name, save, cancel);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!date.value || !name.value.trim()) return;
    meal.date = date.value;
    meal.type = type.value;
    meal.name = name.value.trim();
    saveMeals();
    renderMeals();
  });
  row.append(form);
}

function renderPantry() {
  for (const location of ["fridge", "freezer"]) {
    const items = pantryItems.filter((item) => item.location === location);
    const list = document.getElementById(`${location}-list`);
    list.replaceChildren();
    document.getElementById(`empty-${location}`).hidden = items.length > 0;
    document.getElementById(`${location}-count`).textContent =
      `${items.length} ${items.length === 1 ? "item" : "items"}`;
    for (const item of items) {
      const row = document.createElement("li");
      row.className = "pantry-row";
      row.dataset.itemId = item.id;
      const detail = document.createElement("div");
      detail.className = "pantry-item-detail";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const quantity = document.createElement("span");
      quantity.textContent = item.quantity;
      detail.append(name, quantity);
      if (item.expires) {
        const expiration = document.createElement("span");
        expiration.className = "pantry-expiration";
        expiration.textContent = `Use by ${dateFromKey(item.expires).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}`;
        detail.append(expiration);
      }
      const edit = document.createElement("button");
      edit.className = "text-button";
      edit.type = "button";
      edit.textContent = "Edit";
      edit.setAttribute("aria-label", `Edit ${item.name}`);
      edit.addEventListener("click", () => editPantryItem(item));
      const remove = document.createElement("button");
      remove.className = "delete-event";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${item.name}`);
      remove.addEventListener("click", () => {
        pantryItems = pantryItems.filter((candidate) => candidate.id !== item.id);
        savePantry();
        renderPantry();
      });
      row.append(detail, edit, remove);
      list.append(row);
    }
  }
}

function editPantryItem(item) {
  const row = document.querySelector(`[data-item-id="${CSS.escape(item.id)}"]`);
  if (!row) return;
  row.replaceChildren();
  row.className = "pantry-edit-row";
  const form = document.createElement("form");
  form.className = "pantry-edit-form";
  const name = document.createElement("input");
  name.value = item.name;
  name.maxLength = 80;
  name.required = true;
  name.setAttribute("aria-label", "Food item");
  const quantity = document.createElement("input");
  quantity.value = item.quantity;
  quantity.maxLength = 40;
  quantity.required = true;
  quantity.setAttribute("aria-label", "Quantity");
  const location = document.createElement("select");
  location.setAttribute("aria-label", "Storage location");
  for (const value of ["fridge", "freezer"]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "fridge" ? "Fridge" : "Freezer";
    option.selected = item.location === value;
    location.append(option);
  }
  const expires = document.createElement("input");
  expires.type = "date";
  expires.value = item.expires;
  expires.setAttribute("aria-label", "Use by date");
  const save = document.createElement("button");
  save.className = "text-button";
  save.type = "submit";
  save.textContent = "Save";
  const cancel = document.createElement("button");
  cancel.className = "text-button";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", renderPantry);
  form.append(name, quantity, location, expires, save, cancel);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!name.value.trim() || !quantity.value.trim()) return;
    item.name = name.value.trim();
    item.quantity = quantity.value.trim();
    item.location = location.value;
    item.expires = expires.value;
    savePantry();
    renderPantry();
  });
  row.append(form);
}

const mealForm = document.getElementById("meal-form");
mealForm.elements.date.value = todayKey;
mealForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = mealForm.elements.name.value.trim();
  const date = mealForm.elements.date.value;
  if (!name || !date || !Number.isFinite(dateFromKey(date).getTime()) ||
      toDateKey(dateFromKey(date)) !== date) return;
  meals.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date,
    type: mealForm.elements.type.value,
    name,
  });
  saveMeals();
  mealForm.elements.name.value = "";
  renderMeals();
});

const pantryForm = document.getElementById("pantry-form");
pantryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = pantryForm.elements.name.value.trim();
  const quantity = pantryForm.elements.quantity.value.trim();
  const expires = pantryForm.elements.expires.value;
  if (!name || !quantity) return;
  if (expires && toDateKey(dateFromKey(expires)) !== expires) {
    document.getElementById("pantry-feedback").textContent = "Choose a valid use-by date.";
    return;
  }
  pantryItems.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    quantity,
    location: pantryForm.elements.location.value,
    expires,
  });
  savePantry();
  pantryForm.reset();
  document.getElementById("pantry-feedback").textContent = "";
  renderPantry();
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
renderRewards();
renderMeals();
renderPantry();
checkTodoReminders();
window.setInterval(checkTodoReminders, 30000);
