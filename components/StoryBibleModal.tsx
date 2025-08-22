import React, { useState } from 'react';
import { BookOpenIcon } from './icons';

interface StoryBibleModalProps {
  storyBible: string;
  isHost: boolean;
  onSave: (newText: string) => void;
  onClose: () => void;
}

const StoryBibleModal: React.FC<StoryBibleModalProps> = ({ storyBible, isHost, onSave, onClose }) => {
    const [editText, setEditText] = useState(storyBible);

    const handleSave = () => {
        onSave(editText);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content size-lg tall" style={{borderColor: '#60A5FA'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <BookOpenIcon className="w-7 h-7" />
                        Story Bible
                    </h2>
                    <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
                </div>

                <div style={{flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem'}}>
                    {isHost ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="form-textarea font-serif"
                            style={{width: '100%', height: '100%'}}
                            placeholder="Add lore, character details, world rules..."
                        />
                    ) : (
                        <div className="prose prose-invert font-serif">
                            {storyBible}
                        </div>
                    )}
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem'}}>
                    <button type="button" onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)', padding: '0.5rem 1rem'}}>Close</button>
                    {isHost && (
                        <button onClick={handleSave} className="btn" style={{backgroundColor: '#2563EB', color: 'white', width: 'auto'}}>
                            Save & Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryBibleModal;