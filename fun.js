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
const familyTimeActivities = [
  { category: 0, title: "Silly family awards", minutes: 10,
    instructions: "Invent a warm, funny award for every person: Most Creative Idea, Best Silly Voice, or Kindness Champion. Take turns presenting them with a dramatic speech. Celebrate everyone, with no teasing!" },
  { category: 0, title: "Team charades", minutes: 12,
    instructions: "Pair up to act out an animal, a family memory, or something you love doing together. Everyone else guesses, then swap teams. Seated gestures work too. No scores: the funny guesses are the best part!" },
  { category: 1, title: "Pass-the-doodle", minutes: 15,
    instructions: "Start a drawing on paper, then pass it to the next person every minute. Each person adds a surprise. At the end, give your shared creation a silly name and tell its story together." },
  { category: 1, title: "Our family mascot", minutes: 15,
    instructions: "Draw or build a little mascot using paper or blocks you already have. Everyone adds one feature or special power that represents someone in the family. Give it a name and invent its family cheer!" },
  { category: 2, title: "The wonderfully silly story", minutes: 10,
    instructions: "Begin with 'One day, our family found a tiny door...' Go around adding one sentence each. Bring every family member into the adventure. Finish with a happy ending that you invent together." },
  { category: 2, title: "Living-room radio show", minutes: 12,
    instructions: "Make a tiny radio show together: one person introduces the family, another tells a joke, and others hum a tune or add gentle sound effects. Swap roles and finish with a jingle about your family." },
  { category: 3, title: "Guess that family memory", minutes: 20,
    instructions: "Take turns giving three clues about a happy moment you shared. Guess together, then let the storyteller share their favorite detail. Ask each other what made that moment special. Everyone can help with the clues." },
  { category: 3, title: "Our imaginary clubhouse", minutes: 10,
    instructions: "Design your dream family clubhouse out loud. Each person adds one room, one silly rule, and one thing you would love to do there together. Ask someone why they picked their idea, then combine everyone's plans." },
  { category: 4, title: "Teach me your tiny talent", minutes: 15,
    instructions: "Everyone teaches the family one small thing: a doodle, a hand-clap rhythm, a funny voice, or a favorite word. Try each other's ideas together and tell your teacher one thing you enjoyed." },
  { category: 4, title: "The family news desk", minutes: 10,
    instructions: "Pair up as reporters and interview each other: 'What made you smile?' and 'What should our family try next?' Take turns sharing your partner's good news in your funniest friendly newsreader voice." },
  { category: 5, title: "A little kindness, just for you", minutes: 15,
    instructions: "Make each other tiny thank-you notes or drawings, naming something kind the person actually did. Read or show them together. Make sure every family member receives one; spoken thank-yous count too." },
  { category: 5, title: "Pass the appreciation", minutes: 10,
    instructions: "Pass a soft toy, or pretend to pass a glowing star. Take turns finishing 'I loved it when we...' or 'Thank you for...' about someone here. Invite everyone to share a favorite thing about being this family." },
];
let lastFamilyTimeActivity = null;
let familyTimeRotation = 0;
let familyTimeBusy = false;
const adventureChapters = [
  { at: 0, name: "Home base", story: "A tiny map arrives. Your family packs kindness, curiosity, and a little courage." },
  { at: 5, name: "Giggle Grove", story: "The giggling trees welcome your team. A friendly fox points toward a sparkling creek." },
  { at: 15, name: "Puzzle Bridge", story: "Together you solve the bridge keeper's puzzle and cross into a valley of colorful flowers." },
  { at: 30, name: "Rainbow Valley", story: "Your little acts of teamwork bring every color back to the valley. A balloon is ready!" },
  { at: 50, name: "Cloud Castle", story: "The clouds lift your family to a castle where every room holds a new discovery." },
  { at: 80, name: "Star Harbor", story: "You reach the harbor of stars. The real treasure was every small win you shared along the way." },
];
const arcadeGames = ["word", "math", "memory", "riddle", "odd", "pattern"];
const wishIcons = { gift: "\u{1F381}", toy: "\u{1F9F8}", book: "\u{1F4DA}", adventure: "\u{1F680}", game: "\u{1F3AE}" };
const greenlightReward = Object.freeze({ id: "greenlight-one-dollar", title: "$1 to Greenlight debit card", cost: 100 });
const familyWallKinds = Object.freeze({ gratitude: "Gratefulness", "family-win": "Family win", kindness: "Kindness", manual: "Family win" });
const funStorageKey = "family-fun-extra-fun";
let funStorageBlocked = false;
let funState = readFunState();
let memoryRound = null;
let memoryTimer;
let arcadePracticeRound = 0;
let arcadeProfileId = "";
let currentArcadeChallenge = null;

