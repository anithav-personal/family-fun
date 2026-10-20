const petShopItems = [
  { id: "party-hat", slot: "hat", icon: "\u{1F389}", name: "Party hat", cost: 3 },
  { id: "crown", slot: "hat", icon: "\u{1F451}", name: "Royal crown", cost: 5 },
  { id: "garden", slot: "scene", icon: "\u{1F33B}", name: "Sunny garden", cost: 4 },
  { id: "space", slot: "scene", icon: "\u{1F680}", name: "Space adventure", cost: 6 },
  { id: "ball", slot: "toy", icon: "\u{26BD}", name: "Bouncy ball", cost: 2 },
  { id: "kite", slot: "toy", icon: "\u{1FA81}", name: "Rainbow kite", cost: 4 },
];
const bingoActivities = [
  "Read together", "Help tidy a room", "Try a new vegetable",
  "Give someone a compliment", "Draw something together", "Play a board game",
  "Help prepare a meal", "Tell a funny story", "Dance to a favorite song",
  "Teach someone something", "Water a plant", "Make a thank-you card",
  "Build something together", "Do a puzzle together", "Put away your toys",
];
const mysteryQuests = [
  "Make a thank-you drawing for someone who helps you.",
  "Find three things at home that start with the same letter.",
  "Invent a silly dance and teach it to someone.",
  "Build a tiny tower from safe, soft things you already have.",
  "Tell someone three things you appreciate about them.",
  "Draw an imaginary animal and give it a funny name.",
  "Help put away five things, then give yourself a high five.",
];
const adventureChapters = [
  { at: 0, name: "Home base", story: "A tiny map arrives. Your family packs kindness, curiosity, and a little courage." },
  { at: 5, name: "Giggle Grove", story: "The giggling trees welcome your team. A friendly fox points toward a sparkling creek." },
  { at: 15, name: "Puzzle Bridge", story: "Together you solve the bridge keeper's puzzle and cross into a valley of colorful flowers." },
  { at: 30, name: "Rainbow Valley", story: "Your little acts of teamwork bring every color back to the valley. A balloon is ready!" },
  { at: 50, name: "Cloud Castle", story: "The clouds lift your family to a castle where every room holds a new discovery." },
  { at: 80, name: "Star Harbor", story: "You reach the harbor of stars. The real treasure was every small win you shared along the way." },
];
const arcadeGames = ["word", "math", "memory", "riddle", "odd", "pattern"];
const funStorageKey = "family-fun-extra-fun";
let funStorageBlocked = false;
let funState = readFunState();
let memoryRound = null;
let memoryTimer;
let arcadePracticeRound = 0;
let arcadeProfileId = "";
let currentArcadeChallenge = null;

function createDefaultFunState() {
  return { version: 1, profiles: {}, bingo: {}, rewards: [], requests: [], wall: [], steps: 0 };
}

