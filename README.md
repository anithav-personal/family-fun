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
  any family member, and track earned game time and reward stars.
- In Play Time, log a positive whole number of plant, protein, or healthy-fat
  points for a meal or snack instead of entering food names. Points count toward
  Healthy Hero badges and rewards; plant points also grow your virtual pet.
  Previously saved food entries still count as one point each.
- Save calendar events, game completion, family members, assignments, and
  rewards in the current browser.

## Profiles & play

Use **Playing as...** in the header to open the quick profile chooser and switch
who is playing without leaving the current section. The chooser and each profile
card prominently show one **Game time earned** balance, reward stars available
to redeem, and brain stars. Chore points are not shown again as a second balance:
their game minutes and brain-game bonus minutes already contribute to the earned
total. Existing chore-point history and targets remain available in Settings.
Game time is an earned reward, not a running timer.
**Reward stars** are the redeemable shop currency; **brain stars** track puzzle
progress. Existing star balances and backups are unchanged by this naming update.
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
  their existing reward of one reward star and one brain star per solve for children.
  The other six games each award children once per day; extra questions and
  memory replays are practice, not extra rewards.
- **Pet care & shop:** feeding, food/water tracking, and the pet shop are together
  in **Pet care, food & water**. Create a Plant Pal, then buy hats, scenes, and
  toys using earned reward stars. Equip or remove owned items for free. Reward-star balance
  and purchase/save feedback appear beside the shop.
- **Family bingo:** a shared nine-square board changes each Monday. The child
  completing the week's first row, column, or diagonal earns one bonus reward star.
- **Mystery quests:** reveal a profile-specific daily activity and mark it
  complete. Children earn one reward star once per day.
- **Reward shop:** adult profiles define rewards and prices. Requests reserve
  reward stars; adults approve and mark rewards delivered. Canceling a pending or
  approved request refunds its reward stars exactly once. Removing a shop reward
  does not remove outstanding requests.
- **Adventure map:** completed puzzles, arcade games, bingo squares, mystery
  quests, chores/tasks, and Healthy Hero completions unlock six story chapters.
  Progress starts when these features are first used; past activities are not
  retroactively counted.
- **Dinner spinner:** in What's Cooking, choose a dinner date and randomly pick
  only from meals planned for that date, or pick a family helper. An adult
  should choose safe, age-appropriate kitchen jobs.
- **Family Gratitude Wall:** intentionally share gratefulness, family wins,
  and acts of kindness, with a category and a message of up to 200 characters.
  Routine completions, games, badges, pet purchases, adventure chapters, and
  reward deliveries no longer create wall posts. Older automatic activity
  records are hidden from the wall but retained in backups; existing manually
  shared wins stay visible. The latest 40 family posts appear on screen;
  backups keep all posts. You can remove your own direct posts, and unlocked
  parents can remove any direct family post. Sharing does not award coins.
  All saved grateful journal notes, including older entries, appear on the wall
  automatically with their author and date. Journal notes are displayed directly
  from the journal, so edits update the wall without duplicate posts or extra
  rewards. Use **Edit my note** to update your journal entry.

All play progress, purchases, requests, and milestones are saved locally and
included in Export data / Import data. Older backups still import with empty
extra-play progress. Parent profiles require this browser's parent PIN.
Profiles are not server accounts; browser-local PINs are not a tamper-proof
authentication or parental-control boundary.
Shared activities are shared only inside this browser, not across devices.

### Parent PIN and Settings

The first time a parent profile is chosen, a parent sets and confirms one shared
4–8 digit household PIN. There is no default PIN. Each switch into a parent
profile requires that PIN, including switching between parents. Switching to a
child, selecting **Lock parent profile**, or reloading locks parent access.
Settings and its shortcuts are hidden in child profiles; keyboard navigation
skips the hidden tab. Reward pricing and approvals require an unlocked parent.