function createDefaultFunState() {
  return { version: 1, profiles: {}, bingo: {}, rewards: [], wishes: [], journal: [], requests: [], wall: [], steps: 0 };
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
  const wishes = state.wishes === undefined ? [] : state.wishes;
  const journal = state.journal === undefined ? [] : state.journal;
  if (!Array.isArray(journal) || !journal.every((entry) =>
    object(entry) && memberExists(entry.memberId) && isFunDate(entry.date) &&
    isFunText(entry.note, 2000) && entry.note.trim().length > 0 &&
    typeof entry.rewarded === "boolean") ||
    new Set(journal.map((entry) => JSON.stringify([entry.memberId, entry.date]))).size !== journal.length) return false;
  if (!Array.isArray(wishes) ||
      !wishes.every((wish) => object(wish) && isFunText(wish.id, 100) &&
        memberExists(wish.memberId) && isFunText(wish.title, 60) &&
        (wish.icon === undefined || (typeof wish.icon === "string" && Object.hasOwn(wishIcons, wish.icon))) &&
        (wish.cost === undefined || (Number.isInteger(wish.cost) && wish.cost >= 1 && wish.cost <= 10000))) ||
      !uniqueIds(wishes)) return false;
  if (!Object.entries(state.profiles).every(([id, profile]) =>
    memberExists(id) && object(profile) && Array.isArray(profile.owned) &&
    (profile.goalWishId === undefined || wishes.some((wish) =>
      wish.id === profile.goalWishId && wish.memberId === id && wish.cost !== undefined)) &&
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
    (request.wishId === undefined || (isFunText(request.wishId, 100) &&
      !wishes.some((wish) => wish.id === request.wishId && wish.memberId !== request.memberId))) &&
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

function funMessage(message, error = false, targetId = "fun-feedback") {
  const element = document.getElementById(targetId);
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

function addAdventureStep() {
  funState.steps += 1;
}

function commitFunChange(change, message = "", feedbackTarget = "fun-feedback", celebrate = false) {
  if (funStorageBlocked) {
    funMessage("Extra play storage could not be loaded safely. Recover a valid backup before saving new play progress.", true, feedbackTarget);
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
      : "Could not save this action. No reward stars or progress were changed. Check browser storage and try again.", true, feedbackTarget);
    return false;
  }
  if (message) funMessage(message, false, feedbackTarget);
  renderRewards();
  renderGameRewards(getFunMember());
  if (celebrate) {
    for (const { member, value } of oldMembers) {
      celebrateEarnings(member.id, Math.max(0, member.stars - value.stars),
        Math.max(0, (member.gameMinutes || 0) - (value.gameMinutes || 0)));
    }
  }
  return true;
}

function recordFunActivity(memberId, kind) {
  if (!members.some((member) => member.id === memberId) || !["brain", "chore", "healthy"].includes(kind)) return;
  commitFunChange(addAdventureStep);
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
  currentArcadeChallenge = null;
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
  document.getElementById("number-pattern-game").hidden = !member || game !== "number";
  document.getElementById("arcade-form").hidden = !member || game === "memory" || game === "number";
  document.getElementById("memory-game").hidden = !member || game !== "memory";
  document.getElementById("arcade-practice").hidden = !member || game === "memory" || game === "number";
  const status = document.getElementById("arcade-status");
  if (!member) {
    status.textContent = "Add a profile in Settings, then use the Playing as button above to choose who's playing.";
    return;
  }
  const completed = getFunProfile(member.id).arcade[toDateKey(new Date())] || [];
  status.textContent = `${ageDescription(member)}${member.age ? ` (age ${member.age})` : " (no age set; edit profile for a closer fit)"} \u00b7 ${completed.length} / ${arcadeGames.length} daily games completed${completed.includes(game) ? " \u00b7 Practice round" : ""}`;
  if (game === "number") {
    status.textContent += member.role === "child"
      ? " \u00b7 Number patterns earn a reward star and a brain star for every solve."
      : " \u00b7 Find the missing number. Keep solving to build your streak.";
    return;
  }
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
    document.getElementById("arcade-feedback").textContent = "Great practice! Today's reward star for this game is already collected.";
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
      }
    }
    addAdventureStep();
  }, "", "fun-feedback", true);
  if (!success) {
    if (game === "memory") resetMemoryGame();
    renderArcade(member);
    return;
  }
  document.getElementById("arcade-feedback").textContent = member.role === "child"
    ? "Brilliant! One reward star and one brain star earned. Try another game or a practice round."
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
    addAdventureStep();
    if (!board.claimed && hasBingo(board.cells)) {
      board.claimed = true;
      if (member.role === "child") member.stars += 1;
    }
  }, "Bingo square completed! A first full line earns its completing child one reward star.", "fun-feedback", true);
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
      addAdventureStep();
    }
  }, complete ? "Mission complete! Your adventure moves forward." : "Your mission is revealed. Have fun!", "fun-feedback", complete);
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
    funMessage("Not enough reward stars yet. Try a game or a quest!", true, "pet-shop-feedback");
    return;
  }
  const wasEquipped = profile.equipped[item.slot] === item.id;
  commitFunChange(() => {
    if (!owned) {
      member.stars -= item.cost;
      profile.owned.push(item.id);
    }
    if (profile.equipped[item.slot] === item.id) delete profile.equipped[item.slot];
    else profile.equipped[item.slot] = item.id;
  }, `${item.name} ${wasEquipped ? "removed" : "equipped"}!`, "pet-shop-feedback");
}

