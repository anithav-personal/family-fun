const parentPinKey = "family-fun-parent-pin";
const parentPinIterations = 600000;
let parentPinBlocked = false;
let parentPinRecord = readParentPin();
let unlockedParentId = "";
let parentSetupUnlocked = false;
let pendingParentRequest = null;
let parentPinBusy = false;

function readParentPin() {
  try {
    const raw = localStorage.getItem(parentPinKey);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || value.iterations !== parentPinIterations ||
        typeof value.salt !== "string" || typeof value.hash !== "string" ||
        !/^[a-f0-9]{32}$/.test(value.salt) || !/^[a-f0-9]{64}$/.test(value.hash) ||
        !Number.isInteger(value.failures) || value.failures < 0 || value.failures > 5 ||
        !Number.isSafeInteger(value.retryAfter) || value.retryAfter < 0) throw new Error("Invalid PIN record");
    return value;
  } catch {
    parentPinBlocked = true;
    return null;
  }
}

function isUnlockedParent(member) {
  return !!member && member.role === "adult" && unlockedParentId === member.id;
}

function canUseParentSettings() {
  return isUnlockedParent(members.find((member) => member.id === activeMemberId)) ||
    (parentSetupUnlocked && !activeMemberId && !members.some((member) => member.role === "adult"));
}

function requireParentSettings() {
  if (canUseParentSettings()) return true;
  setDataFeedback("Unlock a parent profile with the parent PIN to use Settings.", true);
  return false;
}

function updateParentControls() {
  const allowed = canUseParentSettings();
  document.querySelector(".theme-tabs").style.setProperty("--section-columns", allowed ? 6 : 5);
  for (const id of ["settings-tab", "manage-profiles", "profile-picker-settings", "change-parent-pin", "lock-parent"]) {
    document.getElementById(id).hidden = !allowed;
  }
  document.getElementById("setup-family").hidden = members.some((member) => member.role === "adult") || allowed;
  const kidOption = document.querySelector('#member-form [name="relationship"] option[value="Kid"]');
  kidOption.disabled = parentSetupUnlocked;
  if (parentSetupUnlocked) document.querySelector('#member-form [name="relationship"]').value = "Adult";
  if (!allowed && document.getElementById("settings-tab").getAttribute("aria-selected") === "true") activateTheme("routine");
}

function lockParentAccess() {
  closeGoalCelebration();
  unlockedParentId = "";
  parentSetupUnlocked = false;
  renderRewards();
  renderGameForProfile();
}

async function deriveParentPin(pin, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bytes = Uint8Array.from(salt.match(/../g), (part) => parseInt(part, 16));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: bytes, iterations: parentPinIterations, hash: "SHA-256" }, key, 256);
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requestParentUnlock(memberId = "", changePin = false) {
  if (changePin && !canUseParentSettings()) return;
  if (memberId && !members.some((member) => member.id === memberId && member.role === "adult")) return;
  if (!memberId && !changePin && members.some((member) => member.role === "adult")) return;
  parentPinBlocked = false;
  parentPinRecord = readParentPin();
  const dialog = document.getElementById("parent-pin-dialog");
  const form = document.getElementById("parent-pin-form");
  form.reset();
  document.getElementById("parent-pin-feedback").textContent = parentPinBlocked
    ? "Parent PIN storage could not be read safely. Recover this browser's PIN storage before unlocking." : "";
  const setup = !parentPinRecord;
  document.getElementById("parent-pin-heading").textContent = setup ? "Set your parent PIN" : changePin ? "Change parent PIN" : "Unlock parent profile";
  document.getElementById("parent-pin-current-field").hidden = setup;
  form.elements.currentPin.required = !setup;
  form.elements.currentPin.disabled = setup;
  for (const name of ["newPin", "confirmPin"]) {
    form.elements[name].required = setup || changePin;
    form.elements[name].disabled = !(setup || changePin);
  }
  document.getElementById("parent-pin-new-fields").hidden = !(setup || changePin);
  document.getElementById("parent-pin-submit").disabled = parentPinBlocked;
  pendingParentRequest = { memberId, changePin };
  document.getElementById("profile-picker").close();
  dialog.showModal();
  (setup ? form.elements.newPin : form.elements.currentPin).focus();
}