function isFunText(value, max = 200) {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function isFunDate(value) {
  return isValidDateKey(value);
}

function isValidFunState(state, family = members) {
  const object = (value) => value && typeof value === "object" && !Array.isArray(value);
  const memberIds = new Set(family.map((member) => member.id));
  const memberExists = (id) => typeof id === "string" && memberIds.has(id);
  const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;
  const validIds = new Set(petShopItems.map((item) => item.id));
  if (!object(state) || state.version !== 1 || !object(state.profiles) ||
      !object(state.bingo) || !Number.isSafeInteger(state.steps) || state.steps < 0 ||
      !Array.isArray(state.rewards) || !Array.isArray(state.requests) || !Array.isArray(state.wall)) return false;
  if (!Object.entries(state.profiles).every(([id, profile]) =>
    memberExists(id) && object(profile) && Array.isArray(profile.owned) &&
    profile.owned.every((item) => validIds.has(item)) &&
    new Set(profile.owned).size === profile.owned.length && object(profile.equipped) &&
    Object.entries(profile.equipped).every(([slot, itemId]) =>
      ["hat", "scene", "toy"].includes(slot) && profile.owned.includes(itemId) &&
      petShopItems.some((item) => item.id === itemId && item.slot === slot)) &&
    object(profile.quests) && Object.entries(profile.quests).every(([date, quest]) =>
      isFunDate(date) && object(quest) && Number.isInteger(quest.index) &&
      quest.index >= 0 && quest.index < mysteryQuests.length &&
      typeof quest.revealed === "boolean" && typeof quest.completed === "boolean" &&
      (!quest.completed || quest.revealed)) &&
    object(profile.arcade) && Object.entries(profile.arcade).every(([date, games]) =>
      isFunDate(date) && Array.isArray(games) && new Set(games).size === games.length &&
      games.every((game) => arcadeGames.includes(game))))) return false;
  if (!Object.entries(state.bingo).every(([date, board]) =>
    isFunDate(date) && dateFromKey(date).getDay() === 1 && object(board) &&
    Array.isArray(board.cells) && board.cells.length === 9 &&
    board.cells.every((id) => id === "" || memberExists(id)) && typeof board.claimed === "boolean")) return false;
  if (!state.rewards.every((reward) => object(reward) && isFunText(reward.id, 100) &&
    isFunText(reward.title, 60) && Number.isInteger(reward.cost) &&
    reward.cost >= 1 && reward.cost <= 10000) || !uniqueIds(state.rewards)) return false;
  if (!state.requests.every((request) => object(request) && isFunText(request.id, 100) &&
    memberExists(request.memberId) && isFunText(request.title, 60) &&
    Number.isInteger(request.cost) && request.cost >= 1 && request.cost <= 10000 &&
    ["pending", "approved", "delivered", "canceled"].includes(request.status) &&
    isFunDate(request.date)) || !uniqueIds(state.requests)) return false;
  return state.wall.every((win) => object(win) && isFunText(win.id, 100) &&
    memberExists(win.memberId) && isFunText(win.title, 200) &&
    isFunDate(win.date) && isFunText(win.kind, 30)) && uniqueIds(state.wall);
}

function readFunState() {
  try {
    const raw = localStorage.getItem(funStorageKey);
    if (!raw) return createDefaultFunState();
    const stored = JSON.parse(raw);
    if (!isValidFunState(stored)) {
      funStorageBlocked = true;
      setDataFeedback("Extra play data is invalid. Its stored copy has not been overwritten; export or recover a valid backup before saving new play progress.", true);
      return createDefaultFunState();
    }
    return stored;
  } catch {
    funStorageBlocked = true;
    setDataFeedback("Extra play data could not be loaded. Check browser storage or recover a valid backup.", true);
    return createDefaultFunState();
  }
}

function funMessage(message, error = false) {
  const element = document.getElementById("fun-feedback");
  element.textContent = message;
  element.classList.toggle("is-error", error);
}

function getFunMember() {
  return members.find((member) => member.id === activeMemberId);
}

function getFunProfile(memberId) {
  if (!Object.hasOwn(funState.profiles, memberId)) {
    Object.defineProperty(funState.profiles, memberId, {
      value: { owned: [], equipped: {}, quests: {}, arcade: {} },
      configurable: true, enumerable: true, writable: true,
    });
  }
  return funState.profiles[memberId];
}

function funId() {
  return crypto.randomUUID();
}

function addWallWin(memberId, title, kind) {
  funState.wall.unshift({ id: funId(), memberId, title: title.slice(0, 200), kind, date: toDateKey(new Date()) });
}

function addAdventureStep(memberId, title, kind) {
  funState.steps += 1;
  addWallWin(memberId, title, kind);
  const chapter = adventureChapters.find((item) => item.at === funState.steps);
  if (chapter) addWallWin(memberId, `Family unlocked ${chapter.name}!`, "adventure");
}

function commitFunChange(change, message = "") {
  if (funStorageBlocked) {
    funMessage("Extra play storage could not be loaded safely. Recover a valid backup before saving new play progress.", true);
    return false;
  }
  const oldState = structuredClone(funState);
  const oldMembers = members.map((member) => ({ member, value: { ...member } }));
  let storedMembers;
  let membersSaved = false;
  try {
    storedMembers = localStorage.getItem("family-fun-members");
    change();
    if (!isValidFunState(funState) || members.some((member) => !Number.isSafeInteger(member.stars) || member.stars < 0)) {
      throw new Error("Invalid play data");
    }
    localStorage.setItem("family-fun-members", JSON.stringify(members));
    membersSaved = true;
    localStorage.setItem(funStorageKey, JSON.stringify(funState));
  } catch {
    funState = oldState;
    for (const { member, value } of oldMembers) Object.assign(member, value);
    let rollbackFailed = false;
    if (membersSaved) {
      try {
        if (storedMembers === null) localStorage.removeItem("family-fun-members");
        else localStorage.setItem("family-fun-members", storedMembers);
      } catch {
        rollbackFailed = true;
      }
    }
    funMessage(rollbackFailed
      ? "Saving failed and browser storage could not be restored. Export a backup before reloading."
      : "Could not save this action. No stars or progress were changed. Check browser storage and try again.", true);
    return false;
  }
  if (message) funMessage(message);
  renderRewards();
  renderGameRewards(getFunMember());
  return true;
}

function recordFunActivity(memberId, kind, title) {
  if (!members.some((member) => member.id === memberId)) return;
  commitFunChange(() => {
    if (["brain", "chore", "healthy"].includes(kind)) addAdventureStep(memberId, title, kind);
    else addWallWin(memberId, title, kind);
  });
}

function funElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function funButton(text, action, disabled = false) {
  const button = funElement("button", text, "text-button");
  button.type = "button";
  button.disabled = disabled;
  button.addEventListener("click", action);
  return button;
}

function ageLevel(member) {
  if (!member?.age) return member?.role === "adult" ? 3 : 1;
  if (member.age <= 6) return 0;
  if (member.age <= 9) return 1;
  if (member.age <= 12) return 2;
  return 3;
}

function ageDescription(member) {
  return ["Ages 6 and under", "Ages 7-9", "Ages 10-12", "Teens & grown-ups"][ageLevel(member)];
}

function getArcadeCompletionDates(memberId) {
  const profile = funState.profiles[memberId];
  return profile ? Object.entries(profile.arcade).flatMap(([date, games]) => games.map(() => date)) : [];
}

function funSeed(member, day = toDateKey(new Date())) {
  return [...`${day}:${member?.id || ""}`].reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) >>> 0, 0);
}

