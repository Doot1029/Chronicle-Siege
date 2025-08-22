import React from 'react';

interface GameManualModalProps {
  onClose: () => void;
}

const GameManualModal: React.FC<GameManualModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content size-lg tall">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>Game Manual</h2>
          <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
        </div>

        <div style={{flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-secondary)'}}>
          <div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)'}}>The Core Loop</h3>
            <p>
              This is a collaborative writing game. The goal is to write a story together, turn by turn. On your turn, you have a limited time to add to the story. Write your entry in the main text box and hit 'Submit'.
            </p>
          </div>
          <div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)'}}>Fighting Monsters</h3>
            <p>
              Occasionally, monsters will appear! You fight them by writing. The more words you write in your turn, the more damage you deal. Be careful, after your turn, the monster will attack you, costing you one heart.
            </p>
          </div>
          <div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)'}}>The "Writer's Block" Shop</h3>
            <p>
              Completing turns, defeating monsters, and finishing quests earns you coins. Spend them in the shop on helpful tools, like the AI critique, or new UI themes to customize your experience.
            </p>
          </div>
          <div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)'}}>Brainstorm Limbo</h3>
            <p>
              If all players lose their hearts, or if you vote to go there, you enter Brainstorm Limbo. Here, there's no time limit. You must fight your inner demon by meeting a personal word count goal. Escaping grants you a Rebirth Point, and all your writing is saved to the journal. Rebirth Points can be converted to coins!
            </p>
          </div>
           <div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)'}}>Quests & The Bible</h3>
            <p>
              The host can create quests for the party. Check your Quest Log often for objectives that grant bonus coins and XP. The Story Bible contains important lore and world details set by the host—a great place to look for inspiration!
            </p>
          </div>
        </div>
        <div style={{textAlign: 'right', marginTop: '1rem'}}>
            <button onClick={onClose} className="btn btn-primary" style={{width: 'auto'}}>Got It</button>
        </div>
      </div>
    </div>
  );
};

export default GameManualModal;