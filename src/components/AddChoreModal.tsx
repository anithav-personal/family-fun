import { useState } from 'react';

const CHORE_ICONS = [
  '🛏️', '🍽️', '📚', '🧹', '🌿', '🧺',
  '🐕', '🍳', '🧽', '🛒', '🗑️', '💧',
  '🌱', '🏃', '🧩', '🎯', '🚿', '🪣',
  '🧼', '🌸', '🍎', '🥦', '🎒', '✏️',
  '🖼️', '🎵',
];

interface Props {
  onAdd: (title: string, icon: string, coins: number) => void;
  onClose: () => void;
}

export default function AddChoreModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(CHORE_ICONS[0]);
  const [coins, setCoins] = useState(10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), icon, coins);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✅ Add a Chore</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="chore-title">Chore Name</label>
            <input
              id="chore-title"
              className="form-input"
              type="text"
              placeholder="e.g. Clean room, Feed the dog…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>
          <div className="form-group">
            <span className="form-label">Pick an Icon</span>
            <div className="emoji-grid">
              {CHORE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  className={`emoji-btn${icon === ic ? ' selected' : ''}`}
                  onClick={() => setIcon(ic)}
                  aria-label={ic}
                  aria-pressed={icon === ic}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="chore-coins">Coin Reward 🪙</label>
            <div className="coin-slider-row">
              <input
                id="chore-coins"
                type="range"
                className="coin-slider"
                min={1}
                max={50}
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value))}
              />
              <span className="coin-value">🪙 {coins}</span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              disabled={!title.trim()}
            >
              Add Chore ✅
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