Use **Parent setup** on a new or children-only household to set the PIN and add
the first parent profile. In unlocked Settings, **Change parent PIN** requires
the current PIN. Five failed attempts impose a 30-second cooldown, retained
across reloads. Changing the PIN in another tab relocks parent access here.

Only a randomly salted PBKDF2-SHA-256 verifier (600,000 iterations) is stored,
not the PIN itself. The PIN belongs to this browser and is deliberately excluded
from family backups; importing family data does not replace it and relocks
access. Configure it separately on each device. Keep a current family backup:
there is no PIN-reset back door. Clearing site data to reset a forgotten PIN
also removes family data, which must then be restored from a backup.

This is a convenience lock for shared household use, not protection against
someone who can edit browser storage, run developer tools, or access the device.
The initial PIN must be set by a parent before handing the device to children.

### Earning celebrations

Saved reward-star earnings drop animated star coins into a miniature piggy bank.
Saved chore minutes and brain-game bonus minutes get their own game-token
celebration. Tasks, daily arcade games, number patterns, bingo, mystery missions,
and Healthy Hero rewards all use these effects. Purchases, refunds, imports,
zero-reward checklist steps, repeated completions, and failed saves do not
trigger them. The notices do not block interaction and disappear automatically;
reduced-motion preferences show the earned amounts without moving tokens.

Use **Reward sounds** in the header to enable a gentle coin chime for saved
reward-star earnings and a short game tune for earned game minutes. Sound is
off until enabled; enabling plays a sample and remembers the choice in this
browser, outside family backups. Mute stops reward tones immediately without
changing calendar alarm sounds. Combined earnings play both cues in sequence.
The tones are synthesized locally, with no audio downloads or external services.
Reduced-motion mode still permits sound when explicitly enabled. Browsers may
require another click to enable audio after a reload; if blocked, the app shows
a message and keeps the saved rewards and visual celebration.

Routine entries show explicit star-coin or game-minute badges, including zero
when no reward was assigned. Imported unpriced checklist steps stay at zero;
the app does not invent prices. An unlocked parent can use **Calendar >
Edit schedule & rewards** to set 0–1,000 reward stars for a task or game minutes
for a chore. Changes apply only to future completions, not past earnings.

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

**Routine** is the daily home for children and adults. Choose a person with
**Playing as...**, then check off their dated responsibilities and see their
one earned game-time balance and reward stars. Today is selected by
default; other dates can be viewed without allowing future tasks to be completed.
Optional quests are separate and do not count toward daily checklist progress.
The daily list uses single-line divided rows: task name, scheduled time,
compact coin/minute badge, and a 44-pixel check button. Long names are
ellipsized visually; the full name remains in the hover tooltip and accessible
completion label. Checked items show a tick; future items show a disabled dash.
Each time-of-day heading shows its own completion count. Untimed daily items
omit repetitive "Any time" labels; Calendar keeps the full family details.
Choose **Optional quest** when creating an assignment in Calendar.
Use **Routine block** to group responsibilities into morning, afternoon,
evening, or any time. Imported routines can preserve their checklist order
without inventing exact times for untimed steps.
Routine previews up to three affordable rewards. The full reward shop lives in
**Rewards**, with shortcuts from Routine and Play Time. It shows
which rewards are affordable and how many more reward stars are needed.
Adults can define rewards, approve requests, and mark rewards delivered there.
Calendar remains available for planning and the whole-family weekly chart.

The default **$1 to Greenlight debit card** reward costs **100 reward stars
(star coins)**. It is available with new data and older backups, alongside any
custom rewards, without changing saved balances. Each redemption reserves 100
stars through the usual request flow. An unlocked parent approves the request,
transfers $1 in Greenlight separately, then marks it delivered. Canceling refunds
the reserved stars once. There is no banking connection or automatic transfer,
and no card credentials are stored. The fixed default reward cannot be removed.

### Nightly grateful journal