function shuffleFun(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function getArcadeChallenge(member, game, round = 0) {
  const level = ageLevel(member);
  const seed = (funSeed(member) + round) >>> 0;
  const choose = (sets) => sets[level][seed % sets[level].length];
  if (game === "word") {
    const [answer, hint] = choose([
      [["cat", "A pet that says meow"], ["sun", "It shines in the daytime"], ["dog", "A pet that barks"], ["red", "The color of a ripe strawberry"]],
      [["planet", "Earth is one"], ["garden", "A place to grow flowers"], ["rabbit", "An animal with long ears"], ["pencil", "Use it to write"]],
      [["journey", "A trip from one place to another"], ["weather", "Sun, rain, or snow"], ["library", "A place to borrow books"], ["dolphin", "A clever ocean mammal"]],
      [["curiosity", "The desire to learn"], ["adventure", "An exciting experience"], ["telescope", "Use it to view distant stars"], ["ecosystem", "Living things and their environment"]],
    ]);
    const offset = 1 + seed % (answer.length - 1);
    return { prompt: `Unscramble: ${answer.slice(offset) + answer.slice(0, offset)}`, hint, answer };
  }
  if (game === "math") {
    const a = level === 0 ? 1 + seed % 5 : 2 + seed % (level === 1 ? 15 : 12);
    const b = 1 + Math.floor(seed / 7) % (level === 0 ? 4 : 9);
    if (level < 2) return { prompt: `${a} + ${b} = ?`, hint: level === 0 ? "Count on your fingers or use small objects." : "Try counting up from the larger number.", answer: String(a + b) };
    if (level === 2) return { prompt: `${a} \u00d7 ${b} = ?`, hint: "Think of equal groups.", answer: String(a * b) };
    return { prompt: `(${a} \u00d7 ${b}) + ${a + b} = ?`, hint: "Multiply inside the brackets first.", answer: String(a * b + a + b) };
  }
  if (game === "riddle") {
    const [prompt, answer, hint] = choose([
      [["I say meow and have whiskers. What am I?", "cat", "A furry pet"], ["I am yellow and shine in the sky by day. What am I?", "sun", "Look up on a sunny day"], ["I have pages and tell a story. What am I?", "book", "You can read me"]],
      [["What has hands but cannot clap?", "clock", "It tells time"], ["What gets wetter as it dries you?", "towel", "You use it after a bath"], ["What has teeth but cannot bite?", "comb", "It tidies your hair"]],
      [["What has many keys but opens no doors?", "piano", "A musical instrument"], ["What has a neck but no head?", "bottle", "It holds a drink"], ["What can travel around the world while staying in a corner?", "stamp", "It goes on an envelope"]],
      [["What disappears as soon as you say its name?", "silence", "The opposite of noise"], ["What has cities but no houses, forests but no trees, and rivers but no water?", "map", "A tool for finding your way"], ["What can fill a room but takes up no space?", "light", "A lamp provides it"]],
    ]);
    return { prompt, answer, hint };
  }
  if (game === "odd") {
    const [options, answer, hint] = choose([
      [[["Cat", "Dog", "Car"], "Car", "Which one is not an animal?"], [["Apple", "Banana", "Shoe"], "Shoe", "Which one is not a fruit?"], [["Red", "Blue", "Chair"], "Chair", "Which one is not a color?"]],
      [[["Circle", "Square", "Carrot", "Triangle"], "Carrot", "Three are shapes."], [["Robin", "Eagle", "Shark", "Sparrow"], "Shark", "Three are birds."], [["Piano", "Drum", "Guitar", "Helmet"], "Helmet", "Three make music."]],
      [[["Mercury", "Venus", "Moon", "Mars"], "Moon", "Three are planets."], [["Oak", "Rose", "Pine", "Maple"], "Rose", "Three are trees."], [["Solid", "Liquid", "Gas", "Metal"], "Metal", "Three are states of matter."]],
      [[["Triangle", "Square", "Pentagon", "Sphere"], "Sphere", "Three are flat polygons."], [["Metaphor", "Simile", "Alliteration", "Paragraph"], "Paragraph", "Three are literary devices."], [["Copper", "Iron", "Oxygen", "Gold"], "Oxygen", "Three are metals."]],
    ]);
    return { prompt: "Which one does not belong?", options, answer, hint };
  }
  const [sequence, options, answer, hint] = choose([
    [[["Red", "Blue", "Red", "Blue"], ["Red", "Green", "Yellow"], "Red", "Two colors take turns."], [["Circle", "Star", "Circle", "Star"], ["Star", "Circle", "Square"], "Circle", "Two shapes take turns."]],
    [[["Sun", "Moon", "Star", "Sun", "Moon"], ["Cloud", "Star", "Sun"], "Star", "The group of three repeats."], [["Clap", "Clap", "Tap", "Clap", "Clap"], ["Clap", "Tap", "Jump"], "Tap", "Two claps, then a tap."]],
    [[["A", "C", "E", "G"], ["H", "I", "J"], "I", "Skip one letter each time."], [["North", "East", "South", "West"], ["North", "East", "South"], "North", "Turn clockwise around a compass."]],
    [[["A", "B", "D", "G"], ["J", "K", "L"], "K", "Move 1, then 2, then 3, then 4 letters forward."], [["Z", "W", "T", "Q"], ["N", "O", "M"], "N", "Move three letters backward each time."]],
  ]);
  return { prompt: `${sequence.join(" \u2192 ")} \u2192 ?`, options, answer, hint };
}

function resetMemoryGame() {
  window.clearTimeout(memoryTimer);
  memoryRound = null;
}

function renderMemoryGame(member) {
  const board = document.getElementById("memory-board");
  if (!memoryRound || memoryRound.memberId !== member.id || memoryRound.level !== ageLevel(member)) {
    resetMemoryGame();
    const symbols = ["\u{1F34E}", "\u{1F33B}", "\u{1F98B}", "\u{1F680}", "\u{1F419}", "\u{1F3B8}", "\u{1F984}", "\u{1F308}"];
    const pairs = [3, 4, 6, 8][ageLevel(member)];
    memoryRound = {
      memberId: member.id, level: ageLevel(member),
      cards: shuffleFun([...symbols.slice(0, pairs), ...symbols.slice(0, pairs)]),
      open: [], matched: [], busy: false, complete: false,
    };
  }
  board.replaceChildren();
  memoryRound.cards.forEach((symbol, index) => {
    const visible = memoryRound.open.includes(index) || memoryRound.matched.includes(index);
    const button = funButton(visible ? symbol : "?", () => flipMemoryCard(member.id, index),
      visible || memoryRound.busy || memoryRound.complete);
    button.className = `memory-card${visible ? " is-open" : ""}`;
    button.setAttribute("aria-label", visible ? `Card ${index + 1}: ${symbol}` : `Reveal card ${index + 1}`);
    board.append(button);
  });
}

function flipMemoryCard(memberId, index) {
  const member = getFunMember();
  const round = memoryRound;
  if (!member || member.id !== memberId || !round || round.memberId !== memberId ||
      round.busy || round.complete || round.open.includes(index) || round.matched.includes(index)) return;
  round.open.push(index);
  if (round.open.length === 2) {
    const [first, second] = round.open;
    if (round.cards[first] === round.cards[second]) {
      round.matched.push(...round.open);
      round.open = [];
      if (round.matched.length === round.cards.length) {
        round.complete = true;
        finishArcade("memory");
      }
    } else {
      round.busy = true;
      memoryTimer = window.setTimeout(() => {
        if (memoryRound !== round || getFunMember()?.id !== memberId) return;
        round.open = [];
        round.busy = false;
        renderMemoryGame(member);
      }, 850);
    }
  }
  renderMemoryGame(member);
}

function renderArcade(member) {
  const game = document.getElementById("arcade-game").value;
  const changedProfile = arcadeProfileId !== (member?.id || "");
  if (changedProfile) {
    resetMemoryGame();
    arcadePracticeRound = 0;
    arcadeProfileId = member?.id || "";
    document.getElementById("arcade-feedback").textContent = "";
    document.getElementById("arcade-answer").value = "";
  }
  document.getElementById("arcade-game").disabled = !member;
  document.querySelectorAll("#arcade-form input, #arcade-form button, #memory-restart, #arcade-practice")
    .forEach((element) => { element.disabled = !member; });
  document.getElementById("arcade-form").hidden = !member || game === "memory";
  document.getElementById("memory-game").hidden = !member || game !== "memory";
  document.getElementById("arcade-practice").hidden = !member || game === "memory";
  const status = document.getElementById("arcade-status");
  if (!member) {
    status.textContent = "Add or select a family profile in Teamwork to play.";
    return;
  }
  const completed = getFunProfile(member.id).arcade[toDateKey(new Date())] || [];
  status.textContent = `${ageDescription(member)}${member.age ? ` (age ${member.age})` : " (no age set; edit profile for a closer fit)"} \u00b7 ${completed.length} / ${arcadeGames.length} daily games completed${completed.includes(game) ? " \u00b7 Practice round" : ""}`;
  if (game === "memory") {
    renderMemoryGame(member);
    return;
  }
  currentArcadeChallenge = getArcadeChallenge(member, game, arcadePracticeRound);
  const challenge = currentArcadeChallenge;
  document.getElementById("arcade-prompt").textContent = `${challenge.prompt} Hint: ${challenge.hint}`;
  const input = document.getElementById("arcade-answer");
  input.type = game === "math" ? "number" : "text";
  input.inputMode = game === "math" ? "numeric" : "text";
  const options = document.getElementById("arcade-options");
  options.replaceChildren();
  input.closest("label").hidden = Boolean(challenge.options);
  document.querySelector("#arcade-form button[type=submit]").hidden = Boolean(challenge.options);
  for (const choice of challenge.options || []) {
    options.append(funButton(choice, () => submitArcadeAnswer(choice)));
  }
}

function normalizeArcadeAnswer(answer) {
  return String(answer).trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[.!?]+$/, "");
}

