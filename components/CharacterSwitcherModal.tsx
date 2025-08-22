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
    <div className="modal-overlay">
      <div className="modal-content size-md">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <SwitchHorizontalIcon className="w-7 h-7" />
            Switch Character
          </h2>
          <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
        </div>

        <p style={{color: 'var(--color-text-secondary)', marginBottom: '1rem'}}>Choose which character persona you want to write as for this turn.</p>

        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {player.characters.map((char, index) => {
                const isActive = index === player.activeCharacterIndex;
                return (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            textAlign: 'left',
                            borderRadius: '0.5rem',
                            transition: 'background-color 0.2s, border-color 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: `1px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                            backgroundColor: isActive ? 'var(--color-primary_opacity_20, rgba(139, 92, 246, 0.2))' : 'var(--color-background)',
                            cursor: isActive ? 'default' : 'pointer'
                        }}
                        disabled={isActive}
                    >
                        <div>
                            <p style={{fontWeight: 600, color: 'var(--color-text-main)'}}>{char.name}</p>
                            <p style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic'}}>{char.bio || 'No bio.'}</p>
                        </div>
                        {isActive && <PenIcon className="w-5 h-5" style={{color: 'var(--color-primary)'}} />}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default CharacterSwitcherModal;