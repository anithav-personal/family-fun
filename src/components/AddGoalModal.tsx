import { useState } from 'react';

const GOAL_ICONS = [
  '🎮', '🧸', '🍦', '🎡', '🎪', '🎭',
  '🎨', '🎸', '⚽', '🏀', '🚀', '🏝️',
  '🎁', '🤖', '🦄', '🪁', '🏹', '🛹',
  '🎠', '🌈', '🎯', '🍕', '🎬', '📱',
  '💻', '🎪',
];

interface Props {
  onAdd: (title: string, icon: string, targetCoins: number) => void;
  onClose: () => void;
}

export default function AddGoalModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [targetCoins, setTargetCoins] = useState(50);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || targetCoins < 1) return;
    onAdd(title.trim(), icon, targetCoins);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">🎯 Add a Goal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-title">Goal Name</label>
            <input
              id="goal-title"
              className="form-input"
              type="text"
              placeholder="e.g. New toy, Movie night…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>
          <div className="form-group">
            <span className="form-label">Pick an Icon</span>
            <div className="emoji-grid">
              {GOAL_ICONS.map((ic) => (
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
            <label className="form-label" htmlFor="goal-coins">Coin Target 🪙</label>
            <div className="coin-slider-row">
              <input
                id="goal-coins"
                type="range"
                className="coin-slider"
                min={5}
                max={500}
                step={5}
                value={targetCoins}
                onChange={(e) => setTargetCoins(Number(e.target.value))}
              />
              <span className="coin-value">🪙 {targetCoins}</span>
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
              Save Goal 🎯
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