document.getElementById("parent-pin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (parentPinBusy || !pendingParentRequest || parentPinBlocked) return;
  const request = pendingParentRequest;
  const form = event.currentTarget;
  const dialog = document.getElementById("parent-pin-dialog");
  const feedback = document.getElementById("parent-pin-feedback");
  const setup = !parentPinRecord;
  const current = form.elements.currentPin.value;
  const next = form.elements.newPin.value;
  if ((!setup && !/^\d{4,8}$/.test(current)) ||
      ((setup || request.changePin) && (!/^\d{4,8}$/.test(next) || next !== form.elements.confirmPin.value))) {
    feedback.textContent = "Use 4 to 8 digits. Your new PIN and confirmation must match.";
    return;
  }
  if (parentPinRecord?.retryAfter > Date.now()) {
    feedback.textContent = "Too many attempts. Wait 30 seconds before trying again.";
    return;
  }
  parentPinBusy = true;
  document.getElementById("parent-pin-submit").disabled = true;
  try {
    if (!setup) {
      const hash = await deriveParentPin(current, parentPinRecord.salt);
      if (pendingParentRequest !== request || !dialog.open) return;
      if (hash !== parentPinRecord.hash) {
        const failures = Math.min(5, parentPinRecord.failures + 1);
        const record = { ...parentPinRecord, failures, retryAfter: failures >= 5 ? Date.now() + 30000 : 0 };
        localStorage.setItem(parentPinKey, JSON.stringify(record));
        parentPinRecord = record;
        feedback.textContent = failures >= 5 ? "Too many attempts. Wait 30 seconds before trying again." : "Incorrect PIN. Please try again.";
        form.elements.currentPin.value = "";
        form.elements.currentPin.focus();
        return;
      }
    }
    let record = parentPinRecord && { ...parentPinRecord, failures: 0, retryAfter: 0 };
    if (setup || request.changePin) {
      const salt = [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      record = { version: 1, iterations: parentPinIterations, salt, hash: await deriveParentPin(next, salt), failures: 0, retryAfter: 0 };
    }
    if (pendingParentRequest !== request || !dialog.open) return;
    localStorage.setItem(parentPinKey, JSON.stringify(record));
    parentPinRecord = record;
    if (request.changePin) {
      setDataFeedback("Parent PIN updated for this browser.");
    } else if (request.memberId) {
      if (!members.some((member) => member.id === request.memberId && member.role === "adult")) throw new Error("Parent profile no longer exists");
      unlockedParentId = request.memberId;
      parentSetupUnlocked = false;
      applyProfileSelection(request.memberId);
    } else {
      unlockedParentId = "";
      parentSetupUnlocked = true;
      activeMemberId = "";
      renderRewards();
      activateTheme("settings");
      document.getElementById("settings-heading").focus();
    }
    dialog.close();
  } catch {
    feedback.textContent = "Could not verify or save the parent PIN. Check browser storage and try again. Your PIN and access have not been changed.";
  } finally {
    parentPinBusy = false;
    document.getElementById("parent-pin-submit").disabled = parentPinBlocked;
  }
});

document.getElementById("parent-pin-dialog").addEventListener("close", () => {
  pendingParentRequest = null;
  document.getElementById("parent-pin-form").reset();
});
document.getElementById("cancel-parent-pin").addEventListener("click", () => document.getElementById("parent-pin-dialog").close());
document.getElementById("setup-family").addEventListener("click", () => requestParentUnlock());
document.getElementById("change-parent-pin").addEventListener("click", () => requestParentUnlock("", true));
document.getElementById("lock-parent").addEventListener("click", lockParentAccess);
window.addEventListener("storage", (event) => {
  if (event.key === parentPinKey || event.key === null) {
    document.getElementById("parent-pin-dialog").close();
    parentPinBlocked = false;
    parentPinRecord = readParentPin();
    lockParentAccess();
  }
});
