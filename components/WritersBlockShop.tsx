
import React, { useState } from 'react';
import type { Player, Stim } from '../types';
import { INITIAL_SHOP_ITEMS, THEMES } from '../constants';
import { CoinIcon } from './icons';

interface WritersBlockShopProps {
  players: Player[];
  onExit: (updatedPlayers: Player[]) => void;
  hostId: string;
}

const WritersBlockShop: React.FC<WritersBlockShopProps> = ({ players, onExit, hostId }) => {
  const [shopItems, setShopItems] = useState<Stim[]>(INITIAL_SHOP_ITEMS);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0].id);
  const [mutablePlayers, setMutablePlayers] = useState<Player[]>(JSON.parse(JSON.stringify(players)));

  const selectedPlayer = mutablePlayers.find(p => p.id === selectedPlayerId)!;

  const handleBuyItem = (item: Stim) => {
    if (selectedPlayer.coins >= item.cost) {
      const playerAlreadyOwns = selectedPlayer.inventory.some(i => i.id === item.id);
      if (playerAlreadyOwns) {
          alert("You already own this item!");
          return;
      }
      
      const updatedPlayers = mutablePlayers.map(p => {
        if (p.id === selectedPlayerId) {
          const newInventory = [...p.inventory, item];
          const newCoins = p.coins - item.cost;
          let newTheme = p.theme;
          if (item.type === 'theme' && item.effect) {
             newTheme = item.effect;
          }
          return { ...p, coins: newCoins, inventory: newInventory, theme: newTheme };
        }
        return p;
      });
      setMutablePlayers(updatedPlayers);
    } else {
        alert("Not enough coins!");
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-8 bg-surface rounded-xl shadow-2xl animate-fade-in text-text-main">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-secondary font-serif">Writer's Block</h1>
        <p className="text-text-secondary mt-2">Your one-stop shop for creative fuel.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Player Selection and Info */}
        <div className="md:w-1/4">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Shopper</h2>
          <select 
            value={selectedPlayerId} 
            onChange={e => setSelectedPlayerId(e.target.value)}
            className="w-full p-3 bg-background border border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-secondary transition"
          >
            {mutablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="bg-background p-4 rounded-lg">
            <h3 className="font-bold text-lg">{selectedPlayer.name}</h3>
            <div className="flex items-center gap-2 mt-2 text-yellow-400">
              <CoinIcon className="w-6 h-6" />
              <span className="text-xl font-semibold">{selectedPlayer.coins}</span>
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div className="md:w-3/4">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Wares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems.map(item => (
              <div key={item.id} className="bg-background p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-secondary">{item.name}</h3>
                  <p className="text-text-secondary text-sm mt-1 mb-3">{item.description}</p>
                </div>
                <button 
                  onClick={() => handleBuyItem(item)}
                  disabled={selectedPlayer.coins < item.cost || selectedPlayer.inventory.some(i => i.id === item.id)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                >
                  <CoinIcon className="w-5 h-5" />
                  {selectedPlayer.inventory.some(i => i.id === item.id) ? 'Owned' : item.cost}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <button 
          onClick={() => onExit(mutablePlayers)}
          className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-transform transform hover:scale-105"
        >
          Return to Chronicle
        </button>
      </div>
    </div>
  );
};

export default WritersBlockShop;