Everyone has a dated grateful-note form in **Routine**, with a gentle bedtime
reflection prompt. Kids earn **10 reward stars (coins)** for saving today's
nonblank note, once per local calendar day. Editing or resubmitting it never
awards the same bonus again. Adults can journal without earning coins.
There is no strict evening-hour lock, so families can fit their own bedtime.
The journal has its own **Journal date**, independent of the Routine checklist
date, so looking ahead at tasks does not disable today's journal.
**Write today's note** resets to today and focuses the editor (or opens the
profile chooser if no one is selected). Unlocked parents can write and save
notes just like children, without earning coins.
Earlier dates can be revisited or written without earning backdated coins;
future entries cannot be saved. Notes are limited to 2,000 characters.

Journal entries and their once-only reward markers stay in browser storage and
family backups. Older backups without journals still work. The editor shows the
selected profile/date; all saved notes are shared on the Family Gratitude Wall
in the same browser. Nothing is published to the public website. Successful
coin awards use the piggy-bank earning animation.

### Wishlist & piggy-bank goals

In **Rewards**, each person can add a wish and pick a playful icon. Children
cannot price their wishes: an adult profile sets or updates the reward-star
price (1–10,000). Adults see the whole family's wishlist; children see their own.
The first priced wish becomes its owner's goal if they do not already have one.
Children can choose a different priced wish as their current goal.

An original illustrated piggy bank fills from the current **available reward-star
balance**, capped at 100%, with an accessible progress bar and the remaining
stars needed. Picking a goal is free, not a second savings account. Spending
stars on pets or another reward lowers the piggy's progress. Brain stars and
game time are not redeemable currency.

Redeeming a wish reserves its stars and uses the existing adult approval,
delivery, and cancellation flow. A funded goal remains full while its request
is pending or approved, and cannot be requested twice at the same time.
Cancellation refunds once; delivery clears that current goal. Price changes
do not change the cost of an existing request. Removing a wish preserves its
existing requests. Adults can help choose a child's goal.

Wishes, parent prices, goals, and requests stay in browser storage and backups.
Older backups without wishlist fields remain supported. Parent roles are
PIN-gated locally, not server-authenticated accounts. The gift, rocket,
piggy-bank art, and star-coin decorations are original local illustrations;
there are no third-party image requests.

Publishing the website does not transfer routines between browsers. To move
your routines, export the backup from the browser that has them, then use
**Settings > Import backup** in the destination browser. Import replaces that
browser's saved family data; export its current data first if you need to keep it.

In **Calendar**, use **Create event, task or routine** to add a family event,
chore, or task for any family member. Give it a start date, an optional local time, and
choose **Does not repeat**, **Daily**, **Weekdays (Mon-Fri)**, **Weekly**, or
**Monthly**. Weekday routines skip Saturdays and Sundays. Weekly routines
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

Each occurrence can be completed once, on its date or later, earning game points
for chores or redeemable reward stars for tasks. **1 chore game point earns
1 game-time minute**, separately from the brain-star rewards. A 5-point chore
earns 5 minutes; a 20-point chore earns 20 minutes. Profiles and Play Time
explain this rule. Points are cumulative and are not spent in the shops.
Existing points and minutes are preserved; older completed chores do not
receive retroactive minutes or a recalculation of previously earned rewards.
Set a chore or task's reward to **0** for a routine checklist step that can be
completed without awarding points, stars, or minutes. Points and minutes are
saved together with completion history, so a failed save earns neither.
Future occurrences cannot be completed early. Past
missed occurrences stay on their original dates; they do not roll into today.
Completion history is retained separately for each occurrence. **Edit schedule**
lets you add dates to older unfinished assignments or adjust a new routine.
After the first completion, start dates and repeats are fixed to preserve reward
history; times, routine blocks, checklist type, and alerts remain editable. Remove and recreate a routine to replace its
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
game points toward a member's goal and earned game time; tasks award reward stars. To-do reminders are checked
while the page is open; browser notifications are optional and require
permission. Accounts, calendar integrations, and a larger game library are later
features.

## Run

Open `index.html` in a modern browser. No build step or dependencies are needed.