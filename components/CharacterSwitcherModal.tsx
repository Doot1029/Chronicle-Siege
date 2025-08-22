import React from 'react';
import type { Player } from '../types';
import { SwitchHorizontalIcon, PenIcon } from './icons';

interface CharacterSwitcherModalProps {
  player: Player;
  onSwitch: (characterIndex: number) => void;
  onClose: () => void;
}

const CharacterSwitcherModal: React.FC<CharacterSwitcherModalProps> = ({ player, onSwitch, onClose }) => {
  
  const handleSelect = (index: number) => {
    onSwitch(index);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-slide-in border-2 border-primary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary font-serif flex items-center gap-2">
            <SwitchHorizontalIcon className="w-7 h-7" />
            Switch Character
          </h2>
          <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
        </div>

        <p className="text-text-secondary mb-4">Choose which character persona you want to write as for this turn.</p>

        <div className="space-y-2">
            {player.characters.map((char, index) => {
                const isActive = index === player.activeCharacterIndex;
                return (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={`w-full p-3 text-left rounded-lg transition-colors flex justify-between items-center ${
                            isActive 
                            ? 'bg-primary/30 border border-primary cursor-default' 
                            : 'bg-background hover:bg-primary/10'
                        }`}
                        disabled={isActive}
                    >
                        <div>
                            <p className="font-semibold">{char.name}</p>
                            <p className="text-xs text-text-secondary italic">{char.bio || 'No bio.'}</p>
                        </div>
                        {isActive && <PenIcon className="w-5 h-5 text-primary" />}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default CharacterSwitcherModal;
