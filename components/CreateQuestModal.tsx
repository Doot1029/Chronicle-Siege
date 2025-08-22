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
        <div className="modal-overlay">
            <div className="modal-content size-md" style={{borderColor: '#22C55E'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <QuestIcon className="w-7 h-7" />
                        Create New Quest
                    </h2>
                    <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div>
                        <label htmlFor="title" className="form-label" style={{fontSize: '0.875rem'}}>Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="form-input"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="form-label" style={{fontSize: '0.875rem'}}>Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required className="form-textarea" rows={3}></textarea>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div>
                            <label htmlFor="rewardCoins" className="form-label" style={{fontSize: '0.875rem'}}>Reward Coins</label>
                            <input type="number" id="rewardCoins" value={rewardCoins} onChange={e => setRewardCoins(e.target.value)} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="rewardXp" className="form-label" style={{fontSize: '0.875rem'}}>Reward XP</label>
                            <input type="number" id="rewardXp" value={rewardXp} onChange={e => setRewardXp(e.target.value)} required className="form-input"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="targetWordCount" className="form-label" style={{fontSize: '0.875rem'}}>Target Word Count (Optional)</label>
                        <input type="number" id="targetWordCount" value={targetWordCount} onChange={e => setTargetWordCount(e.target.value)} className="form-input"/>
                    </div>
                     <div>
                        <label htmlFor="assigneeId" className="form-label" style={{fontSize: '0.875rem'}}>Assign To</label>
                        <select id="assigneeId" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="form-select">
                            <option value="all">All Players</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem'}}>
                         <button type="button" onClick={onClose} style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem'}}>Cancel</button>
                         <button type="submit" className="btn" style={{backgroundColor: '#16A34A', color: 'white', width: 'auto'}}>Create Quest</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestModal;