import { useState, useCallback } from 'react';
import type { Kid, Chore, ChoreCompletion, Goal } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Confetti from './components/Confetti';
import AddKidModal from './components/AddKidModal';
import AddChoreModal from './components/AddChoreModal';
import AddGoalModal from './components/AddGoalModal';
import './App.css';

// ── Default chores loaded on first run ──────────────────────────────────────
const DEFAULT_CHORES: Chore[] = [
  { id: 'default-1', title: 'Make Bed', icon: '🛏️', coins: 5 },
  { id: 'default-2', title: 'Set the Table', icon: '🍽️', coins: 5 },
  { id: 'default-3', title: 'Read for 20 Minutes', icon: '📚', coins: 15 },
  { id: 'default-4', title: 'Sweep the Floor', icon: '🧹', coins: 10 },
  { id: 'default-5', title: 'Water the Plants', icon: '🌿', coins: 10 },
  { id: 'default-6', title: 'Put Away Laundry', icon: '🧺', coins: 10 },
];

// Rotating palette for kid avatar backgrounds
const KID_COLORS = [
  '#FF6B9D', '#FFA048', '#FFD700',
  '#4CAF50', '#00BCD4', '#9C27B0', '#FF5722',
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [kids, setKids] = useLocalStorage<Kid[]>('cq-kids', []);
  const [chores, setChores] = useLocalStorage<Chore[]>('cq-chores', DEFAULT_CHORES);
  const [completions, setCompletions] = useLocalStorage<ChoreCompletion[]>('cq-completions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('cq-goals', []);
  const [activeKidId, setActiveKidId] = useLocalStorage<string | null>('cq-activeKidId', null);

  const [activeTab, setActiveTab] = useState<'chores' | 'goals'>('chores');
  const [showAddKid, setShowAddKid] = useState(false);
  const [showAddChore, setShowAddChore] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [celebration, setCelebration] = useState<{ message: string; coins: number } | null>(null);

  // Derive the active kid; fall back to first kid if stored ID is stale / null
  const activeKid: Kid | null = kids.find((k) => k.id === activeKidId) ?? kids[0] ?? null;

  const today = getToday();

  function isCompletedToday(choreId: string, kidId: string): boolean {
    return completions.some(
      (c) => c.choreId === choreId && c.kidId === kidId && c.date === today,
    );
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function completeChore(chore: Chore) {
    if (!activeKid) return;
    if (isCompletedToday(chore.id, activeKid.id)) return;

    const completion: ChoreCompletion = {
      id: generateId(),
      choreId: chore.id,
      kidId: activeKid.id,
      date: today,
    };
    setCompletions((prev) => [...prev, completion]);
    setKids((prev) =>
      prev.map((k) =>
        k.id === activeKid.id ? { ...k, coins: k.coins + chore.coins } : k,
      ),
    );
    setCelebration({ message: `Great job, ${activeKid.name}! 🎉`, coins: chore.coins });
  }

  function addKid(name: string, avatar: string) {
    const color = KID_COLORS[kids.length % KID_COLORS.length];
    const newKid: Kid = { id: generateId(), name, avatar, color, coins: 0 };
    setKids((prev) => [...prev, newKid]);
    setActiveKidId(newKid.id);
    setShowAddKid(false);
  }

  function addChore(title: string, icon: string, coins: number) {
    setChores((prev) => [...prev, { id: generateId(), title, icon, coins }]);
    setShowAddChore(false);
  }

  function deleteChore(id: string) {
    setChores((prev) => prev.filter((c) => c.id !== id));
    setCompletions((prev) => prev.filter((c) => c.choreId !== id));
  }

  function addGoal(title: string, icon: string, targetCoins: number) {
    if (!activeKid) return;
    setGoals((prev) => [
      ...prev,
      { id: generateId(), kidId: activeKid.id, title, icon, targetCoins },
    ]);
    setShowAddGoal(false);
  }

  function claimGoal(goal: Goal) {
    if (!activeKid || activeKid.coins < goal.targetCoins) return;
    setKids((prev) =>
      prev.map((k) =>
        k.id === activeKid.id ? { ...k, coins: k.coins - goal.targetCoins } : k,
      ),
    );
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    setCelebration({ message: `${activeKid.name} unlocked "${goal.title}"! 🏆`, coins: 0 });
  }

  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  // ── Derived display values ───────────────────────────────────────────────
  const todayCount = activeKid
    ? completions.filter((c) => c.kidId === activeKid.id && c.date === today).length
    : 0;

  const kidGoals = activeKid ? goals.filter((g) => g.kidId === activeKid.id) : [];

  // ── Welcome / onboarding screen ──────────────────────────────────────────
  if (kids.length === 0) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-emoji">🏆</div>
          <h1 className="welcome-title">ChoreQuest</h1>
          <p className="welcome-subtitle">
            Complete chores, earn coins,<br />unlock awesome rewards!
          </p>
          <button className="btn-primary" onClick={() => setShowAddKid(true)}>
            ➕ Add Your First Kid
          </button>
        </div>
        {showAddKid && <AddKidModal onAdd={addKid} onClose={() => setShowAddKid(false)} />}
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <span className="header-title">🏆 ChoreQuest</span>
        {activeKid && <span className="coins-badge">🪙 {activeKid.coins}</span>}
      </header>

      {/* ── Kid selector row ── */}
      <div className="kid-selector">
        {kids.map((kid) => (
          <button
            key={kid.id}
            className={`kid-pill${kid.id === activeKid?.id ? ' active' : ''}`}
            style={{ '--kid-color': kid.color } as React.CSSProperties}
            onClick={() => setActiveKidId(kid.id)}
          >
            <span className="kid-pill-avatar">{kid.avatar}</span>
            <span className="kid-pill-name">{kid.name}</span>
          </button>
        ))}
        <button
          className="kid-pill kid-pill-add"
          onClick={() => setShowAddKid(true)}
          aria-label="Add kid"
        >
          ➕
        </button>
      </div>

      {/* ── Active kid stats card ── */}
      {activeKid && (
        <div
          className="kid-stats"
          style={{ '--kid-color': activeKid.color } as React.CSSProperties}
        >
          <div className="kid-stats-avatar">{activeKid.avatar}</div>
          <div className="kid-stats-info">
            <div className="kid-stats-name">{activeKid.name}</div>
            <div className="kid-stats-detail">
              <span>🪙 {activeKid.coins} coins</span>
              <span>✅ {todayCount} done today</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="tab-bar">
        <button
          className={`tab${activeTab === 'chores' ? ' active' : ''}`}
          onClick={() => setActiveTab('chores')}
        >
          ✅ Chores
        </button>
        <button
          className={`tab${activeTab === 'goals' ? ' active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goals
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="app-main">
        {/* Chores tab */}
        {activeTab === 'chores' && (
          <div>
            <div className="section-header">
              <h2>Today's Chores</h2>
              <button className="btn-add" onClick={() => setShowAddChore(true)}>
                + Add Chore
              </button>
            </div>

            {chores.length === 0 ? (
              <div className="empty-state">
                <p>No chores yet!</p>
                <button className="btn-primary" onClick={() => setShowAddChore(true)}>
                  Add First Chore
                </button>
              </div>
            ) : (
              <div className="chore-list">
                {chores.map((chore) => {
                  const done = activeKid
                    ? isCompletedToday(chore.id, activeKid.id)
                    : false;
                  return (
                    <div
                      key={chore.id}
                      className={`chore-card${done ? ' done' : ''}`}
                    >
                      <div className="chore-icon">{chore.icon}</div>
                      <div className="chore-info">
                        <div className="chore-title">{chore.title}</div>
                        <div className="chore-reward">🪙 {chore.coins} coins</div>
                      </div>
                      <div className="chore-actions">
                        {done ? (
                          <span className="chore-done-badge">✅ Done!</span>
                        ) : (
                          <button
                            className="btn-complete"
                            onClick={() => completeChore(chore)}
                            disabled={!activeKid}
                          >
                            ✔ Done
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => deleteChore(chore.id)}
                          aria-label={`Delete ${chore.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Goals tab */}
        {activeTab === 'goals' && (
          <div>
            <div className="section-header">
              <h2>{activeKid?.name}'s Goals</h2>
              <button className="btn-add" onClick={() => setShowAddGoal(true)}>
                + Add Goal
              </button>
            </div>

            {kidGoals.length === 0 ? (
              <div className="empty-state">
                <p>No goals yet! Set a reward to save for.</p>
                <button className="btn-primary" onClick={() => setShowAddGoal(true)}>
                  Add First Goal
                </button>
              </div>
            ) : (
              <div className="goal-list">
                {kidGoals.map((goal) => {
                  const progress = activeKid
                    ? Math.min(activeKid.coins / goal.targetCoins, 1)
                    : 0;
                  const canClaim = activeKid != null && activeKid.coins >= goal.targetCoins;
                  return (
                    <div
                      key={goal.id}
                      className={`goal-card${canClaim ? ' claimable' : ''}`}
                    >
                      <div className="goal-icon">{goal.icon}</div>
                      <div className="goal-info">
                        <div className="goal-title">{goal.title}</div>
                        <div className="goal-target">🪙 {goal.targetCoins} coins needed</div>
                        <div className="goal-progress-bar">
                          <div
                            className="goal-progress-fill"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                        <div className="goal-progress-text">
                          {activeKid?.coins ?? 0} / {goal.targetCoins} coins
                        </div>
                      </div>
                      <div className="goal-actions">
                        {canClaim ? (
                          <button className="btn-claim" onClick={() => claimGoal(goal)}>
                            🏆 Claim!
                          </button>
                        ) : (
                          <span className="goal-percent">{Math.round(progress * 100)}%</span>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => deleteGoal(goal.id)}
                          aria-label={`Delete ${goal.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {showAddKid && <AddKidModal onAdd={addKid} onClose={() => setShowAddKid(false)} />}
      {showAddChore && <AddChoreModal onAdd={addChore} onClose={() => setShowAddChore(false)} />}
      {showAddGoal && <AddGoalModal onAdd={addGoal} onClose={() => setShowAddGoal(false)} />}

      {/* ── Celebration overlay ── */}
      {celebration && (
        <Confetti
          message={celebration.message}
          coins={celebration.coins}
          onDone={dismissCelebration}
        />
      )}
    </div>
  );
}
