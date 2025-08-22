import React from 'react';
import type { Monster } from '../types';

interface MonsterDisplayProps {
  monster: Monster;
}

const MonsterDisplay: React.FC<MonsterDisplayProps> = ({ monster }) => {
  const healthPercentage = (monster.currentHp / monster.maxHp) * 100;

  return (
    <div className="card animate-slide-in">
      <h3 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#EF4444'}}>{monster.name}</h3>
      <p style={{textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '0.75rem'}}>"{monster.description}"</p>
      
      <div style={{width: '100%', height: '16rem', backgroundColor: 'var(--color-background)', borderRadius: '0.5rem', overflow: 'hidden', margin: '0.75rem 0', border: '2px solid rgba(127, 29, 29, 0.5)'}}>
        <img src={monster.imageUrl} alt={monster.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>

      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem'}}>
          <span style={{color: '#F87171'}}>HP</span>
          <span>{monster.currentHp} / {monster.maxHp}</span>
        </div>
        <div style={{width: '100%', backgroundColor: 'var(--color-background)', borderRadius: '9999px', height: '1rem', border: '1px solid var(--color-border)'}}>
          <div
            style={{backgroundColor: '#DC2626', height: '100%', borderRadius: '9999px', transition: 'width 0.5s ease-out', width: `${healthPercentage}%`}}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MonsterDisplay;