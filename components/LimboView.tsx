import React, { useState, useMemo } from 'react';
import type { GameState, Monster } from '../types';
import MonsterDisplay from './MonsterDisplay';

interface LimboViewProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
    onAllPlayersLeft: () => void;
}

const LimboView: React.FC<LimboViewProps> = ({ gameState, setGameState, onAllPlayersLeft }) => {
    const [writings, setWritings] = useState<Record<string, string>>({});

    const limboState = gameState.limboState;
    if (!limboState) return null;

    const handleWritingChange = (playerId: string, text: string) => {
        setWritings(prev => ({ ...prev, [playerId]: text }));
    };

    const handleLeaveLimbo = (playerId: string) => {
        setGameState(prev => {
            if (!prev || !prev.limboState) return prev;

            const player = prev.settings.players.find(p => p.id === playerId);
            if (!player) return prev;

            const newJournal = { ...prev.brainstormingJournal };
            const playerWriting = writings[playerId] || '';
            if (playerWriting.trim()) {
                newJournal[playerId] = [...newJournal[playerId], playerWriting];
            }

            const updatedPlayer = { ...player, rebirthPoints: player.rebirthPoints + 1 };
            const updatedPlayers = prev.settings.players.map(p => p.id === playerId ? updatedPlayer : p);

            const newCompletedPlayers = [...prev.limboState.completedPlayers, playerId];

            const newState = {
                ...prev,
                settings: { ...prev.settings, players: updatedPlayers },
                brainstormingJournal: newJournal,
                limboState: {
                    ...prev.limboState,
                    completedPlayers: newCompletedPlayers,
                }
            };

            if (newCompletedPlayers.length === prev.settings.players.length) {
                // This will be handled by the effect hook now
            }

            return newState;
        });
    };
    
    // Effect to check if all players have left
    React.useEffect(() => {
        if(limboState.completedPlayers.length === gameState.settings.players.length){
            onAllPlayersLeft();
        }
    }, [limboState.completedPlayers, gameState.settings.players.length, onAllPlayersLeft]);

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-purple-400 font-serif">Brainstorm Limbo</h1>
                <p className="text-text-secondary mt-2">There is no time here. Defeat your inner demons by writing. Your words have power.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameState.settings.players.map(player => {
                    const goal = limboState.wordGoals[player.id];
                    const demon = limboState.demons[player.id];
                    const currentWriting = writings[player.id] || '';
                    const wordCount = useMemo(() => currentWriting.trim().split(/\s+/).filter(Boolean).length, [currentWriting]);
                    const progress = Math.min((wordCount / goal) * 100, 100);
                    const isGoalMet = wordCount >= goal;
                    const hasLeft = limboState.completedPlayers.includes(player.id);

                    if (hasLeft) {
                       return (
                            <div key={player.id} className="bg-surface p-4 rounded-lg shadow-lg border-2 border-green-500 opacity-60">
                                <h2 className="text-xl font-bold text-center text-green-400">{player.name}</h2>
                                <p className="text-center text-text-secondary mt-4">Has found their way back.</p>
                            </div>
                        );
                    }

                    return (
                        <div key={player.id} className="bg-surface p-4 rounded-lg shadow-lg flex flex-col gap-4">
                            <MonsterDisplay monster={{...demon, currentHp: Math.max(0, goal - wordCount)}} />
                            
                            <div className="flex-grow flex flex-col">
                                <textarea
                                    className="w-full flex-grow p-3 bg-background border border-gray-600 rounded-lg text-base font-serif focus:ring-2 focus:ring-purple-500"
                                    placeholder="Write to fight the demon..."
                                    value={currentWriting}
                                    onChange={e => handleWritingChange(player.id, e.target.value)}
                                    rows={8}
                                />
                                <div className="mt-2 text-sm text-text-secondary">
                                    Word Count: {wordCount} / {goal}
                                </div>
                                <div className="w-full bg-background rounded-full h-2.5 mt-1 border border-gray-600">
                                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <button
                                disabled={!isGoalMet}
                                onClick={() => handleLeaveLimbo(player.id)}
                                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGoalMet ? 'Leave Limbo (+1 Rebirth Pt)' : 'Keep Writing'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LimboView;
