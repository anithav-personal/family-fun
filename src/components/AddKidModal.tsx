import { useState } from 'react';

const AVATARS = [
  '🦁', '🐯', '🐼', '🐨', '🦊', '🐸',
  '🦄', '🐉', '🦋', '🐳', '🦕', '🦖',
  '🐙', '🦔', '🐧', '🦅', '🦜', '🐬',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦝',
];

interface Props {
  onAdd: (name: string, avatar: string) => void;
  onClose: () => void;
}

export default function AddKidModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), avatar);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">👶 Add a Kid</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="kid-name">Name</label>
            <input
              id="kid-name"
              className="form-input"
              type="text"
              placeholder="Kid's name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={20}
            />
          </div>
          <div className="form-group">
            <span className="form-label">Choose Avatar</span>
            <div className="emoji-grid">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`emoji-btn${avatar === a ? ' selected' : ''}`}
                  onClick={() => setAvatar(a)}
                  aria-label={a}
                  aria-pressed={avatar === a}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              disabled={!name.trim()}
            >
              Add Kid 🎉
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