function renderPetShop(member) {
  const shop = document.getElementById("pet-shop");
  if (shop.dataset.memberId !== (member?.id || "")) {
    funMessage("", false, "pet-shop-feedback");
    shop.dataset.memberId = member?.id || "";
  }
  document.getElementById("pet-shop-wallet").textContent = member
    ? `${member.stars} reward stars to spend${virtualPets[member.id] ? "" : " \u00b7 Create a Plant Pal above to shop."}`
    : "Add a family member in Settings, then choose them using Playing as above.";
  shop.replaceChildren();
  const profile = member ? getFunProfile(member.id) : null;
  for (const item of petShopItems) {
    const card = funElement("article", undefined, "shop-item");
    card.append(funElement("strong", `${item.icon} ${item.name}`));
    const owned = profile?.owned.includes(item.id);
    const equipped = profile?.equipped[item.slot] === item.id;
    card.append(funElement("span", owned ? "Owned" : `${item.cost} reward stars`));
    card.append(funButton(equipped ? "Unequip" : owned ? "Equip" : `Buy for ${item.cost} reward stars`,
      () => buyPetItem(item.id), !member || !virtualPets[member.id] || (!owned && member.stars < item.cost)));
    shop.append(card);
  }
}

function getShopRewards() {
  return [greenlightReward, ...funState.rewards.filter((reward) => reward.id !== greenlightReward.id)];
}

function requestReward(rewardId, fromWishlist = false) {
  const member = getFunMember();
  const reward = (fromWishlist ? funState.wishes || [] : getShopRewards()).find((item) => item.id === rewardId);
  if (!member || !reward || (fromWishlist && reward.memberId !== member.id) || !Number.isInteger(reward.cost)) {
    funMessage("Choose your own priced wish or a shop reward before redeeming.", true, "reward-feedback");
    return;
  }
  if (fromWishlist && funState.requests.some((request) => request.wishId === reward.id &&
      request.memberId === member.id && ["pending", "approved"].includes(request.status))) {
    funMessage("This wish is already requested. Your grown-up can approve and deliver it.", true, "reward-feedback");
    return;
  }
  if (member.stars < reward.cost) {
    funMessage("You need more reward stars for that reward.", true, "reward-feedback");
    return;
  }
  commitFunChange(() => {
    member.stars -= reward.cost;
    funState.requests.unshift({
      id: funId(), memberId: member.id, title: reward.title, cost: reward.cost,
      date: toDateKey(new Date()), status: "pending",
      ...(fromWishlist ? { wishId: reward.id } : {}),
    });
  }, "Reward requested! Your reward stars are reserved until an adult delivers it or the request is canceled.", "reward-feedback");
}

function changeRewardRequest(id, action) {
  const member = getFunMember();
  const request = funState.requests.find((item) => item.id === id);
  if (!member || !request || ["delivered", "canceled"].includes(request.status)) return;
  const adult = isUnlockedParent(member);
  if ((action === "cancel" && !adult && member.id !== request.memberId) ||
      (action !== "cancel" && !adult)) {
    funMessage("Choose an adult profile to approve or deliver rewards.", true, "reward-feedback");
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
      const profile = getFunProfile(owner.id);
      if (request.wishId && profile.goalWishId === request.wishId) delete profile.goalWishId;
    }
  }, action === "cancel" ? "Request canceled and reward stars refunded." : `Reward ${request.status === "pending" ? "approved" : "delivered"}.`, "reward-feedback");
}

