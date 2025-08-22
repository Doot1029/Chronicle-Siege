
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
    <div className="max-w-4xl mx-auto p-8 bg-surface rounded-xl shadow-2xl animate-fade-in text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-primary font-serif">
        {isDefeat ? 'The Chronicle Ends...' : 'Chronicle Complete!'}
      </h1>
      <p className="text-text-secondary mt-4 text-lg">
        {isDefeat 
          ? "Your party has fallen, but your collaborative story will be remembered."
          : "Congratulations to all writers for weaving this epic tale together. Your journey has come to an end, but the story will live on."
        }
      </p>

      <div className="my-8 bg-background p-4 rounded-lg">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Final Party</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {players.map(player => (
            <div key={player.id} className="p-3 bg-surface/50 rounded-md">
              <p className="font-bold">{player.name}</p>
              <p className="text-sm text-text-secondary">Level {player.level}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleExport}
        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-transform transform hover:scale-105"
      >
        <ExportIcon className="w-6 h-6" />
        Export Your Story
      </button>
    </div>
  );
};

export default GameOverView;