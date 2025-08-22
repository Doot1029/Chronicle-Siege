
import React, { useState } from 'react';
import type { GameSettings, Location, Character } from '../types';
import { Difficulty, GameMode } from '../types';
import { PenIcon, BookOpenIcon, SparklesIcon, LevelUpIcon } from './icons';

interface GameSetupProps {
  onGameStart: (settings: GameSettings) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1']);
  const [characters, setCharacters] = useState<Record<string, Character[]>>({
    'Player 1': [{ name: 'Character Name', bio: 'A brave adventurer.' }]
  });
  const [storyPrompt, setStoryPrompt] = useState('The caravan stopped suddenly, not for a rest, but for a wall of shimmering, silent mist that had appeared on the road ahead...');
  const [initialText, setInitialText] = useState('');
  const [goals, setGoals] = useState('Survive the encounter and discover the source of the mist.');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [hostRules, setHostRules] = useState('1. Be respectful of other writers.\n2. Try to build on the previous entry, not negate it.\n3. Have fun!');
  const [locationsInput, setLocationsInput] = useState(
`Town Square > Haunted Forest, Castle Gates
Haunted Forest > Town Square, Whispering Caves
Castle Gates > Town Square
Whispering Caves > Haunted Forest`
  );

  const handleAddPlayer = () => {
    const newPlayerName = `Player ${playerNames.length + 1}`;
    setPlayerNames([...playerNames, newPlayerName]);
    setCharacters(prev => ({ ...prev, [newPlayerName]: [{ name: 'New Hero', bio: '' }] }));
  };

  const handlePlayerNameChange = (index: number, newName: string) => {
    const oldName = playerNames[index];
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = newName;
    setPlayerNames(newPlayerNames);

    setCharacters(prev => {
        const newChars = { ...prev };
        if (oldName !== newName) {
            newChars[newName] = newChars[oldName];
            delete newChars[oldName];
        }
        return newChars;
    });
  };

  const handleAddCharacter = (playerName: string) => {
      setCharacters(prev => ({
          ...prev,
          [playerName]: [...(prev[playerName] || []), { name: 'Another Persona', bio: '' }]
      }));
  };

  const handleCharacterChange = (playerName: string, charIndex: number, field: 'name' | 'bio', value: string) => {
      setCharacters(prev => {
          const newCharsForPlayer = [...prev[playerName]];
          newCharsForPlayer[charIndex] = { ...newCharsForPlayer[charIndex], [field]: value };
          return { ...prev, [playerName]: newCharsForPlayer };
      });
  };

  const parseLocations = (input: string): Location[] => {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const locationMap = new Map<string, Location>();
    
    lines.forEach((line) => {
        const parts = line.split('>').map(p => p.trim());
        const sourceName = parts[0];
        if (!locationMap.has(sourceName)) {
            locationMap.set(sourceName, { id: `loc${locationMap.size}`, name: sourceName, description: `A mysterious location.`, connections: [] });
        }
        if (parts.length > 1) {
            const connectionNames = parts[1].split(',').map(n => n.trim());
            connectionNames.forEach(connName => {
                if (!locationMap.has(connName)) {
                     locationMap.set(connName, { id: `loc${locationMap.size}`, name: connName, description: `A mysterious location.`, connections: [] });
                }
            });
        }
    });

    lines.forEach(line => {
        const parts = line.split('>').map(p => p.trim());
        const sourceName = parts[0];
        const sourceLoc = locationMap.get(sourceName);
        if (sourceLoc && parts.length > 1) {
            const connectionNames = parts[1].split(',').map(n => n.trim());
            sourceLoc.connections = connectionNames
                .map(connName => locationMap.get(connName)?.id)
                .filter((id): id is string => !!id);
        }
    });

    return Array.from(locationMap.values());
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locations = parseLocations(locationsInput);
    const finalPlayerNames = playerNames.filter(name => name.trim() !== '');
    const finalCharacters = Object.fromEntries(
        Object.entries(characters).filter(([name]) => finalPlayerNames.includes(name))
    );

    onGameStart({
      playerNames: finalPlayerNames,
      storyPrompt,
      initialText: initialText || storyPrompt,
      goals,
      difficulty,
      storyLengthWords: null,
      players: [],
      locations,
      hostRules,
      initialCharacters: finalCharacters,
    });
  };

