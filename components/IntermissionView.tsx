import React, { useState, useEffect, useMemo } from 'react';
import type { GameState, Quest } from '../types';
import { PenIcon, PlayIcon, CoinIcon, LevelUpIcon, QuestIcon } from './icons';

interface IntermissionViewProps {
  gameState: GameState;
  onStartTurn: () => void;
  isPaused?: boolean;
}

const QuestListItem: React.FC<{quest: Quest}> = ({ quest }) => (
    <div className="bg-background/50 p-3 rounded-md text-left">
        <h4 className="font-semibold text-secondary">{quest.title}</h4>
        <p className="text-xs text-text-secondary italic mt-1">{quest.description}</p>
        <div className="flex items-center gap-3 text-xs mt-2">
            <div className="flex items-center gap-1 text-yellow-400">
                <CoinIcon className="w-3 h-3" />
                <span>{quest.rewardCoins}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
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
    <div className="fixed inset-0 bg-background bg-opacity-95 flex flex-col items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
      <div className="text-center w-full max-w-4xl">
        <h1 className="text-4xl sm:text-6xl font-bold text-primary font-serif animate-slide-in">
          {isPaused ? 'Game Paused' : `${currentPlayer.name}'s Turn`}
        </h1>
        <p className="text-text-secondary mt-2 text-lg">{isPaused ? 'Take a moment to collect your thoughts.' : 'Get ready to write!'}</p>
      </div>
      
      <div className="w-full max-w-5xl bg-surface rounded-lg shadow-2xl p-6 my-8 border border-gray-700 flex-grow overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Left Column: Story */}
            <div className="md:col-span-2 flex flex-col h-full">
                <div className="mb-4 border-b border-secondary pb-3">
                    <h2 className="text-lg font-semibold text-secondary">Current Goal</h2>
                    <p className="text-text-secondary italic">{gameState.settings.goals}</p>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold text-primary mb-2">The Story So Far...</h3>
                    <div className="prose prose-invert max-w-none text-text-secondary font-serif leading-relaxed whitespace-pre-wrap">
                        {gameState.story}
                    </div>
                </div>
            </div>
            {/* Right Column: Rules & Quests */}
            <div className="flex flex-col h-full overflow-hidden">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-secondary">Host Rules</h3>
                    <div className="text-sm text-text-secondary whitespace-pre-wrap bg-background/50 p-3 rounded-md mt-1">{gameState.settings.hostRules}</div>
                </div>
                 <div className="flex-grow flex flex-col overflow-hidden">
                    <h3 className="text-lg font-semibold text-secondary flex items-center gap-2 mb-1"><QuestIcon className="w-5 h-5" /> Active Quests</h3>
                    <div className="overflow-y-auto space-y-2 pr-2">
                       {myQuests.length > 0 ? myQuests.map(q => <QuestListItem key={q.id} quest={q}/>) : <p className="text-sm text-text-secondary italic">No active quests.</p>}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="text-center w-full max-w-4xl">
        <button
          onClick={onStartTurn}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-transform transform hover:scale-105"
        >
          {isPaused ? <PlayIcon className="w-6 h-6"/> : <PenIcon className="w-6 h-6" />}
          <span>{isPaused ? 'Resume Game' : `Start Writing (${countdown})`}</span>
        </button>
      </div>
    </div>
  );
};

export default IntermissionView;