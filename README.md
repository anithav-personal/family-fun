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
  any family member, and track earned points and stars.
- In Play Time, log a positive whole number of plant, protein, or healthy-fat
  points for a meal or snack instead of entering food names. Points count toward
  Healthy Hero badges and rewards; plant points also grow your virtual pet.
  Previously saved food entries still count as one point each.
- Save calendar events, game completion, family members, assignments, and
  rewards in the current browser.

## Profiles & play

Use **Playing as...** in the header to open the quick profile chooser and switch
who is playing without leaving the current section. The chooser and each profile
card prominently show points earned, stars available to spend, brain stars, and
earned game-time minutes. Game time is an earned reward, not a running timer.
Use **Settings** to add family members or update their age, points goal, and
play theme. Appearance and data backups live there too. Newly added profiles
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

- **Brain arcade:** choose number patterns, word scrambles, riddles, odd-one-out,
  visual patterns, memory pairs, or quick math from one game selector. Number
  patterns and the shared game-progress summary are inside the arcade.
  Difficulty adapts to ages 6 and under, 7-9, 10-12, and teens/adults.
  Children without an age use the gentle 7-9 band; adults default to the
  teen/adult band. Younger players may need help reading. Number patterns retain
  their existing reward of one star and one brain star per solve for children.
  The other six games each award children once per day; extra questions and
  memory replays are practice, not extra rewards.
- **Pet care & shop:** feeding, food/water tracking, and the pet shop are together
  in **Pet care, food & water**. Create a Plant Pal, then buy hats, scenes, and
  toys using earned stars. Equip or remove owned items for free. Star balance
  and purchase/save feedback appear beside the shop.
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

## Chores, tasks & routines

In **Calendar**, use **Create event, task or routine** to add a family event,
chore, or task for any family member. Give it a start date, an optional local time, and
choose **Does not repeat**, **Daily**, **Weekly**, or **Monthly**. Weekly routines
repeat on the start date's weekday. Monthly routines keep the original day of
the month, using the last day of shorter months (January 31 repeats on February
28 or 29, then March 31). Dates before the start date are never included.

Scheduled events and assignments automatically appear in the **Calendar** day
agenda in time order. Assignments show their assignee, reward, and completion
button. Blank times are shown as **Any time**. Events can be for **Everyone**
or a particular family member and support the same recurrence options.
The weekly **Routine chart** works for every person, including adults. Use
**Responsibilities for** to see one person's assignments and shared events, or
the whole family. Switching the active profile selects that person's routine;
the chart filter can also be changed without switching who is playing.
Browse other weeks or use **My routine chart** to return to this week.

Each occurrence can be completed once, on its date or later, earning points for
chores or stars for tasks. Future occurrences cannot be completed early. Past
missed occurrences stay on their original dates; they do not roll into today.
Completion history is retained separately for each occurrence. **Edit schedule**
lets you add dates to older unfinished assignments or adjust a new routine.
After the first completion, start dates and repeats are fixed to preserve reward
history; times and alerts remain editable. Remove and recreate a routine to replace its
schedule; removing it does not remove earned rewards.

Existing undated assignments and older backups remain supported without guessed
dates or repeated rewards. Schedules and completion history stay in local browser
storage and are included in backups. Removing a recurring event removes its
entire series.

When a plan has a time, optionally add a **Reminder** or an **Alarm with sound**,
at its start or 5, 15, 30, or 60 minutes beforehand. Alerts follow each occurrence,
including alerts that fall on the previous evening. Completed tasks do not
alert again, and each occurrence's notification history prevents repeat alerts.
Use **Enable sound & notifications** to grant browser permissions. In-page notices
remain available if permission is denied. Keep this page open: this static app
cannot deliver reliable background or closed-browser alarms, and device sleep
may delay them. Only today's occurrences and advance alerts for tomorrow are
checked; older missed days are not replayed as a backlog.

The former Teamwork and Reminders tabs are consolidated into Calendar and
Settings. Existing shared checklists and standalone alerts remain available as
expandable sections in Calendar, with their data and backups preserved.

The interface uses larger text and controls, labeled navigation cards, day and
routine shortcuts, visible keyboard focus, and playful profile-aware colors.
Hover effects respect reduced-motion preferences. The calendar, meal planner,
Settings, reminders, and games remain available in both day and night mode.

This first version is a browser prototype. Data is stored locally on one
browser, so family members do not yet share updates across devices. Chores award
points toward a member's goal; tasks award stars. To-do reminders are checked
while the page is open; browser notifications are optional and require
permission. Accounts, calendar integrations, and a larger game library are later
features.

## Run

Open `index.html` in a modern browser. No build step or dependencies are needed.