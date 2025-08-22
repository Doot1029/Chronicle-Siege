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
        <div className="animate-fade-in" style={{maxWidth: '80rem', margin: 'auto'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <h1 className="font-serif" style={{fontSize: '3rem', fontWeight: 'bold', color: '#A78BFA'}}>Brainstorm Limbo</h1>
                <p style={{color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>There is no time here. Defeat your inner demons by writing. Your words have power.</p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem'}}>
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
                            <div key={player.id} className="card" style={{border: '2px solid #22C55E', opacity: 0.6}}>
                                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', color: '#4ADE80'}}>{player.name}</h2>
                                <p style={{textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '1rem'}}>Has found their way back.</p>
                            </div>
                        );
                    }

                    return (
                        <div key={player.id} className="card" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <MonsterDisplay monster={{...demon, currentHp: Math.max(0, goal - wordCount)}} />
                            
                            <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                                <textarea
                                    className="form-textarea font-serif"
                                    style={{flexGrow: 1, minHeight: '10rem'}}
                                    placeholder="Write to fight the demon..."
                                    value={currentWriting}
                                    onChange={e => handleWritingChange(player.id, e.target.value)}
                                />
                                <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>
                                    Word Count: {wordCount} / {goal}
                                </div>
                                <div style={{width: '100%', backgroundColor: 'var(--color-background)', borderRadius: '9999px', height: '0.625rem', marginTop: '0.25rem', border: '1px solid var(--color-border)'}}>
                                    <div style={{backgroundColor: '#A855F7', height: '100%', borderRadius: '9999px', width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <button
                                disabled={!isGoalMet}
                                onClick={() => handleLeaveLimbo(player.id)}
                                className="btn"
                                style={{backgroundColor: '#16A34A', color: 'white'}}
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