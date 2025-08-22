import React, { useState } from 'react';
import type { Player } from '../types';

interface BrainstormJournalModalProps {
    journal: Record<string, string[]>;
    players: Player[];
    onClose: () => void;
}

const BrainstormJournalModal: React.FC<BrainstormJournalModalProps> = ({ journal, players, onClose }) => {
    const [activeTab, setActiveTab] = useState<string>(players[0]?.id || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 animate-slide-in border-2 border-blue-500 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-blue-400 font-serif">Brainstorming Journal</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>

                <div className="flex border-b border-gray-700">
                    {players.map(player => (
                        <button
                            key={player.id}
                            onClick={() => setActiveTab(player.id)}
                            className={`py-2 px-4 font-semibold transition-colors ${
                                activeTab === player.id 
                                ? 'border-b-2 border-blue-400 text-blue-400' 
                                : 'text-text-secondary hover:text-white'
                            }`}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto mt-4 pr-2">
                    {activeTab && (journal[activeTab] || []).length > 0 ? (
                        (journal[activeTab] || []).map((entry, index) => (
                            <div key={index} className="bg-background p-4 rounded-lg mb-4 border border-gray-700">
                                <p className="whitespace-pre-wrap font-serif text-text-secondary">{entry}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-secondary italic mt-4">No entries yet for this player.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrainstormJournalModal;
