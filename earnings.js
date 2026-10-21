let earningsTimeout;

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
  earningsTimeout = setTimeout(() => { popup.hidden = true; popup.replaceChildren(); }, 4200);
}