  return (
    <div className="game-setup-wrapper animate-fade-in">
      <div className="game-setup-header">
        <h1>Chronicle Siege</h1>
        <p>Forge your epic tale, together.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="game-setup-form">
        <div className="game-setup-grid">
          
          {/* Left/Main Column: Story Details */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 className="game-setup-section-header">
              <BookOpenIcon className="w-6 h-6" />
              <span>World Setup</span>
            </h2>

            <div className="game-setup-grid-2col">
              <div>
                <label htmlFor="storyPrompt" className="form-label">Story Prompt</label>
                <textarea
                  id="storyPrompt" value={storyPrompt} onChange={(e) => setStoryPrompt(e.target.value)}
                  className="form-textarea font-serif"
                  rows={6} />
              </div>
              <div>
                <label htmlFor="hostRules" className="form-label">Host Rules</label>
                <textarea
                  id="hostRules" value={hostRules} onChange={(e) => setHostRules(e.target.value)}
                  className="form-textarea font-serif"
                  rows={6} />
              </div>
            </div>

            <div>
              <label htmlFor="locations" className="form-label">Story Locations & Connections</label>
              <textarea
                  id="locations" value={locationsInput} onChange={(e) => setLocationsInput(e.target.value)}
                  className="form-textarea font-mono"
                  style={{fontSize: '0.875rem'}}
                  rows={5} placeholder={'e.g. Town > Forest, Castle'} />
              <p style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem'}}>{'Format: `Location > Connection1, Connection2`.'}</p>
            </div>
          </div>

          {/* Right Column: Players & Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h2 className="game-setup-section-header">
                <SparklesIcon className="w-6 h-6" />
                <span>Game Settings</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label htmlFor="goals" className="form-label">Main Goal / Task</label>
                  <input
                      type="text" id="goals" value={goals} onChange={(e) => setGoals(e.target.value)}
                      className="form-input" />
                </div>
                <div>
                  <label htmlFor="difficulty" className="form-label">Difficulty</label>
                  <select
                      id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="form-select"
                  >
                      {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="gameModeDisplay" className="form-label">Game Mode</label>
                  <input
                      type="text" id="gameModeDisplay" value={GameMode.OFFLINE}
                      className="form-input" disabled style={{opacity: 0.7}}/>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="game-setup-section-header">
                <LevelUpIcon className="w-6 h-6" />
                <span>Players & Characters</span>
              </h2>
                 <div className="game-setup-player-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {playerNames.map((pName, pIndex) => (
                      <div key={pIndex} className="game-setup-player-card">
                          <input
                              type="text" value={pName} onChange={(e) => handlePlayerNameChange(pIndex, e.target.value)}
                              className="form-input"
                              placeholder={`Player ${pIndex + 1} Name`}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {(characters[pName] || []).map((char, cIndex) => (
                                   <div key={cIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                      <input type="text" value={char.name} onChange={e => handleCharacterChange(pName, cIndex, 'name', e.target.value)} placeholder="Character Name" className="form-input" style={{fontSize: '0.875rem'}} />
                                      <input type="text" value={char.bio} onChange={e => handleCharacterChange(pName, cIndex, 'bio', e.target.value)} placeholder="Bio / Description" className="form-input" style={{fontSize: '0.875rem'}} />
                                  </div>
                              ))}
                          </div>
                          <button type="button" onClick={() => handleAddCharacter(pName)} style={{marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'}}>+ Add Character</button>
                      </div>
                  ))}
                   <button type="button" onClick={handleAddPlayer} style={{width: '100%', textAlign: 'center', padding: '0.5rem', border: '2px dashed var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '0.5rem'}}>+ Add Player</button>
                </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button 
            type="submit"
            className="btn btn-primary"
            style={{fontSize: '1.25rem'}}
          >
            <PenIcon className="w-6 h-6"/>
            <span>Begin the Chronicle</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameSetup;