let earningsTimeout;
let goalEndingTimeout;
const rewardSoundKey = "family-fun-reward-sounds";
let rewardSoundsEnabled = false;
let rewardSoundGeneration = 0;
const rewardSoundNodes = new Set();
try {
  rewardSoundsEnabled = localStorage.getItem(rewardSoundKey) === "on";
} catch {
  document.getElementById("data-feedback").textContent = "Reward sound preferences could not be loaded. Sounds are off for now.";
}

function renderRewardSoundControl() {
  const button = document.getElementById("reward-sound-toggle");
  button.setAttribute("aria-pressed", String(rewardSoundsEnabled));
  button.textContent = rewardSoundsEnabled ? "\u{1F50A} Reward sounds on" : "\u{1F507} Reward sounds off";
  button.title = rewardSoundsEnabled ? "Mute reward sounds. Calendar alarms are separate."
    : "Enable gentle coin and game-time sounds. Calendar alarms are separate.";
}

function stopRewardSounds() {
  rewardSoundGeneration += 1;
  for (const { oscillator, gain } of rewardSoundNodes) {
    oscillator.onended = null;
    oscillator.stop();
    oscillator.disconnect();
    gain.disconnect();
  }
  rewardSoundNodes.clear();
}

async function playEarningSound(stars, gameMinutes) {
  if (!rewardSoundsEnabled || (stars <= 0 && gameMinutes <= 0)) return;
  stopRewardSounds();
  const generation = rewardSoundGeneration;
  try {
    alarmAudioContext ||= new AudioContext();
    if (alarmAudioContext.state !== "running") await alarmAudioContext.resume();
    if (!rewardSoundsEnabled || generation !== rewardSoundGeneration) return;
    if (alarmAudioContext.state !== "running") throw new Error("Reward audio is blocked");
    const start = alarmAudioContext.currentTime + 0.02;
    const notes = [];
    if (stars > 0) {
      for (const [index, frequency] of [1046.5, 1318.5, 1568].entries()) {
        notes.push({ frequency, offset: index * 0.18, type: "sine", duration: 0.2 });
      }
    }
    if (gameMinutes > 0) {
      const offset = stars > 0 ? 0.62 : 0;
      for (const [index, frequency] of [523.25, 659.25, 783.99, 1046.5].entries()) {
        notes.push({ frequency, offset: offset + index * 0.12, type: "triangle", duration: 0.16 });
      }
    }
    for (const note of notes) {
      const oscillator = alarmAudioContext.createOscillator();
      const gain = alarmAudioContext.createGain();
      const node = { oscillator, gain };
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        rewardSoundNodes.delete(node);
      };
      oscillator.type = note.type;
      oscillator.frequency.value = note.frequency;
      const at = start + note.offset;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.07, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + note.duration);
      oscillator.connect(gain);
      gain.connect(alarmAudioContext.destination);
      oscillator.start(at);
      rewardSoundNodes.add(node);
      oscillator.stop(at + note.duration + 0.02);
    }
  } catch {
    stopRewardSounds();
    setDataFeedback("Reward sound could not play. Toggle Reward sounds off and on to enable audio in this browser. Your earned rewards are saved.", true);
  }
}

document.getElementById("reward-sound-toggle").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const enable = !rewardSoundsEnabled;
    if (enable) {
      alarmAudioContext ||= new AudioContext();
      await alarmAudioContext.resume();
      if (alarmAudioContext.state !== "running") throw new Error("Reward audio is blocked");
    }
    rewardSoundsEnabled = enable;
    if (!enable) stopRewardSounds();
    renderRewardSoundControl();
    try {
      localStorage.setItem(rewardSoundKey, enable ? "on" : "off");
      setDataFeedback(enable ? "Reward sounds enabled. Calendar alarms are unchanged." : "Reward sounds muted. Calendar alarms are unchanged.");
    } catch {
      setDataFeedback("Sound preference changed for this visit but could not be saved. Check browser storage.", true);
    }
    if (enable) await playEarningSound(1, 0);
  } catch {
    setDataFeedback("Audio could not be enabled. Your browser may not support sound or may be blocking it.", true);
  } finally {
    button.disabled = false;
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === rewardSoundKey || event.key === null) {
    rewardSoundsEnabled = event.key !== null && event.newValue === "on";
    if (!rewardSoundsEnabled) stopRewardSounds();
    renderRewardSoundControl();
  }
});
renderRewardSoundControl();