function getWishGoal(member) {
  if (!member) return null;
  return (funState.wishes || []).find((wish) =>
    wish.memberId === member.id && wish.id === getFunProfile(member.id).goalWishId) || null;
}

function priceWish(wishId, cost) {
  const wish = (funState.wishes || []).find((item) => item.id === wishId);
  if (!isUnlockedParent(getFunMember()) || !wish || !Number.isInteger(cost) || cost < 1 || cost > 10000) {
    funMessage("A grown-up must set a whole-number price from 1 to 10,000 reward stars.", true, "reward-feedback");
    return;
  }
  commitFunChange(() => {
    wish.cost = cost;
    const profile = getFunProfile(wish.memberId);
    if (!profile.goalWishId) profile.goalWishId = wish.id;
  }, "Wish priced! Its owner can now choose it as a goal and save reward stars.", "reward-feedback");
}

function chooseWishGoal(wishId) {
  const member = getFunMember();
  const wish = (funState.wishes || []).find((item) => item.id === wishId);
  if (!member || !wish || !wish.cost || (!isUnlockedParent(member) && wish.memberId !== member.id)) {
    funMessage("Choose your own wish after a grown-up sets its price.", true, "reward-feedback");
    return;
  }
  commitFunChange(() => {
    getFunProfile(wish.memberId).goalWishId = wish.id;
  }, "Saving goal selected! Choosing a goal does not spend or reserve any stars.", "reward-feedback");
}

function removeWish(wishId) {
  const member = getFunMember();
  const wish = (funState.wishes || []).find((item) => item.id === wishId);
  if (!member || !wish || (!isUnlockedParent(member) && wish.memberId !== member.id)) {
    funMessage("Choose your own wish to remove, or ask a grown-up.", true, "reward-feedback");
    return;
  }
  commitFunChange(() => {
    funState.wishes = funState.wishes.filter((item) => item.id !== wish.id);
    const profile = getFunProfile(wish.memberId);
    if (profile.goalWishId === wish.id) delete profile.goalWishId;
  }, "Wish removed. Existing reward requests and reserved stars are unchanged.", "reward-feedback");
}

function renderWishlist(member) {
  document.querySelectorAll("#wishlist-form input, #wishlist-form select, #wishlist-form button")
    .forEach((control) => { control.disabled = !member; });
  const list = document.getElementById("wishlist");
  list.replaceChildren();
  const wishes = (funState.wishes || []).filter((wish) => member &&
    (isUnlockedParent(member) || wish.memberId === member.id));
  if (!wishes.length) list.append(funElement("p", "Dream it, add it, then ask a grown-up to set its reward-star price.", "fun-note"));
  for (const wish of wishes) {
    const owner = members.find((candidate) => candidate.id === wish.memberId);
    const card = funElement("article", undefined, "shop-item wish-card");
    const icon = funElement("span", wishIcons[wish.icon || "gift"], "wish-icon");
    icon.setAttribute("aria-hidden", "true");
    card.append(icon, funElement("h4", wish.title),
      funElement("span", `${owner.name}'s wish`),
      funElement("strong", wish.cost ? `${wish.cost} reward stars` : "Waiting for a grown-up's price"));
    const current = getFunProfile(owner.id).goalWishId === wish.id;
    if (current) card.append(funElement("span", "Current saving goal", "wish-goal-label"));
    if (isUnlockedParent(member)) {
      const form = funElement("form", undefined, "fun-form wish-price-form");
      const label = funElement("label", "Price in reward stars", "fun-field");
      const input = document.createElement("input");
      input.type = "number";
      input.name = "cost";
      input.min = "1";
      input.max = "10000";
      input.step = "1";
      input.required = true;
      input.value = wish.cost || "";
      input.setAttribute("aria-label", `${owner.name}'s ${wish.title}: price in reward stars`);
      label.append(input);
      const save = funElement("button", wish.cost ? "Update price" : "Set price", "primary-button");
      save.type = "submit";
      form.append(label, save);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        priceWish(wish.id, input.valueAsNumber);
      });
      card.append(form);
    }
    card.append(funButton(current ? "Current goal" : member.id === owner.id ? "Make this my goal" : `Set goal for ${owner.name}`,
      () => chooseWishGoal(wish.id), !wish.cost || current));
    if (member.id === owner.id && wish.cost) {
      const pending = funState.requests.some((request) => request.wishId === wish.id &&
        request.memberId === owner.id && ["pending", "approved"].includes(request.status));
      card.append(funButton(pending ? "Requested" : "Redeem this wish",
        () => requestReward(wish.id, true), pending || member.stars < wish.cost));
    }
    card.append(funButton("Remove wish", () => removeWish(wish.id)));
    list.append(card);
  }
}

