
import React, { useState } from 'react';
import type { GameSettings, Location, Character } from '../types';
import { Difficulty, GameMode } from '../types';
import { PenIcon } from './icons';
import type { Participant } from '../types/discord';

interface GameSetupProps {
  onGameStart: (settings: GameSettings) => void;
  gameMode: GameMode;
  participants: Participant[];
  isHost: boolean;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart, gameMode, participants, isHost }) => {
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
    const finalPlayerNames = gameMode === GameMode.ONLINE ? participants.map(p => p.global_name || p.username) : playerNames.filter(name => name.trim() !== '');
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
      gameMode,
      hostRules,
      initialCharacters: finalCharacters,
      hostId: gameMode === GameMode.ONLINE ? participants.sort((a,b) => a.id.localeCompare(b.id))[0].id : null,
    });
  };

  const canSubmit = gameMode === GameMode.OFFLINE || isHost;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-surface rounded-xl shadow-2xl animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary font-serif">Chronicle Siege</h1>
        <p className="text-text-secondary mt-2">Forge your epic tale, together.</p>
        {gameMode === GameMode.ONLINE && <p className="text-green-400 font-semibold mt-1">Discord Activity Mode</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="storyPrompt" className="block text-lg font-semibold mb-2 text-secondary">Story Prompt</label>
            <textarea
              id="storyPrompt" value={storyPrompt} onChange={(e) => setStoryPrompt(e.target.value)}
              className="w-full p-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary font-serif disabled:opacity-70"
              rows={4} disabled={!canSubmit}/>
          </div>
          <div>
            <label htmlFor="hostRules" className="block text-lg font-semibold mb-2 text-secondary">Host Rules</label>
            <textarea
              id="hostRules" value={hostRules} onChange={(e) => setHostRules(e.target.value)}
              className="w-full p-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary font-serif disabled:opacity-70"
              rows={4} disabled={!canSubmit}/>
          </div>
          <div>
            <label htmlFor="locations" className="block text-lg font-semibold mb-2 text-secondary">Story Locations & Connections</label>
            <textarea
                id="locations" value={locationsInput} onChange={(e) => setLocationsInput(e.target.value)}
                className="w-full p-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-70"
                rows={5} placeholder={'e.g. Town > Forest, Castle'} disabled={!canSubmit}/>
            <p className="text-xs text-text-secondary mt-1">{'Format: `Location > Connection1, Connection2`.'}</p>
          </div>
          <div>
            <label htmlFor="goals" className="block text-lg font-semibold mb-2 text-secondary">Main Goal / Task</label>
            <input
                type="text" id="goals" value={goals} onChange={(e) => setGoals(e.target.value)}
                className="w-full p-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary disabled:opacity-70" disabled={!canSubmit}/>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-3 text-secondary border-t border-gray-700 pt-4">Players & Characters</h2>
          {gameMode === GameMode.ONLINE ? (
             <div className="space-y-2">
                {participants.map((p, i) => (
                    <div key={p.id} className="p-3 bg-background/50 rounded-lg border border-gray-700 font-semibold text-text-main">
                        {p.global_name || p.username} {i === 0 && <span className="text-xs text-primary font-bold"> (Host)</span>}
                    </div>
                ))}
            </div>
          ) : (
             <div className="space-y-4">
              {playerNames.map((pName, pIndex) => (
                  <div key={pIndex} className="p-4 bg-background/50 rounded-lg border border-gray-700">
                      <input
                          type="text" value={pName} onChange={(e) => handlePlayerNameChange(pIndex, e.target.value)}
                          className="w-full p-3 mb-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary font-bold"
                          placeholder={`Player ${pIndex + 1} Name`}
                      />
                      <div className="space-y-2">
                          {(characters[pName] || []).map((char, cIndex) => (
                               <div key={cIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-surface/50 rounded">
                                  <input type="text" value={char.name} onChange={e => handleCharacterChange(pName, cIndex, 'name', e.target.value)} placeholder="Character Name" className="w-full p-2 bg-background border border-gray-600 rounded-md text-sm" />
                                  <input type="text" value={char.bio} onChange={e => handleCharacterChange(pName, cIndex, 'bio', e.target.value)} placeholder="Character Bio / Description" className="w-full p-2 bg-background border border-gray-600 rounded-md text-sm" />
                              </div>
                          ))}
                      </div>
                      <button type="button" onClick={() => handleAddCharacter(pName)} className="mt-2 text-xs text-primary hover:text-purple-400 transition">+ Add Character</button>
                  </div>
              ))}
               <button type="button" onClick={handleAddPlayer} className="mt-3 text-sm text-primary hover:text-purple-400 transition">+ Add Player</button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="difficulty" className="block text-lg font-semibold mb-2 text-secondary">Difficulty</label>
                  <select
                      id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full p-3 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary disabled:opacity-70"
                      disabled={!canSubmit}
                  >
                      {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
              </div>
               <div>
                  <label htmlFor="gameModeDisplay" className="block text-lg font-semibold mb-2 text-secondary">Game Mode</label>
                  <input
                      type="text" id="gameModeDisplay" value={gameMode}
                      className="w-full p-3 bg-background border border-gray-600 rounded-lg disabled:opacity-70" disabled />
              </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <PenIcon className="w-6 h-6"/>
          {canSubmit ? 'Begin the Chronicle' : 'Waiting for Host to Start...'}
        </button>
      </form>
    </div>
  );
};

export default GameSetup;