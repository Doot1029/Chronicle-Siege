import React from 'react';

interface GameManualModalProps {
  onClose: () => void;
}

const GameManualModal: React.FC<GameManualModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 animate-slide-in border-2 border-primary h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary font-serif">Game Manual</h2>
          <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-text-secondary">
          <div>
            <h3 className="text-xl font-semibold text-secondary">The Core Loop</h3>
            <p>
              This is a collaborative writing game. The goal is to write a story together, turn by turn. On your turn, you have a limited time to add to the story. Write your entry in the main text box and hit 'Submit'.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">Fighting Monsters</h3>
            <p>
              Occasionally, monsters will appear! You fight them by writing. The more words you write in your turn, the more damage you deal. Be careful, after your turn, the monster will attack you, costing you one heart.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">The "Writer's Block" Shop</h3>
            <p>
              Completing turns, defeating monsters, and finishing quests earns you coins. Spend them in the shop on helpful tools, like the AI critique, or new UI themes to customize your experience.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">Brainstorm Limbo</h3>
            <p>
              If all players lose their hearts, or if you vote to go there, you enter Brainstorm Limbo. Here, there's no time limit. You must fight your inner demon by meeting a personal word count goal. Escaping grants you a Rebirth Point, and all your writing is saved to the journal. Rebirth Points can be converted to coins!
            </p>
          </div>
           <div>
            <h3 className="text-xl font-semibold text-secondary">Quests & The Bible</h3>
            <p>
              The host can create quests for the party. Check your Quest Log often for objectives that grant bonus coins and XP. The Story Bible contains important lore and world details set by the host—a great place to look for inspiration!
            </p>
          </div>
        </div>
        <div className="text-right mt-4">
            <button onClick={onClose} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700">Got It</button>
        </div>
      </div>
    </div>
  );
};

export default GameManualModal;