function renderRewardGoal(member) {
  const wish = getWishGoal(member);
  const pending = wish && funState.requests.find((request) => request.wishId === wish.id &&
    request.memberId === member.id && ["pending", "approved"].includes(request.status));
  const percent = wish ? pending ? 100 : Math.min(100, Math.floor(member.stars / wish.cost * 100)) : 0;
  document.getElementById("reward-goal-title").textContent = wish ? wish.title : "Big dreams start with little wins!";
  document.getElementById("reward-goal-description").textContent = pending
    ? `${pending.cost} reward stars reserved. ${pending.status === "approved" ? "Approved! Your reward is on its way." : "Waiting for a grown-up to approve."}`
    : wish ? `${Math.max(0, wish.cost - member.stars)} more reward stars to reach your goal.`
      : "Add a wish below. A grown-up sets the price, then you choose what to save for.";
  document.getElementById("reward-goal-balance").textContent = member
    ? `${member.stars.toLocaleString()} reward stars available${wish && !pending ? ` / ${wish.cost.toLocaleString()} for this wish` : ""}`
    : "Choose who's playing to start your wish jar.";
  document.getElementById("reward-goal-percent").textContent = `${percent}%`;
  const progress = document.getElementById("reward-goal-progress");
  progress.value = percent;
  progress.setAttribute("aria-valuetext", pending ? "Goal funded; reward requested" : `${percent}% of your saving goal`);
  const height = 124 * percent / 100;
  document.getElementById("piggy-fill").setAttribute("height", height);
  document.getElementById("piggy-fill").setAttribute("y", 188 - height);
  const redeem = document.getElementById("reward-goal-redeem");
  redeem.hidden = !wish;
  redeem.disabled = !wish || !!pending || member.stars < wish.cost;
  redeem.textContent = pending ? "Reward requested!"
    : wish && member.stars < wish.cost ? `Keep saving - ${wish.cost - member.stars} more stars!`
      : "My piggy is ready - redeem!";
  const note = document.getElementById("routine-goal-note");
  note.textContent = pending ? `Your wish "${wish.title}" is requested!`
    : wish ? `${wish.title} · ${percent}% saved · ${Math.max(0, wish.cost - member.stars)} reward stars to go`
      : "Add a dream to your wishlist and choose your next saving goal.";
}

function renderRoutineRewardPreview(member) {
  const list = document.getElementById("routine-reward-preview");
  list.replaceChildren();
  const available = member ? [
    ...getShopRewards().map((reward) => ({ ...reward, fromWishlist: false })),
    ...(funState.wishes || []).filter((wish) => wish.memberId === member.id && wish.cost &&
      !funState.requests.some((request) => request.wishId === wish.id &&
        request.memberId === member.id && ["pending", "approved"].includes(request.status)))
      .map((wish) => ({ ...wish, fromWishlist: true })),
  ].filter((reward) => reward.cost <= member.stars).sort((a, b) => a.cost - b.cost).slice(0, 3) : [];
  if (!available.length) list.append(funElement("p", "Keep collecting reward stars! Your wishlist and full reward shop are in Rewards.", "fun-note"));
  for (const reward of available) {
    const card = funElement("article", undefined, "shop-item");
    card.append(funElement("strong", reward.title), funElement("span", `${reward.cost} reward stars`),
      funButton("Redeem reward", () => {
        openRewardPage();
        requestReward(reward.id, reward.fromWishlist);
      }));
    list.append(card);
  }
}

