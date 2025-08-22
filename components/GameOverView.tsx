
import React from 'react';
import type { Player } from '../types';
import { ExportIcon } from './icons';

interface GameOverViewProps {
  story: string;
  players: Player[];
}

const GameOverView: React.FC<GameOverViewProps> = ({ story, players }) => {
  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([story], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "chronicle-siege-story.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const isDefeat = players.every(p => p.hearts === 0);

  return (
    <div className="card animate-fade-in" style={{maxWidth: '48rem', margin: 'auto', textAlign: 'center'}}>
      <h1 className="font-serif" style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>
        {isDefeat ? 'The Chronicle Ends...' : 'Chronicle Complete!'}
      </h1>
      <p style={{color: 'var(--color-text-secondary)', marginTop: '1rem', fontSize: '1.125rem'}}>
        {isDefeat 
          ? "Your party has fallen, but your collaborative story will be remembered."
          : "Congratulations to all writers for weaving this epic tale together. Your journey has come to an end, but the story will live on."
        }
      </p>

      <div style={{margin: '2rem 0', backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '0.5rem'}}>
        <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '1rem'}}>Final Party</h2>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem'}}>
          {players.map(player => (
            <div key={player.id} style={{padding: '0.75rem', backgroundColor: 'var(--color-surface)', borderRadius: '0.375rem'}}>
              <p style={{fontWeight: 'bold'}}>{player.name}</p>
              <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>Level {player.level}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleExport}
        className="btn btn-primary"
        style={{maxWidth: '24rem', margin: 'auto'}}
      >
        <ExportIcon className="w-6 h-6" />
        Export Your Story
      </button>
    </div>
  );
};

export default GameOverView;