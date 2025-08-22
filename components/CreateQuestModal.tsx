import React, { useState } from 'react';
import type { Player, Quest } from '../types';
import { QuestIcon } from './icons';

interface CreateQuestModalProps {
  players: Player[];
  onClose: () => void;
  onCreateQuest: (questData: Omit<Quest, 'id' | 'progress' | 'isComplete'>) => void;
}

const CreateQuestModal: React.FC<CreateQuestModalProps> = ({ players, onClose, onCreateQuest }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rewardCoins, setRewardCoins] = useState('50');
    const [rewardXp, setRewardXp] = useState('100');
    const [targetWordCount, setTargetWordCount] = useState('200');
    const [assigneeId, setAssigneeId] = useState('all');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateQuest({
            title,
            description,
            rewardCoins: parseInt(rewardCoins, 10) || 0,
            rewardXp: parseInt(rewardXp, 10) || 0,
            targetWordCount: parseInt(targetWordCount, 10) || undefined,
            assigneeId
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 animate-slide-in border-2 border-green-500">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-green-400 font-serif flex items-center gap-2">
                        <QuestIcon className="w-7 h-7" />
                        Create New Quest
                    </h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md" rows={3}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rewardCoins" className="block text-sm font-medium text-text-secondary">Reward Coins</label>
                            <input type="number" id="rewardCoins" value={rewardCoins} onChange={e => setRewardCoins(e.target.value)} required className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="rewardXp" className="block text-sm font-medium text-text-secondary">Reward XP</label>
                            <input type="number" id="rewardXp" value={rewardXp} onChange={e => setRewardXp(e.target.value)} required className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="targetWordCount" className="block text-sm font-medium text-text-secondary">Target Word Count (Optional)</label>
                        <input type="number" id="targetWordCount" value={targetWordCount} onChange={e => setTargetWordCount(e.target.value)} className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="assigneeId" className="block text-sm font-medium text-text-secondary">Assign To</label>
                        <select id="assigneeId" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full p-2 mt-1 bg-background border border-gray-600 rounded-md">
                            <option value="all">All Players</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                         <button type="button" onClick={onClose} className="text-sm text-text-secondary hover:text-white transition py-2 px-4">Cancel</button>
                         <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Create Quest</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestModal;