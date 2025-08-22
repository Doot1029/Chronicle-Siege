import React, { useState, useEffect, useMemo } from 'react';
import type { GameState, Quest } from '../types';
import { PenIcon, PlayIcon, CoinIcon, LevelUpIcon, QuestIcon } from './icons';

interface IntermissionViewProps {
  gameState: GameState;
  onStartTurn: () => void;
  isPaused?: boolean;
}

const QuestListItem: React.FC<{quest: Quest}> = ({ quest }) => (
    <div style={{backgroundColor: 'var(--color-background-light)', padding: '0.75rem', borderRadius: '0.375rem', textAlign: 'left'}}>
        <h4 style={{fontWeight: 600, color: 'var(--color-secondary)'}}>{quest.title}</h4>
        <p style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '0.25rem'}}>{quest.description}</p>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', marginTop: '0.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24'}}>
                <CoinIcon className="w-3 h-3" />
                <span>{quest.rewardCoins}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34D399'}}>
                <LevelUpIcon className="w-3 h-3" />
                <span>{quest.rewardXp} XP</span>
            </div>
        </div>
    </div>
);


const IntermissionView: React.FC<IntermissionViewProps> = ({ gameState, onStartTurn, isPaused = false }) => {
  const wordCount = useMemo(() => gameState.story.split(/\s+/).filter(Boolean).length, [gameState.story]);
  const intermissionDuration = useMemo(() => 10 + Math.floor(wordCount / 40), [wordCount]); // 1 extra second per 40 words
  
  const [countdown, setCountdown] = useState(intermissionDuration);

  const currentPlayer = gameState.settings.players[gameState.currentPlayerIndex];
  const myQuests = gameState.quests.filter(q => !q.isComplete && (q.assigneeId === 'all' || q.assigneeId === currentPlayer.id));

  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      onStartTurn();
      return;
    }
    const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timerId);
  }, [countdown, onStartTurn, isPaused]);

  return (
    <div className="intermission-overlay animate-fade-in">
      <div className="intermission-header">
        <h1 className="font-serif animate-slide-in">
          {isPaused ? 'Game Paused' : `${currentPlayer.name}'s Turn`}
        </h1>
        <p>{isPaused ? 'Take a moment to collect your thoughts.' : 'Get ready to write!'}</p>
      </div>
      
      <div className="intermission-content">
        <div className="intermission-grid">
            {/* Left Column: Story */}
            <div className="intermission-col">
                <div style={{marginBottom: '1rem', borderBottom: '1px solid var(--color-secondary)', paddingBottom: '0.75rem'}}>
                    <h2 style={{fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-secondary)'}}>Current Goal</h2>
                    <p style={{color: 'var(--color-text-secondary)', fontStyle: 'italic'}}>{gameState.settings.goals}</p>
                </div>
                <div className="intermission-scrollable">
                    <h3 style={{fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem'}}>The Story So Far...</h3>
                    <div className="prose prose-invert font-serif">
                        {gameState.story}
                    </div>
                </div>
            </div>
            {/* Right Column: Rules & Quests */}
            <div className="intermission-col">
                <div style={{marginBottom: '1rem'}}>
                    <h3 style={{fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-secondary)'}}>Host Rules</h3>
                    <div style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--color-background-light)', padding: '0.75rem', borderRadius: '0.375rem', marginTop: '0.25rem'}}>{gameState.settings.hostRules}</div>
                </div>
                 <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    <h3 style={{fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}><QuestIcon className="w-5 h-5" /> Active Quests</h3>
                    <div className="intermission-scrollable" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                       {myQuests.length > 0 ? myQuests.map(q => <QuestListItem key={q.id} quest={q}/>) : <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic'}}>No active quests.</p>}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="intermission-footer">
        <button
          onClick={onStartTurn}
          className="btn btn-primary"
        >
          {isPaused ? <PlayIcon className="w-6 h-6"/> : <PenIcon className="w-6 h-6" />}
          <span>{isPaused ? 'Resume Game' : `Start Writing (${countdown})`}</span>
        </button>
      </div>
    </div>
  );
};

export default IntermissionView;