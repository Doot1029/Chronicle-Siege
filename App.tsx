
import React, { useState, useCallback, useEffect } from 'react';
import type { GameState, GameSettings, Player, Theme, Quest } from './types';
import { GameStatus, GameMode } from './types';
import GameSetup from './components/GameSetup';
import GameView from './components/GameView';
import WritersBlockShop from './components/WritersBlockShop';
import { THEMES } from './constants';
import BrainstormJournalModal from './components/BrainstormJournalModal';
import GameOverView from './components/GameOverView';
import IntermissionView from './components/IntermissionView';

import { discordService } from './services/discordService';
import P2PService from './services/p2pService';
import type { User as DiscordUser, Participant } from './types/discord';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  const [showJournal, setShowJournal] = useState(false);
  
  // Online mode state
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.OFFLINE);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [p2p, setP2p] = useState<P2PService | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme class to the body element for global styling
  useEffect(() => {
    const body = document.body;
    // Clean up previous theme classes from the body
    THEMES.forEach(theme => {
      body.classList.remove(theme.className);
    });
    // Add the new active theme class
    body.classList.add(activeTheme.className);
  }, [activeTheme]);

  // Initialize Discord SDK and P2P connection
  useEffect(() => {
    const initOnlineMode = async () => {
      try {
        await discordService.initialize();
        const auth = await discordService.authenticate();
        const currentParticipants = await discordService.getParticipants();
        
        // Determine host (e.g., first participant sorted by ID)
        const sortedParticipants = [...currentParticipants].sort((a, b) => a.id.localeCompare(b.id));
        const host = sortedParticipants[0];
        
        if (!host) {
            throw new Error("No participants found in the voice channel.");
        }
        
        const hostId = host.id;
        const currentIsHost = auth.user.id === hostId;

        setDiscordUser(auth.user);
        setParticipants(sortedParticipants);
        setGameMode(GameMode.ONLINE);
        setIsHost(currentIsHost);

        const p2pService = new P2PService(hostId); // Use hostId as the unique game ID
        p2pService.init(auth.user.id, currentIsHost);
        setP2p(p2pService);
      } catch (error) {
        console.warn("Could not initialize Discord SDK. Falling back to offline mode.", error);
        setGameMode(GameMode.OFFLINE);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if running in an iframe, which is how Discord Activities are served
    if (window.self !== window.top) {
      initOnlineMode();
    } else {
        setIsLoading(false); // Not in Discord, just start in offline mode
    }
    
    return () => {
        p2p?.close();
    };
  }, []);

  // P2P Listeners for clients to receive game state updates
  useEffect(() => {
    if (!p2p || isHost) return;

    const handleGameStateUpdate = (newState: GameState) => {
      setGameState(newState);
    };
    
    p2p.on('game_state_update', handleGameStateUpdate);

    return () => {
      p2p.off('game_state_update', handleGameStateUpdate);
    };
  }, [p2p, isHost]);
  
  // Wrapper to update and broadcast state
  // Only the host or an offline player can call this directly.
  const updateAndBroadcastState = (newState: GameState | null) => {
    setGameState(newState);
    if (gameMode === GameMode.ONLINE && isHost && p2p && newState) {
      p2p.broadcast('game_state_update', newState);
    }
  };


  const handleGameStart = useCallback((settings: GameSettings) => {
    if (gameMode === GameMode.ONLINE && !isHost) return;

    const playerSource = gameMode === GameMode.ONLINE 
        ? participants 
        : settings.playerNames.map((name, i) => ({ id: `p${i+1}`, global_name: name }));

    const initialPlayers: Player[] = playerSource.map((p, index) => ({
      id: p.id,
      name: p.global_name || `Player ${index + 1}`,
      hearts: 3,
      maxHearts: 3,
      coins: 0,
      level: 1,
      experience: 0,
      inventory: [],
      theme: THEMES[0],
      feedback: [],
      characters: settings.initialCharacters[p.global_name || `Player ${index + 1}`] || [{ name: `Character ${index + 1}`, bio: '' }],
      activeCharacterIndex: 0,
      rebirthPoints: 0,
    }));
    
    const startingLocationId = settings.locations.length > 0 ? settings.locations[0].id : '';
    const playerPositions = initialPlayers.reduce((acc, player) => {
        acc[player.id] = startingLocationId;
        return acc;
    }, {} as Record<string, string>);

    const brainstormingJournal = initialPlayers.reduce((acc, player) => {
        acc[player.id] = [];
        return acc;
    }, {} as Record<string, string[]>);
    
    const hostId = gameMode === GameMode.ONLINE ? participants.sort((a,b) => a.id.localeCompare(b.id))[0].id : null;

    updateAndBroadcastState({
      gameId: hostId || 'offline',
      status: GameStatus.INTERMISSION,
      settings: { ...settings, players: initialPlayers, hostId },
      story: settings.initialText,
      currentPlayerIndex: 0,
      monster: null,
      commentary: [],
      turn: 1,
      playerPositions,
      brainstormingJournal,
      voteState: null,
      quests: [],
      storyBible: 'This is the story bible. The host can add important world-building details, character backstories, and established lore here.',
      limboState: null,
    });
  }, [gameMode, isHost, participants, p2p]);

  const handleOpenShop = useCallback(() => {
    if (gameState) {
      updateAndBroadcastState({ ...gameState, status: GameStatus.SHOP });
    }
  }, [gameState, isHost, p2p, gameMode]);

  const handleExitShop = useCallback((updatedPlayers: Player[]) => {
    if (gameState) {
        updateAndBroadcastState({ 
            ...gameState, 
            status: GameStatus.PLAYING,
            settings: { ...gameState.settings, players: updatedPlayers }
        });
    }
  }, [gameState, isHost, p2p, gameMode]);
  
  const handleStartTurn = useCallback(() => {
    if (!gameState) return;
    updateAndBroadcastState({ ...gameState, status: GameStatus.PLAYING });
  }, [gameState, isHost, p2p, gameMode]);
  
  const handlePauseGame = useCallback(() => {
      if (!gameState) return;
      updateAndBroadcastState({ ...gameState, status: GameStatus.PAUSED });
  }, [gameState, isHost, p2p, gameMode]);

  const handleResumeGame = useCallback(() => {
      if (!gameState) return;
      updateAndBroadcastState({ ...gameState, status: GameStatus.PLAYING });
  }, [gameState, isHost, p2p, gameMode]);

  const handleThemeChange = useCallback((theme: Theme) => {
    setActiveTheme(theme);
  }, []);

  const handleBrainstormSubmit = useCallback((playerId: string, text: string) => {
      setGameState(prev => {
          if (!prev) return null;
          
          const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
          const coinsEarned = Math.floor(wordCount / 10);

          const updatedPlayers = prev.settings.players.map(p => 
              p.id === playerId ? { ...p, coins: p.coins + coinsEarned } : p
          );
          
          const updatedJournal = { ...prev.brainstormingJournal };
          updatedJournal[playerId] = [...(updatedJournal[playerId] || []), text];

          const newState = {
              ...prev,
              settings: { ...prev.settings, players: updatedPlayers },
              brainstormingJournal: updatedJournal
          };
          updateAndBroadcastState(newState);
          return newState; // for local update
      });
  }, [isHost, p2p, gameMode]);

  const handleCreateQuest = useCallback((questData: Omit<Quest, 'id' | 'progress' | 'isComplete'>) => {
      setGameState(prev => {
          if (!prev) return null;
          const newQuest: Quest = {
              ...questData,
              id: `q${Date.now()}`,
              progress: {},
              isComplete: false,
          };
          const newState = { ...prev, quests: [...prev.quests, newQuest] };
          updateAndBroadcastState(newState);
          return newState;
      });
  }, [isHost, p2p, gameMode]);

  const handleUpdateStoryBible = useCallback((newBibleText: string) => {
    setGameState(prev => {
        if (!prev) return null;
        const newState = { ...prev, storyBible: newBibleText };
        updateAndBroadcastState(newState);
        return newState;
    });
  }, [isHost, p2p, gameMode]);

  const handleChangeCharacter = useCallback((playerIndex: number, characterIndex: number) => {
    setGameState(prev => {
      if (!prev) return null;
      const updatedPlayers = [...prev.settings.players];
      updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], activeCharacterIndex: characterIndex };
      const newState = { ...prev, settings: { ...prev.settings, players: updatedPlayers }};
      updateAndBroadcastState(newState);
      return newState;
    });
  }, [isHost, p2p, gameMode]);

  const handleExportToFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportBible = useCallback(() => {
    if (gameState) {
      handleExportToFile(gameState.storyBible, "story-bible.txt");
    }
  }, [gameState]);

  const handleExportJournal = useCallback(() => {
    if (gameState) {
      let journalContent = "Brainstorming Journal\n======================\n\n";
      gameState.settings.players.forEach(player => {
        journalContent += `----- ${player.name} -----\n\n`;
        const entries = gameState.brainstormingJournal[player.id] || [];
        if (entries.length > 0) {
          journalContent += entries.join("\n\n---\n\n");
        } else {
          journalContent += "No entries.";
        }
        journalContent += "\n\n";
      });
      handleExportToFile(journalContent, "brainstorming-journal.txt");
    }
  }, [gameState]);


  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center p-10">Loading Chronicle Siege...</div>;
    }
    
    if (!gameState || gameState.status === GameStatus.SETUP) {
      return <GameSetup 
        onGameStart={handleGameStart} 
        gameMode={gameMode}
        participants={participants}
        isHost={isHost}
        />;
    }
    
    if (gameState.status === GameStatus.GAME_OVER) {
        return <GameOverView story={gameState.story} players={gameState.settings.players} />;
    }

    if (gameState.status === GameStatus.INTERMISSION || gameState.status === GameStatus.PAUSED) {
        return <IntermissionView 
            gameState={gameState} 
            onStartTurn={gameState.status === GameStatus.PAUSED ? handleResumeGame : handleStartTurn}
            isPaused={gameState.status === GameStatus.PAUSED}
        />;
    }

    if (gameState.status === GameStatus.SHOP) {
      return <WritersBlockShop 
        players={gameState.settings.players}
        onExit={handleExitShop}
        hostId={gameState.settings.hostId || ''}
      />;
    }
    
    return <GameView 
      gameState={gameState} 
      setGameState={updateAndBroadcastState} 
      onOpenShop={handleOpenShop}
      onThemeChange={handleThemeChange}
      onOpenJournal={() => setShowJournal(true)}
      onBrainstormSubmit={handleBrainstormSubmit}
      onCreateQuest={handleCreateQuest}
      onUpdateStoryBible={handleUpdateStoryBible}
      onPauseGame={handlePauseGame}
      onChangeCharacter={handleChangeCharacter}
      onExportBible={handleExportBible}
      onExportJournal={handleExportJournal}
      discordUser={discordUser}
    />;
  };

  return (
    <div className="min-h-screen">
       {showJournal && gameState && (
        <BrainstormJournalModal 
            journal={gameState.brainstormingJournal} 
            players={gameState.settings.players}
            onClose={() => setShowJournal(false)}
        />
      )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;