function renderRewardShop(member) {
  const panel = document.getElementById("rewards-panel");
  if (panel.dataset.memberId !== (member?.id || "")) {
    funMessage("", false, "reward-feedback");
    panel.dataset.memberId = member?.id || "";
  }
  const adult = isUnlockedParent(member);
  document.getElementById("reward-shop-management").hidden = !adult;
  document.querySelectorAll("#reward-shop-form input, #reward-shop-form button")
    .forEach((control) => { control.disabled = !adult; });
  const shop = document.getElementById("reward-shop");
  shop.replaceChildren();
  for (const reward of getShopRewards()) {
    const card = funElement("article", undefined, "shop-item");
    card.append(funElement("strong", reward.title), funElement("span", `${reward.cost} reward stars`));
    if (reward.id === greenlightReward.id) {
      card.classList.add("greenlight-reward");
      card.append(funElement("p", "\u{1F4B3} 100 star coins = $1. A parent transfers the money to your Greenlight card manually after approval.", "fun-note"));
    }
    card.append(funElement("p", !member ? "Choose a profile to redeem rewards." : member.stars >= reward.cost
      ? "Ready to redeem!"
      : `${reward.cost - member.stars} more reward stars needed`, "fun-note"));
    card.append(funButton("Redeem reward", () => requestReward(reward.id), !member || member.stars < reward.cost));
    if (adult && reward.id !== greenlightReward.id) card.append(funButton("Remove reward", () => {
      commitFunChange(() => { funState.rewards = funState.rewards.filter((item) => item.id !== reward.id); }, "Reward removed. Existing requests are unchanged.", "reward-feedback");
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
    row.append(funElement("span", `${name}: ${request.title} \u00b7 ${request.cost} reward stars \u00b7 ${request.status}`));
    if (adult && request.status === "pending") row.append(funButton("Approve", () => changeRewardRequest(request.id, "approve")));
    if (adult && request.status === "approved") row.append(funButton("Mark delivered", () => changeRewardRequest(request.id, "deliver")));
    if (["pending", "approved"].includes(request.status)) row.append(funButton("Cancel & refund", () => changeRewardRequest(request.id, "cancel")));
    list.append(row);
  }
  renderWishlist(member);
  renderRewardGoal(member);
  renderRoutineRewardPreview(member);
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

function getFamilyWallPosts() {
  return [
    ...funState.wall.filter((win) => Object.hasOwn(familyWallKinds, win.kind))
      .map((win) => ({ ...win, source: "wall" })),
    ...(funState.journal || []).map((entry) => ({
      memberId: entry.memberId, date: entry.date, title: entry.note, kind: "gratitude", source: "journal",
    })).reverse(),
  ].sort((a, b) => b.date.localeCompare(a.date));
}

function renderWall() {
  const wall = document.getElementById("celebration-wall");
  if (wall.dataset.memberId !== (activeMemberId || "")) {
    funMessage("", false, "wall-feedback");
    document.getElementById("celebration-form").reset();
    wall.dataset.memberId = activeMemberId || "";
  }
  wall.replaceChildren();
  const posts = getFamilyWallPosts();
  if (!posts.length) wall.append(funElement("li", "What made your family smile? Share something you're grateful for, a family win, or an act of kindness."));
  for (const win of posts.slice(0, 40)) {
    const name = members.find((member) => member.id === win.memberId)?.name || "Family";
    const row = funElement("li");
    row.append(funElement("span", familyWallKinds[win.kind], "family-wall-category"),
      funElement("strong", win.title), funElement("span", `${name} \u00b7 ${dateFromKey(win.date).toLocaleDateString()}`));
    if (win.source === "journal") {
      row.append(funElement("span", "From grateful journal"));
      if (activeMemberId === win.memberId) row.append(funButton("Edit my note", () => {
        document.getElementById("gratitude-date").value = win.date;
        activateTheme("routine");
        renderGratitudeJournal();
        document.getElementById("gratitude-note").focus();
      }));
    } else if (isUnlockedParent(getFunMember()) || activeMemberId === win.memberId) {
      row.append(funButton("Remove", () => {
        if (!isUnlockedParent(getFunMember()) && activeMemberId !== win.memberId) {
          funMessage("Choose your own profile or unlock a parent profile to remove this post.", true, "wall-feedback");
          return;
        }
        commitFunChange(() => { funState.wall = funState.wall.filter((item) => item.id !== win.id); }, "Family post removed.", "wall-feedback");
      }));
    }
    wall.append(row);
  }
  if (posts.length > 40) wall.append(funElement("li", "Showing the latest 40 family posts. All posts are included in your backup."));
}

function getDinnerChoices() {
  const date = document.getElementById("spinner-date").value;
  return isValidDateKey(date)
    ? [...new Set(meals.filter((meal) => meal.date === date).map((meal) => meal.name))]
    : [];
}

function spinFamilyTime() {
  if (familyTimeBusy) return;
  const choices = familyTimeActivities.filter((activity) => activity !== lastFamilyTimeActivity);
  const activity = choices[Math.floor(Math.random() * choices.length)];
  const button = document.getElementById("spin-family-time");
  const wheelButton = document.getElementById("spin-family-wheel");
  const card = document.getElementById("family-time-spinner");
  const result = document.getElementById("family-time-result");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  familyTimeBusy = true;
  button.disabled = true;
  wheelButton.disabled = true;
  card.classList.add("is-spinning");
  result.classList.remove("is-revealed");
  button.textContent = "Picking our next adventure...";
  result.setAttribute("aria-busy", "true");
  result.textContent = "A little together-time is on its way...";
  const target = 360 - (activity.category * 60 + 30);
  familyTimeRotation += 1080 + ((target - familyTimeRotation % 360 + 360) % 360);
  document.getElementById("family-time-wheel").style.transform = `rotate(${familyTimeRotation}deg)`;
  const finish = () => {
    lastFamilyTimeActivity = activity;
    const confetti = funElement("div", "", "family-time-confetti");
    confetti.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 8; index += 1) {
      const piece = funElement("span");
      piece.style.setProperty("--piece", index);
      confetti.append(piece);
    }
    result.replaceChildren(
      confetti,
      funElement("p", "\u2728 YOUR FAMILY MINI-ADVENTURE", "family-time-reveal-label"),
      funElement("strong", activity.title),
      funElement("p", `\u23F1 ${activity.minutes} minutes together`, "family-time-duration"),
      funElement("p", activity.instructions),
      funElement("p", `Set a ${activity.minutes}-minute timer, including setup, and wrap up when it rings.`, "fun-note"),
    );
    result.setAttribute("aria-busy", "false");
    result.classList.add("is-revealed");
    card.classList.remove("is-spinning");
    button.disabled = false;
    wheelButton.disabled = false;
    button.textContent = "\u{1F3B2} One more idea!";
    familyTimeBusy = false;
  };
  if (reducedMotion) finish();
  else window.setTimeout(finish, 1300);
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

function renderGratitudeJournal() {
  const member = getFunMember();
  const dateInput = document.getElementById("gratitude-date");
  const today = toDateKey(new Date());
  dateInput.max = today;
  if (!dateInput.value) dateInput.value = today;
  const date = dateInput.value;
  const form = document.getElementById("gratitude-form");
  const entry = (funState.journal || []).find((item) => item.memberId === member?.id && item.date === date);
  const key = JSON.stringify([member?.id || "", date]);
  if (form.dataset.context !== key || form.dataset.savedNote !== (entry?.note || "")) {
    form.elements.note.value = entry?.note || "";
    document.getElementById("gratitude-feedback").textContent = "";
  }
  form.dataset.context = key;
  form.dataset.savedNote = entry?.note || "";
  const available = !!member && isValidDateKey(date) && date <= today;
  form.elements.note.disabled = !available;
  form.querySelector("button").disabled = !available;
  form.querySelector("button").textContent = entry ? "Update my note" : "Save my grateful note";
  document.getElementById("gratitude-person").textContent = member
    ? `${member.name}'s night-time reflection · ${isValidDateKey(date) ? formatMealDate(date) : "Choose a date"}`
    : "Choose who's playing to write your own grateful note.";
  document.getElementById("gratitude-reward").textContent = !member
    ? "Choose your profile with Playing as, then write your note. Parents can write too after unlocking their profile."
    : !available ? "This is a future or invalid date. Choose Write today's note to start writing."
    : entry?.rewarded ? "\u2605 10 coins already earned for this note. Edits do not earn extra coins."
      : member.role === "child" && date === toDateKey(new Date())
        ? "\u2605 Save today's grateful note to earn 10 coins, once today."
        : member.role === "child" ? "You can write about earlier days. The 10-coin reward is only for today's note."
          : "A quiet moment to appreciate your day. Grown-up notes do not earn coins.";
}

document.getElementById("gratitude-date").addEventListener("change", renderGratitudeJournal);
document.getElementById("gratitude-start").addEventListener("click", () => {
  document.getElementById("gratitude-date").value = toDateKey(new Date());
  renderGratitudeJournal();
  if (!getFunMember()) {
    document.getElementById("active-person-badge").click();
    return;
  }
  document.getElementById("gratitude-note").focus();
});
document.getElementById("view-family-wall").addEventListener("click", () => {
  activateTheme("fun");
  const wall = document.getElementById("family-wall");
  wall.open = true;
  wall.scrollIntoView({ block: "start" });
  wall.querySelector("summary").focus();
});

document.getElementById("gratitude-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = getFunMember();
  const date = document.getElementById("gratitude-date").value;
  const note = event.currentTarget.elements.note.value.trim();
  const today = toDateKey(new Date());
  if (!member || !isValidDateKey(date) || date > today || !isFunText(note, 2000)) {
    funMessage("Choose your profile and today or an earlier date, then write a grateful note of 1 to 2,000 characters.", true, "gratitude-feedback");
    return;
  }
  const entry = (funState.journal || []).find((item) => item.memberId === member.id && item.date === date);
  const award = member.role === "child" && date === today && !entry?.rewarded;
  const saved = commitFunChange(() => {
    funState.journal ||= [];
    if (entry) {
      entry.note = note;
      if (award) entry.rewarded = true;
    } else funState.journal.push({ memberId: member.id, date, note, rewarded: award });
    if (award) member.stars += 10;
  }, "", "gratitude-feedback", award);
  if (saved) funMessage(award ? "Grateful note shared on the Family Gratitude Wall! +10 reward stars (coins) added to your piggy bank."
    : "Your grateful note is saved and shared on the Family Gratitude Wall.", false, "gratitude-feedback");
});

function renderFunHub() {
  const member = getFunMember();
  document.getElementById("fun-wallet").textContent = member ? `${member.stars} reward stars to spend` : "";
  document.getElementById("fun-profile-note").textContent = member
    ? `Playing as ${member.name}. Progress stays in this browser. Use the Playing as button above to switch family members.`
    : "Family Time needs no profile. Add family members in Settings for personal games and rewards.";
  document.querySelectorAll("#celebration-form textarea, #celebration-form select, #celebration-form button").forEach((control) => { control.disabled = !member; });
  renderAdventure();
  renderArcade(member);
  renderBingo(member);
  renderQuest(member);
  renderPetShop(member);
  renderRewardShop(member);
  renderGratitudeJournal();
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
  if (!isUnlockedParent(member) || !title || title.length > 60 || !Number.isInteger(cost) || cost < 1 || cost > 10000) {
    funMessage("Choose an adult profile and enter a whole-number reward-star price between 1 and 10,000.", true, "reward-feedback");
    return;
  }
  if (commitFunChange(() => {
    funState.rewards.push({ id: funId(), title, cost });
  }, "Reward added to the shop.", "reward-feedback")) form.reset();
});
document.getElementById("wishlist-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = getFunMember();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const icon = form.elements.icon.value;
  if (!member || !isFunText(title, 60) || !Object.hasOwn(wishIcons, icon)) {
    funMessage("Choose a profile, an icon, and a wish of up to 60 characters.", true, "reward-feedback");
    return;
  }
  if (commitFunChange(() => {
    funState.wishes ||= [];
    funState.wishes.unshift({ id: funId(), memberId: member.id, title, icon });
  }, "Wish added! A grown-up can set its reward-star price.", "reward-feedback")) form.reset();
});
document.getElementById("reward-goal-redeem").addEventListener("click", () => {
  const wish = getWishGoal(getFunMember());
  if (wish) requestReward(wish.id, true);
});
document.getElementById("celebration-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const member = getFunMember();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const kind = form.elements.kind.value;
  if (!member || !title || title.length > 200 || !["gratitude", "family-win", "kindness"].includes(kind)) {
    funMessage("Choose a profile, a sharing category, and a message of 1 to 200 characters.", true, "wall-feedback");
    return;
  }
  if (commitFunChange(() => {
    funState.wall.unshift({ id: funId(), memberId: member.id, title, kind, date: toDateKey(new Date()) });
  }, "Shared with your family! Thank you for spreading a little joy.", "wall-feedback")) form.reset();
});
document.getElementById("spin-dinner").addEventListener("click", () => {
  const choices = getDinnerChoices();
  const date = document.getElementById("spinner-date").value;
  document.getElementById("spinner-result").textContent = choices.length
    ? `Dinner for ${formatMealDate(date)}: ${choices[Math.floor(Math.random() * choices.length)]}!`
    : "Add a meal for the selected date first.";
});
document.getElementById("spin-family-time").addEventListener("click", spinFamilyTime);
document.getElementById("spin-family-wheel").addEventListener("click", spinFamilyTime);
document.getElementById("routine-family-time").addEventListener("click", () => {
  activateTheme("fun");
  document.getElementById("family-time-spinner").scrollIntoView({ block: "start" });
  document.getElementById("spin-family-time").focus();
});
document.getElementById("spin-helper").addEventListener("click", () => {
  document.getElementById("spinner-result").textContent = members.length
    ? `Today's kitchen helper: ${members[Math.floor(Math.random() * members.length)].name}! An adult chooses a safe job.`
    : "Add a family profile in Settings first.";
});

document.getElementById("spinner-date").value = toDateKey(new Date());
document.getElementById("spinner-date").addEventListener("change", renderDinnerSpinner);
renderFunHub();
renderGameRewards(getFunMember());