function celebrateEarnings(memberId, stars = 0, gameMinutes = 0) {
  if (stars <= 0 && gameMinutes <= 0) return;
  const member = members.find((candidate) => candidate.id === memberId);
  if (!member) return;
  const popup = document.getElementById("earnings-celebration");
  clearTimeout(earningsTimeout);
  popup.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = `${member.name}, you earned it!`;
  popup.append(heading);
  for (const [amount, unit, icon, kind] of [
    [stars, "reward stars", "\u{1F437}", "stars"],
    [gameMinutes, "game minutes", "\u{1F3AE}", "minutes"],
  ]) {
    if (amount <= 0) continue;
    const row = document.createElement("div");
    row.className = `earnings-row earnings-${kind}`;
    const art = document.createElement("span");
    art.className = "earnings-art";
    art.setAttribute("aria-hidden", "true");
    if (kind === "stars") {
      const bank = document.querySelector(".piggy-art").cloneNode(true);
      renderPiggySavings(bank, member);
      bank.setAttribute("class", "earnings-bank");
      bank.removeAttribute("aria-label");
      for (const element of bank.querySelectorAll("[id]")) element.id = `earning-${element.id}`;
      for (const element of bank.querySelectorAll("*")) {
        for (const attribute of [...element.attributes]) {
          if (attribute.value.includes("url(#")) {
            element.setAttribute(attribute.name, attribute.value.replace(/url\(#([^)]+)\)/g, "url(#earning-$1)"));
          }
        }
      }
      art.append(bank);
    } else art.textContent = icon;
    for (let index = 0; index < 3; index += 1) {
      const coin = document.createElement("span");
      coin.className = "earning-token";
      coin.style.setProperty("--token", index);
      coin.textContent = kind === "stars" ? "\u2605" : "+";
      art.append(coin);
    }
    const label = document.createElement("span");
    label.textContent = `+${amount} ${unit}`;
    row.append(art, label);
    popup.append(row);
  }
  popup.hidden = false;
  void playEarningSound(stars, gameMinutes);
  earningsTimeout = setTimeout(() => { popup.hidden = true; popup.replaceChildren(); }, 4200);
  if (stars > 0) celebrateWishGoal(member, member.stars - stars);
}

function celebrateWishGoal(member, previousStars) {
  if (typeof getWishGoal !== "function") return false;
  const wish = getWishGoal(member);
  if (!wish || !wish.cost || previousStars >= wish.cost || member.stars < wish.cost ||
      funState.requests.some((request) => request.memberId === member.id &&
        request.wishId === wish.id && ["pending", "approved"].includes(request.status))) return false;
  return showGoalEnding(`${member.name}, quest complete!`,
    `You saved enough for "${wish.title}"! ${wish.cost.toLocaleString()} reward coins.`);
}

function showGoalEnding(title, summary) {
  const dialog = document.getElementById("goal-ending");
  const pixels = document.getElementById("goal-ending-pixels");
  clearTimeout(goalEndingTimeout);
  document.getElementById("goal-ending-title").textContent = title;
  document.getElementById("goal-ending-summary").textContent = summary;
  pixels.replaceChildren();
  for (let index = 0; index < 18; index += 1) {
    const pixel = document.createElement("span");
    if (index >= 10) pixel.className = "goal-ending-orb";
    pixel.style.setProperty("--pixel", index);
    pixel.style.setProperty("--dx", `${(index % 6 - 2.5) * 42}px`);
    pixel.style.setProperty("--dy", `${-55 - index % 3 * 30}px`);
    pixels.append(pixel);
  }
  dialog.classList.remove("is-playing");
  if (!dialog.open) dialog.showModal();
  void dialog.offsetWidth;
  dialog.classList.add("is-playing");
  goalEndingTimeout = window.setTimeout(closeGoalCelebration, 12000);
  return true;
}

function closeGoalCelebration() {
  clearTimeout(goalEndingTimeout);
  const dialog = document.getElementById("goal-ending");
  if (dialog.open) dialog.close();
  dialog.classList.remove("is-playing");
  document.getElementById("goal-ending-pixels").replaceChildren();
}

document.getElementById("goal-ending").addEventListener("close", () => {
  if (!document.getElementById("goal-ending").open) closeGoalCelebration();
});
