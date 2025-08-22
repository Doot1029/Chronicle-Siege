
import React, { useState, useMemo } from 'react';
import type { Player } from '../types';
import { HeartIcon, CoinIcon, LevelUpIcon, PenIcon, StarIcon, DonateIcon } from './icons';

interface PlayerHUDProps {
  players: Player[];
  currentPlayerId: string;
  onDonate: (fromId: string, toId: string, amount: number) => void;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({ players, currentPlayerId, onDonate }) => {
  const [donation, setDonation] = useState<{ toId: string | null; amount: string }>({ toId: null, amount: '' });
  const currentPlayer = players.find(p => p.id === currentPlayerId)!;

  const handleDonateClick = (toId: string) => {
    if (donation.toId === toId) {
      setDonation({ toId: null, amount: '' }); // Toggle off
    } else {
      setDonation({ toId, amount: '' });
    }
  };

  const handleDonationSubmit = (fromId: string, toId: string) => {
    const amount = parseInt(donation.amount, 10);
    if (!isNaN(amount) && amount > 0 && amount <= currentPlayer.coins) {
      onDonate(fromId, toId, amount);
      setDonation({ toId: null, amount: '' });
    } else {
        alert("Invalid amount or not enough coins.");
    }
  };

  return (
    <div className="card">
      <h3 className="sidebar-section-header">Party Status</h3>
      <div className="player-hud-list">
        {players.map((player) => {
          const activeCharacter = player.characters[player.activeCharacterIndex];
          const averageRating = useMemo(() => {
            if (!player.feedback || player.feedback.length === 0) return 0;
            const total = player.feedback.reduce((sum, f) => sum + f.rating, 0);
            return total / player.feedback.length;
          }, [player.feedback]);

          const isDonatingToThisPlayer = donation.toId === player.id;
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <div
              key={player.id}
              className={`player-card ${isCurrentPlayer ? 'is-current' : ''}`}
            >
              <div className="player-card-header">
                <div>
                    <span className="player-card-name">
                        {isCurrentPlayer && <PenIcon className="w-4 h-4" style={{color: 'var(--color-primary)', animation: 'pulse 1.5s infinite'}}/>}
                        {player.name}
                    </span>
                    <span style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem'}}>(as {activeCharacter.name})</span>
                </div>
                <div className="player-card-stats" style={{fontSize: '0.75rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', color: '#FBBF24'}}>
                      {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" filled={i < averageRating} />)}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)'}}>
                        <LevelUpIcon className="w-4 h-4" style={{color: '#34D399'}} />
                        <span>Lvl {player.level}</span>
                    </div>
                </div>
              </div>
              <div className="player-card-footer" style={{marginTop: '0.5rem'}}>
                <div className="player-card-hearts">
                  {[...Array(player.maxHearts)].map((_, i) => (
                    <HeartIcon
                      key={i}
                      className={`heart-icon ${i < player.hearts ? 'filled' : 'empty'}`}
                    />
                  ))}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24'}}>
                        <CoinIcon className="w-5 h-5" />
                        <span style={{fontWeight: 600}}>{player.coins}</span>
                    </div>
                    {player.id !== currentPlayerId && (
                        <button onClick={() => handleDonateClick(player.id)} title={`Donate to ${player.name}`} className="btn-icon" style={{color: '#34D399'}}>
                            <DonateIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
              </div>
              {isDonatingToThisPlayer && (
                <div className="animate-fade-in" style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
                  <input
                    type="number"
                    value={donation.amount}
                    onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
                    placeholder="Amount"
                    min="1"
                    max={currentPlayer.coins}
                    className="form-input"
                    style={{padding: '0.25rem', fontSize: '0.875rem'}}
                  />
                  <button onClick={() => handleDonationSubmit(currentPlayerId, player.id)} className="btn btn-primary" style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem', width: 'auto'}}>Send</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default PlayerHUD;