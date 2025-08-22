
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
    <div className="bg-surface p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-secondary">Party Status</h3>
      <div className="space-y-3">
        {players.map((player) => {
          const activeCharacter = player.characters[player.activeCharacterIndex];
          const averageRating = useMemo(() => {
            if (!player.feedback || player.feedback.length === 0) return 0;
            const total = player.feedback.reduce((sum, f) => sum + f.rating, 0);
            return total / player.feedback.length;
          }, [player.feedback]);

          const isDonatingToThisPlayer = donation.toId === player.id;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg transition-all duration-300 ${
                player.id === currentPlayerId ? 'bg-primary/20 border-l-4 border-primary' : 'bg-background/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                    <span className="font-bold text-text-main flex items-center gap-2">
                        {player.id === currentPlayerId && <PenIcon className="w-4 h-4 text-primary animate-pulse"/>}
                        {player.name}
                    </span>
                    <span className="text-xs text-text-secondary ml-1">(as {activeCharacter.name})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs text-yellow-400">
                      {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" filled={i < averageRating} />)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <LevelUpIcon className="w-4 h-4 text-green-400" />
                        <span>Lvl {player.level}</span>
                    </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(player.maxHearts)].map((_, i) => (
                    <HeartIcon
                      key={i}
                      className={`w-5 h-5 transition-colors ${
                        i < player.hearts ? 'text-red-500' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <CoinIcon className="w-5 h-5" />
                        <span className="font-semibold">{player.coins}</span>
                    </div>
                    {player.id !== currentPlayerId && (
                        <button onClick={() => handleDonateClick(player.id)} title={`Donate to ${player.name}`} className="text-green-400 hover:text-green-300">
                            <DonateIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
              </div>
              {isDonatingToThisPlayer && (
                <div className="mt-2 flex gap-2 animate-fade-in">
                  <input
                    type="number"
                    value={donation.amount}
                    onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
                    placeholder="Amount"
                    min="1"
                    max={currentPlayer.coins}
                    className="w-full p-1 text-sm bg-background border border-gray-600 rounded-md focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={() => handleDonationSubmit(currentPlayerId, player.id)} className="px-3 py-1 text-sm bg-primary rounded-md hover:bg-purple-700">Send</button>
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