function submitArcadeAnswer(answer) {
  if (!getFunMember() || !currentArcadeChallenge) return;
  const feedback = document.getElementById("arcade-feedback");
  if (normalizeArcadeAnswer(answer) !== normalizeArcadeAnswer(currentArcadeChallenge.answer)) {
    feedback.textContent = "Not quite. Read the hint and try again!";
    return;
  }
  finishArcade(document.getElementById("arcade-game").value);
}

function finishArcade(game) {
  const member = getFunMember();
  if (!member) return;
  const date = toDateKey(new Date());
  const profile = getFunProfile(member.id);
  if ((profile.arcade[date] || []).includes(game)) {
    document.getElementById("arcade-feedback").textContent = "Great practice! Today's star for this game is already collected.";
    return;
  }
  const success = commitFunChange(() => {
    profile.arcade[date] ||= [];
    profile.arcade[date].push(game);
    if (member.role === "child") {
      member.stars += 1;
      const previousBadges = Math.floor((member.brainStars || 0) / 100);
      member.brainStars = (member.brainStars || 0) + 1;
      if (Math.floor(member.brainStars / 100) > previousBadges) {
        member.gameMinutes = (member.gameMinutes || 0) + 10;
        addWallWin(member.id, "Brain Booster badge and 10 screen-time minutes!", "badge");
      }
    }
    addAdventureStep(member.id, `Completed ${document.querySelector(`#arcade-game option[value="${game}"]`).textContent}`, "arcade");
  });
  if (!success) {
    if (game === "memory") resetMemoryGame();
    renderArcade(member);
    return;
  }
  document.getElementById("arcade-feedback").textContent = member.role === "child"
    ? "Brilliant! One star and one brain star earned. Try another game or a practice round."
    : "Brilliant! You added a step to the family adventure.";
  showCelebration({ icon: "\u{1F9E0}", title: `${member.name} solved it!`, quote: "A little practice makes a big difference.", record: false });
}

function getBingoWeek() {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return toDateKey(monday);
}

function bingoLabels(week) {
  const offset = [...week].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % bingoActivities.length;
  return Array.from({ length: 9 }, (_, index) => bingoActivities[(offset + index) % bingoActivities.length]);
}

function hasBingo(cells) {
  return [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
    .some((line) => line.every((index) => Boolean(cells[index])));
}

function completeBingo(index) {
  const member = getFunMember();
  if (!member) return;
  const week = getBingoWeek();
  const board = funState.bingo[week] || { cells: Array(9).fill(""), claimed: false };
  if (board.cells[index]) return;
  commitFunChange(() => {
    funState.bingo[week] = board;
    board.cells[index] = member.id;
    addAdventureStep(member.id, `Bingo: ${bingoLabels(week)[index]}`, "bingo");
    if (!board.claimed && hasBingo(board.cells)) {
      board.claimed = true;
      if (member.role === "child") member.stars += 1;
      addWallWin(member.id, "Family bingo! A full line completed.", "badge");
    }
  }, "Bingo square completed! A first full line earns its completing child one star.");
}

function renderBingo(member) {
  const week = getBingoWeek();
  const board = funState.bingo[week] || { cells: Array(9).fill(""), claimed: false };
  document.getElementById("bingo-week").textContent = `Week of ${dateFromKey(week).toLocaleDateString()}`;
  const element = document.getElementById("bingo-board");
  element.replaceChildren();
  bingoLabels(week).forEach((label, index) => {
    const owner = members.find((candidate) => candidate.id === board.cells[index]);
    const button = funButton(`${label}${owner ? ` \u2713 ${owner.name}` : ""}`, () => completeBingo(index), !member || Boolean(owner));
    button.className = `bingo-cell${owner ? " is-done" : ""}`;
    button.setAttribute("aria-pressed", String(Boolean(owner)));
    element.append(button);
  });
  document.getElementById("bingo-status").textContent = board.claimed
    ? "Bingo! This week's line bonus has been claimed. Keep filling the board together."
    : `${board.cells.filter(Boolean).length} / 9 family activities completed.`;
}

function questForMember(member) {
  const date = toDateKey(new Date());
  return getFunProfile(member.id).quests[date] ||
    { index: funSeed(member, date) % mysteryQuests.length, revealed: false, completed: false };
}

function changeQuest(complete) {
  const member = getFunMember();
  if (!member) return;
  const quest = questForMember(member);
  if (quest.completed || (complete && !quest.revealed)) return;
  commitFunChange(() => {
    getFunProfile(member.id).quests[toDateKey(new Date())] = quest;
    quest.revealed = true;
    if (complete) {
      quest.completed = true;
      if (member.role === "child") member.stars += 1;
      addAdventureStep(member.id, "Daily mystery mission completed!", "quest");
    }
  }, complete ? "Mission complete! Your adventure moves forward." : "Your mission is revealed. Have fun!");
}

function renderQuest(member) {
  const quest = member ? questForMember(member) : null;
  document.getElementById("mystery-mission").textContent = !member
    ? "Select a family profile to reveal a mission."
    : quest.completed ? `Mission complete! ${mysteryQuests[quest.index]} Come back tomorrow.`
      : quest.revealed ? mysteryQuests[quest.index] : "A little surprise is waiting for you...";
  const reveal = document.getElementById("quest-reveal");
  reveal.hidden = Boolean(quest?.revealed);
  reveal.disabled = !member;
  const complete = document.getElementById("quest-complete");
  complete.hidden = !quest?.revealed || quest.completed;
}

function decoratePet(member) {
  const pet = virtualPets[member.id];
  if (!pet) return;
  const profile = getFunProfile(member.id);
  const display = document.getElementById("pet-display");
  display.dataset.scene = profile.equipped.scene || "";
  let accessories = document.getElementById("pet-accessories");
  if (!accessories) {
    accessories = funElement("span", "", "pet-accessories");
    accessories.id = "pet-accessories";
    display.append(accessories);
  }
  const equipped = petShopItems.filter((item) => Object.values(profile.equipped).includes(item.id));
  accessories.textContent = equipped.map((item) => `${item.icon} ${item.name}`).join(" \u00b7 ");
}

function buyPetItem(itemId) {
  const member = getFunMember();
  const item = petShopItems.find((candidate) => candidate.id === itemId);
  if (!member || !item || !virtualPets[member.id]) return;
  const profile = getFunProfile(member.id);
  const owned = profile.owned.includes(item.id);
  if (!owned && member.stars < item.cost) {
    funMessage("Not enough stars yet. Try a game or a quest!", true);
    return;
  }
  const wasEquipped = profile.equipped[item.slot] === item.id;
  commitFunChange(() => {
    if (!owned) {
      member.stars -= item.cost;
      profile.owned.push(item.id);
      addWallWin(member.id, `Bought ${item.name} for their pet`, "pet");
    }
    if (profile.equipped[item.slot] === item.id) delete profile.equipped[item.slot];
    else profile.equipped[item.slot] = item.id;
  }, `${item.name} ${wasEquipped ? "removed" : "equipped"}!`);
}

function renderPetShop(member) {
  const shop = document.getElementById("pet-shop");
  shop.replaceChildren();
  const profile = member ? getFunProfile(member.id) : null;
  for (const item of petShopItems) {
    const card = funElement("article", undefined, "shop-item");
    card.append(funElement("strong", `${item.icon} ${item.name}`));
    const owned = profile?.owned.includes(item.id);
    const equipped = profile?.equipped[item.slot] === item.id;
    card.append(funElement("span", owned ? "Owned" : `${item.cost} stars`));
    card.append(funButton(equipped ? "Unequip" : owned ? "Equip" : `Buy for ${item.cost} stars`,
      () => buyPetItem(item.id), !member || !virtualPets[member.id] || (!owned && member.stars < item.cost)));
    shop.append(card);
  }
}

function requestReward(rewardId) {
  const member = getFunMember();
  const reward = funState.rewards.find((item) => item.id === rewardId);
  if (!member || !reward) return;
  if (member.stars < reward.cost) {
    funMessage("You need more stars for that reward.", true);
    return;
  }
  commitFunChange(() => {
    member.stars -= reward.cost;
    funState.requests.unshift({
      id: funId(), memberId: member.id, title: reward.title, cost: reward.cost,
      date: toDateKey(new Date()), status: "pending",
    });
  }, "Reward requested! Your stars are reserved until an adult delivers it or the request is canceled.");
}

function changeRewardRequest(id, action) {
  const member = getFunMember();
  const request = funState.requests.find((item) => item.id === id);
  if (!member || !request || ["delivered", "canceled"].includes(request.status)) return;
  const adult = member.role === "adult";
  if ((action === "cancel" && !adult && member.id !== request.memberId) ||
      (action !== "cancel" && !adult)) {
    funMessage("Choose an adult profile to approve or deliver rewards.", true);
    return;
  }
  if ((action === "approve" && request.status !== "pending") ||
      (action === "deliver" && request.status !== "approved")) return;
  const owner = members.find((candidate) => candidate.id === request.memberId);
  if (!owner) return;
  commitFunChange(() => {
    if (action === "cancel") {
      request.status = "canceled";
      owner.stars += request.cost;
    } else if (action === "approve") request.status = "approved";
    else {
      request.status = "delivered";
      addWallWin(owner.id, `Enjoyed a reward: ${request.title}`, "reward");
    }
  }, action === "cancel" ? "Request canceled and stars refunded." : `Reward ${request.status === "pending" ? "approved" : "delivered"}.`);
}

function renderRewardShop(member) {
  const adult = member?.role === "adult";
  document.querySelectorAll("#reward-shop-form input, #reward-shop-form button")
    .forEach((control) => { control.disabled = !adult; });
  const shop = document.getElementById("reward-shop");
  shop.replaceChildren();
  if (!funState.rewards.length) shop.append(funElement("p", "No treats yet. Choose an adult profile and add your family's first reward.", "fun-note"));
  for (const reward of funState.rewards) {
    const card = funElement("article", undefined, "shop-item");
    card.append(funElement("strong", reward.title), funElement("span", `${reward.cost} stars`));
    card.append(funButton("Request reward", () => requestReward(reward.id), !member || member.stars < reward.cost));
    if (adult) card.append(funButton("Remove reward", () => {
      commitFunChange(() => { funState.rewards = funState.rewards.filter((item) => item.id !== reward.id); }, "Reward removed. Existing requests are unchanged.");
    }));
    shop.append(card);
  }
  const list = document.getElementById("reward-requests");
  list.replaceChildren();
  const visible = funState.requests.filter((request) => adult || request.memberId === member?.id);
  if (!visible.length) list.append(funElement("li", "No reward requests yet."));
  for (const request of visible) {
    const row = funElement("li");
    const name = members.find((candidate) => candidate.id === request.memberId)?.name || "Family member";
    row.append(funElement("span", `${name}: ${request.title} \u00b7 ${request.cost} stars \u00b7 ${request.status}`));
    if (adult && request.status === "pending") row.append(funButton("Approve", () => changeRewardRequest(request.id, "approve")));
    if (adult && request.status === "approved") row.append(funButton("Mark delivered", () => changeRewardRequest(request.id, "deliver")));
    if (["pending", "approved"].includes(request.status)) row.append(funButton("Cancel & refund", () => changeRewardRequest(request.id, "cancel")));
    list.append(row);
  }
}

function renderAdventure() {
  const steps = funState.steps;
  const current = adventureChapters.findLastIndex((chapter) => steps >= chapter.at);
  const next = adventureChapters[current + 1];
  document.getElementById("adventure-progress").textContent = `${steps} family adventure steps${next ? ` \u00b7 ${next.at - steps} to ${next.name}` : " \u00b7 All chapters unlocked!"}`;
  const map = document.getElementById("adventure-map");
  map.replaceChildren();
  for (const chapter of adventureChapters) {
    const item = funElement("li", `${steps >= chapter.at ? "\u2713" : "\u{1F512}"} ${chapter.name} (${chapter.at})`);
    if (chapter.at === adventureChapters[current].at) item.setAttribute("aria-current", "step");
    map.append(item);
  }
  document.getElementById("adventure-story").textContent = adventureChapters[current].story;
}

function renderWall() {
  const wall = document.getElementById("celebration-wall");
  wall.replaceChildren();
  if (!funState.wall.length) wall.append(funElement("li", "Your first little win belongs here. Play a game, finish a quest, or add a milestone."));
  for (const win of funState.wall.slice(0, 40)) {
    const name = members.find((member) => member.id === win.memberId)?.name || "Family";
    const row = funElement("li");
    row.append(funElement("strong", win.title), funElement("span", `${name} \u00b7 ${dateFromKey(win.date).toLocaleDateString()}`));
    if (win.kind === "manual" && (getFunMember()?.role === "adult" || activeMemberId === win.memberId)) {
      row.append(funButton("Remove", () => {
        commitFunChange(() => { funState.wall = funState.wall.filter((item) => item.id !== win.id); }, "Milestone removed.");
      }));
    }
    wall.append(row);
  }
  if (funState.wall.length > 40) wall.append(funElement("li", "Showing the latest 40 wins. All wins are included in your backup."));
}

function getDinnerChoices() {
  const date = document.getElementById("spinner-date").value;
  return isValidDateKey(date)
    ? [...new Set(meals.filter((meal) => meal.date === date).map((meal) => meal.name))]
    : [];
}

function renderDinnerSpinner() {
  const date = document.getElementById("spinner-date").value;
  const choices = getDinnerChoices();
  document.getElementById("spin-dinner").disabled = choices.length === 0;
  document.getElementById("spin-helper").disabled = members.length === 0;
  document.getElementById("spinner-result").textContent = !isValidDateKey(date)
    ? "Choose a valid dinner date."
    : choices.length
      ? `${choices.length} ${choices.length === 1 ? "meal" : "meals"} planned for ${formatMealDate(date)}. Ready to spin!`
      : `No meals planned for ${formatMealDate(date)}. Add a dated meal below.`;
}

function renderFunHub() {
  const member = getFunMember();
  document.getElementById("fun-wallet").textContent = member ? `${member.stars} stars to spend` : "";
  document.getElementById("fun-profile-note").textContent = member
    ? `Playing as ${member.name}. Progress stays in this browser. Switch profiles to play for someone else.`
    : "No profiles yet. Add family members under Teamwork to start playing.";
  document.querySelectorAll("#celebration-form input, #celebration-form button").forEach((control) => { control.disabled = !member; });
  renderAdventure();
  renderArcade(member);
  renderBingo(member);
  renderQuest(member);
  renderPetShop(member);
  renderRewardShop(member);
  renderWall();
  renderDinnerSpinner();
  if (member && virtualPets[member.id]) decoratePet(member);
}

document.getElementById("arcade-game").addEventListener("change", () => {
  resetMemoryGame();
  arcadePracticeRound = 0;
  document.getElementById("arcade-answer").value = "";
  document.getElementById("arcade-feedback").textContent = "";
  renderArcade(getFunMember());
});
document.getElementById("arcade-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitArcadeAnswer(document.getElementById("arcade-answer").value);
});
document.getElementById("arcade-practice").addEventListener("click", () => {
  arcadePracticeRound += 1;
  document.getElementById("arcade-answer").value = "";
  document.getElementById("arcade-feedback").textContent = "";
  renderArcade(getFunMember());
});
document.getElementById("memory-restart").addEventListener("click", () => {
  resetMemoryGame();
  document.getElementById("arcade-feedback").textContent = "";
  renderArcade(getFunMember());
});
document.getElementById("quest-reveal").addEventListener("click", () => changeQuest(false));
document.getElementById("quest-complete").addEventListener("click", () => changeQuest(true));
document.getElementById("reward-shop-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = getFunMember();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const cost = form.elements.cost.valueAsNumber;
  if (member?.role !== "adult" || !title || title.length > 60 || !Number.isInteger(cost) || cost < 1 || cost > 10000) {
    funMessage("Choose an adult profile and enter a reward with a whole-star price between 1 and 10,000.", true);
    return;
  }
  if (commitFunChange(() => {
    funState.rewards.push({ id: funId(), title, cost });
  }, "Reward added to the shop.")) form.reset();
});
document.getElementById("celebration-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = getFunMember();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  if (!member || !title || title.length > 100) {
    funMessage("Choose a profile and enter a milestone of up to 100 characters.", true);
    return;
  }
  if (commitFunChange(() => addWallWin(member.id, title, "manual"), "Your little win is on the wall!")) form.reset();
});
document.getElementById("spin-dinner").addEventListener("click", () => {
  const choices = getDinnerChoices();
  const date = document.getElementById("spinner-date").value;
  document.getElementById("spinner-result").textContent = choices.length
    ? `Dinner for ${formatMealDate(date)}: ${choices[Math.floor(Math.random() * choices.length)]}!`
    : "Add a meal for the selected date first.";
});
document.getElementById("spin-helper").addEventListener("click", () => {
  document.getElementById("spinner-result").textContent = members.length
    ? `Today's kitchen helper: ${members[Math.floor(Math.random() * members.length)].name}! An adult chooses a safe job.`
    : "Add a family profile in Teamwork first.";
});

document.getElementById("spinner-date").value = toDateKey(new Date());
document.getElementById("spinner-date").addEventListener("change", renderDinnerSpinner);
renderFunHub();
renderGameRewards(getFunMember());
