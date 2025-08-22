
import React, { useState } from 'react';
import type { Player, Stim } from '../types';
import { INITIAL_SHOP_ITEMS, THEMES } from '../constants';
import { CoinIcon } from './icons';

interface WritersBlockShopProps {
  players: Player[];
  onExit: (updatedPlayers: Player[]) => void;
}

const WritersBlockShop: React.FC<WritersBlockShopProps> = ({ players, onExit }) => {
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
    <div className="card animate-fade-in" style={{maxWidth: '56rem', margin: 'auto'}}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <h1 className="font-serif" style={{fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-secondary)'}}>Writer's Block</h1>
        <p style={{color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>Your one-stop shop for creative fuel.</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        {/* Player Selection and Info */}
        <div>
          <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-primary)'}}>Shopper</h2>
          <select 
            value={selectedPlayerId} 
            onChange={e => setSelectedPlayerId(e.target.value)}
            className="form-select"
            style={{marginBottom: '1rem'}}
          >
            {mutablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div style={{backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '0.5rem'}}>
            <h3 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>{selectedPlayer.name}</h3>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#FBBF24'}}>
              <CoinIcon className="w-6 h-6" />
              <span style={{fontSize: '1.25rem', fontWeight: 600}}>{selectedPlayer.coins}</span>
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div>
          <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-primary)'}}>Wares</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem'}}>
            {shopItems.map(item => (
              <div key={item.id} style={{backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-secondary)'}}>{item.name}</h3>
                  <p style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '0.75rem'}}>{item.description}</p>
                </div>
                <button 
                  onClick={() => handleBuyItem(item)}
                  disabled={selectedPlayer.coins < item.cost || selectedPlayer.inventory.some(i => i.id === item.id)}
                  className="btn btn-primary"
                >
                  <CoinIcon className="w-5 h-5" />
                  {selectedPlayer.inventory.some(i => i.id === item.id) ? 'Owned' : item.cost}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '3rem'}}>
        <button 
          onClick={() => onExit(mutablePlayers)}
          className="btn btn-secondary"
          style={{width: 'auto'}}
        >
          Return to Chronicle
        </button>
      </div>
    </div>
  );
};

export default WritersBlockShop;