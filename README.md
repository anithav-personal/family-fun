# family-fun

Family Fun brings the family together with a shared family calendar and short
daily brain-game exercises everyone can enjoy.

## Initial features

- A responsive family dashboard with a month calendar and a list of events for
  the selected day.
- A side-panel to-do list with multi-member assignments, optional deadlines,
  and optional reminders.
- Add family events with a title and family member; events appear on the
  calendar and can be removed.
- A daily number puzzle with answer feedback and a completed-for-today state.
- Add family members, set each member's points goal, assign chores and tasks to
  kids, and track earned points and stars.
- In Play Time, log a positive whole number of plant, protein, or healthy-fat
  points for a meal or snack instead of entering food names. Points count toward
  Healthy Hero badges and rewards; plant points also grow your virtual pet.
  Previously saved food entries still count as one point each.
- Save calendar events, game completion, family members, assignments, and
  rewards in the current browser.

## Profiles & play

Use **Manage profiles** beside the profile selector to add family members.
Each member card in Teamwork lets you update their age. Newly added profiles
are selected automatically. Names and ages are browser data, not published
website content; keep exported backups private.

Kid profiles can choose **Block World**, an original Minecraft-inspired
grass-and-block design, or **Cube Puzzle**, a colorful cube-puzzle design.
Set the theme when adding a profile or change it on the child's member card.
Existing kid profiles default to Block World; Classic remains available.
Themes follow the active profile, support day/night mode, and are included
in backups. Adult profiles retain the standard design. No game artwork,
logos, or branded assets are used.

Play Time now includes:

- **Brain arcade:** word scrambles, riddles, odd-one-out, visual patterns,
  memory pairs, and quick math, alongside the original number patterns.
  Difficulty adapts to ages 6 and under, 7-9, 10-12, and teens/adults.
  Children without an age use the gentle 7-9 band; adults default to the
  teen/adult band. Younger players may need help reading. Each arcade game
  awards children one star and one brain star per day. Extra questions and
  memory replays are practice, not extra rewards.
- **Pet shop:** buy hats, scenes, and toys using earned stars. Equip or remove
  owned items for free. Create a Plant Pal first.
- **Family bingo:** a shared nine-square board changes each Monday. The child
  completing the week's first row, column, or diagonal earns one bonus star.
- **Mystery quests:** reveal a profile-specific daily activity and mark it
  complete. Children earn one star once per day.
- **Reward shop:** adult profiles define rewards and prices. Requests reserve
  stars; adults approve and mark rewards delivered. Canceling a pending or
  approved request refunds its stars exactly once. Removing a shop reward
  does not remove outstanding requests.
- **Adventure map:** completed puzzles, arcade games, bingo squares, mystery
  quests, chores/tasks, and Healthy Hero completions unlock six story chapters.
  Progress starts when these features are first used; past activities are not
  retroactively counted.
- **Dinner spinner:** in What's Cooking, choose a dinner date and randomly pick
  only from meals planned for that date, or pick a family helper. An adult
  should choose safe, age-appropriate kitchen jobs.
- **Celebration wall:** automatically collect milestones and badges, or add
  your own little wins. The latest 40 appear on screen; backups keep all wins.

All play progress, purchases, requests, and milestones are saved locally and
included in Export data / Import data. Older backups still import with empty
extra-play progress. Profiles are not accounts: choosing an adult profile is a
household convention, **not an authentication or parental-control boundary**.
Shared activities are shared only inside this browser, not across devices.

## Dated meal planning

In **What's Cooking**, choose a calendar date when adding a meal. Meals show
their full dates and are sorted chronologically, including across weeks,
months, and years. Use **Change date** on a meal to reschedule it. Inventory
links are kept when dates change. Dated meals are saved locally and included
in backups.

Older weekday-only plans and backups remain supported. They appear after dated
meals with **date not set** and a date field; assign their intended dates
explicitly rather than having the app guess a week. Undated meals are not
included in the dinner spinner until a date is assigned.

This first version is a browser prototype. Data is stored locally on one
browser, so family members do not yet share updates across devices. Chores award
points toward a member's goal; tasks award stars. To-do reminders are checked
while the page is open; browser notifications are optional and require
permission. Accounts, calendar integrations, and a larger game library are later
features.

## Run

Open `index.html` in a modern browser. No build step or dependencies are needed.