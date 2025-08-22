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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 animate-slide-in border-2 border-yellow-500 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-yellow-400 font-serif flex items-center gap-2">
                        <QuestIcon className="w-7 h-7" />
                        Quest Log
                    </h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-4 pr-2 space-y-4">
                    {myQuests.length > 0 ? myQuests.map(quest => {
                        const progress = quest.progress[currentPlayerId] || 0;
                        const target = quest.targetWordCount || 1;
                        const percentage = Math.min((progress / target) * 100, 100);
                        const assignee = quest.assigneeId === 'all' ? 'All Players' : players.find(p => p.id === quest.assigneeId)?.name;

                        return (
                             <div key={quest.id} className={`bg-background p-4 rounded-lg border-l-4 ${quest.isComplete ? 'border-green-500 opacity-70' : 'border-yellow-600'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-secondary">{quest.title}</h3>
                                        <p className="text-xs text-text-secondary">Assigned to: {assignee}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <CoinIcon className="w-4 h-4" />
                                            <span>{quest.rewardCoins}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-400">
                                            <LevelUpIcon className="w-4 h-4" />
                                            <span>{quest.rewardXp} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary my-2">{quest.description}</p>
                                {quest.targetWordCount && (
                                    <div>
                                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                                            <span>Progress</span>
                                            <span>{progress} / {target} words</span>
                                        </div>
                                        <div className="w-full bg-surface rounded-full h-2.5 border border-gray-600">
                                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                {quest.isComplete && <p className="text-green-400 font-bold text-sm mt-2 text-right">Completed!</p>}
                            </div>
                        );
                    }) : (
                        <p className="text-text-secondary italic mt-4 text-center">You have no active quests.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestLogModal;
