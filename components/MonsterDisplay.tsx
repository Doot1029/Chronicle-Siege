
import React from 'react';
import type { Monster } from '../types';

interface MonsterDisplayProps {
  monster: Monster;
}

const MonsterDisplay: React.FC<MonsterDisplayProps> = ({ monster }) => {
  const healthPercentage = (monster.currentHp / monster.maxHp) * 100;

  return (
    <div className="bg-surface p-4 rounded-lg shadow-lg animate-slide-in">
      <h3 className="text-2xl font-bold text-center text-red-500 font-serif">{monster.name}</h3>
      <p className="text-center text-sm text-text-secondary italic mb-3">"{monster.description}"</p>
      
      <div className="w-full h-64 bg-background rounded-lg overflow-hidden my-3 border-2 border-red-900/50">
        <img src={monster.imageUrl} alt={monster.name} className="w-full h-full object-cover" />
      </div>

      <div>
        <div className="flex justify-between items-center text-sm font-semibold mb-1">
          <span className="text-red-400">HP</span>
          <span>{monster.currentHp} / {monster.maxHp}</span>
        </div>
        <div className="w-full bg-background rounded-full h-4 border border-gray-600">
          <div
            className="bg-red-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MonsterDisplay;
