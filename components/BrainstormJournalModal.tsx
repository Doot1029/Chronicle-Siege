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
        <div className="modal-overlay">
            <div className="modal-content size-xl tall" style={{borderColor: '#60A5FA'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#60A5FA'}}>Brainstorming Journal</h2>
                    <button onClick={onClose} style={{fontSize: '1.5rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>&times;</button>
                </div>

                <div style={{display: 'flex', borderBottom: '1px solid var(--color-border)'}}>
                    {players.map(player => (
                        <button
                            key={player.id}
                            onClick={() => setActiveTab(player.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontWeight: 600,
                                transition: 'color 0.2s, border-color 0.2s',
                                borderBottom: activeTab === player.id ? '2px solid #60A5FA' : '2px solid transparent',
                                color: activeTab === player.id ? '#60A5FA' : 'var(--color-text-secondary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>

                <div style={{flexGrow: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem'}}>
                    {activeTab && (journal[activeTab] || []).length > 0 ? (
                        (journal[activeTab] || []).map((entry, index) => (
                            <div key={index} style={{backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--color-border)'}}>
                                <p className="font-serif prose prose-invert">{entry}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '1rem'}}>No entries yet for this player.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrainstormJournalModal;