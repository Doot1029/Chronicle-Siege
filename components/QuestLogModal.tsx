import React from 'react';
import type { Player, Quest } from '../types';
import { QuestIcon, CoinIcon, LevelUpIcon } from './icons';

interface QuestLogModalProps {
    quests: Quest[];
    players: Player[];
    currentPlayerId: string;
    onClose: () => void;
}

const QuestLogModal: React.FC<QuestLogModalProps> = ({ quests, players, currentPlayerId, onClose }) => {
    
    const myQuests = quests.filter(q => q.assigneeId === 'all' || q.assigneeId === currentPlayerId);
    
    return (
        <div className="modal-overlay">
            <div className="modal-content size-lg tall" style={{borderColor: '#FBBF24'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <QuestIcon className="w-7 h-7" />
                        Quest Log
                    </h2>
                    <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
                </div>
                
                <div style={{flexGrow: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {myQuests.length > 0 ? myQuests.map(quest => {
                        const progress = quest.progress[currentPlayerId] || 0;
                        const target = quest.targetWordCount || 1;
                        const percentage = Math.min((progress / target) * 100, 100);
                        const assignee = quest.assigneeId === 'all' ? 'All Players' : players.find(p => p.id === quest.assigneeId)?.name;

                        return (
                             <div key={quest.id} style={{backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '0.5rem', borderLeft: `4px solid ${quest.isComplete ? '#22C55E' : '#F59E0B'}`, opacity: quest.isComplete ? 0.7 : 1}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                    <div>
                                        <h3 style={{fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--color-secondary)'}}>{quest.title}</h3>
                                        <p style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)'}}>Assigned to: {assignee}</p>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24'}}>
                                            <CoinIcon className="w-4 h-4" />
                                            <span>{quest.rewardCoins}</span>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34D399'}}>
                                            <LevelUpIcon className="w-4 h-4" />
                                            <span>{quest.rewardXp} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0'}}>{quest.description}</p>
                                {quest.targetWordCount && (
                                    <div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>
                                            <span>Progress</span>
                                            <span>{progress} / {target} words</span>
                                        </div>
                                        <div style={{width: '100%', backgroundColor: 'var(--color-surface)', borderRadius: '9999px', height: '0.625rem', border: '1px solid var(--color-border)'}}>
                                            <div style={{backgroundColor: '#F59E0B', height: '100%', borderRadius: '9999px', width: `${percentage}%`}}></div>
                                        </div>
                                    </div>
                                )}
                                {quest.isComplete && <p style={{color: '#4ADE80', fontWeight: 'bold', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'right'}}>Completed!</p>}
                            </div>
                        );
                    }) : (
                        <p style={{color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '1rem', textAlign: 'center'}}>You have no active quests.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestLogModal;