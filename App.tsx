
import React, { useState, useCallback, useEffect } from 'react';
import type { GameState, GameSettings, Player, Theme, Quest, DiscordParticipant } from './types';
import { GameStatus } from './types';
import GameSetup from './components/GameSetup';
import GameView from './components/GameView';
import WritersBlockShop from './components/WritersBlockShop';
import { THEMES } from './constants';
import BrainstormJournalModal from './components/BrainstormJournalModal';
import GameOverView from './components/GameOverView';
import IntermissionView from './components/IntermissionView';
import { DiscordSDK, Events } from '@discord/embedded-app-sdk';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  const [showJournal, setShowJournal] = useState(false);
  const [isDiscord, setIsDiscord] = useState(false);
  const [participants, setParticipants] = useState<DiscordParticipant[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);

  useEffect(() => {
    const setupDiscord = async () => {
      // DISCORD_CLIENT_ID must be set in the environment variables for this to work.
      const clientId = process.env.DISCORD_CLIENT_ID;
      if (!clientId) {
          console.log("DISCORD_CLIENT_ID not set, running in offline mode.");
          return;
      }

      try {
          const discordSdk = new DiscordSDK(clientId);
          await discordSdk.ready();
          setIsDiscord(true);
          
          const initialParticipants = await discordSdk.commands.getInstanceConnectedParticipants();
          
          const formatParticipants = (participants: any[]): DiscordParticipant[] => {
            return participants.map(p => ({
              id: p.id,
              username: p.username,
              discriminator: p.discriminator,
              global_name: p.global_name,
              avatar: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(p.discriminator) % 5}.png`
            }));
          }
          
          const formattedParticipants = formatParticipants(initialParticipants);
          setParticipants(formattedParticipants);

          if (formattedParticipants.length > 0) {
              // Assumption: The first participant is the host/instance owner.
              // A full OAuth flow is needed for a more robust host identification.
              setHostId(formattedParticipants[0].id);
          }

          discordSdk.subscribe(Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE, () => {
              discordSdk.commands.getInstanceConnectedParticipants().then(updatedParticipants => {
                   setParticipants(formatParticipants(updatedParticipants));
              });
          });
      } catch (e) {
          console.error("Failed to connect to Discord SDK:", e);
      }
    };
    setupDiscord();
  }, []);

  useEffect(() => {
    const body = document.body;
    THEMES.forEach(theme => {
      body.classList.remove(theme.className);
    });
    body.classList.add(activeTheme.className);
  }, [activeTheme]);

  const handleGameStart = useCallback((settings: GameSettings) => {
    let initialPlayers: Player[];

    if (isDiscord) {
        initialPlayers = participants.map((p, index) => ({
            id: p.id,
            name: p.global_name || p.username,
            hearts: 3,
            maxHearts: 3,
            coins: 0,
            level: 1,
            experience: 0,
            inventory: [],
            theme: THEMES[0],
            feedback: [],
            characters: settings.initialCharacters[p.global_name || p.username] || [{ name: `Character ${index + 1}`, bio: '' }],
            activeCharacterIndex: 0,
            rebirthPoints: 0,
        }));
    } else {
        initialPlayers = settings.playerNames.map((name, index) => ({
          id: `p${index + 1}`,
          name: name || `Player ${index + 1}`,
          hearts: 3,
          maxHearts: 3,
          coins: 0,
          level: 1,
          experience: 0,
          inventory: [],
          theme: THEMES[0],
          feedback: [],
          characters: settings.initialCharacters[name || `Player ${index + 1}`] || [{ name: `Character ${index + 1}`, bio: '' }],
          activeCharacterIndex: 0,
          rebirthPoints: 0,
        }));
    }
    
    const startingLocationId = settings.locations.length > 0 ? settings.locations[0].id : '';
    const playerPositions = initialPlayers.reduce((acc, player) => {
        acc[player.id] = startingLocationId;
        return acc;
    }, {} as Record<string, string>);

    const brainstormingJournal = initialPlayers.reduce((acc, player) => {
        acc[player.id] = [];
        return acc;
    }, {} as Record<string, string[]>);
    
    setGameState({
      status: GameStatus.INTERMISSION,
      settings: { ...settings, players: initialPlayers },
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
      hostId: hostId,
    });
  }, [isDiscord, participants, hostId]);

  const handleOpenShop = useCallback(() => {
    if (gameState) {
      setGameState({ ...gameState, status: GameStatus.SHOP });
    }
  }, [gameState]);

  const handleExitShop = useCallback((updatedPlayers: Player[]) => {
    if (gameState) {
        setGameState({ 
            ...gameState, 
            status: GameStatus.PLAYING,
            settings: { ...gameState.settings, players: updatedPlayers }
        });
    }
  }, [gameState]);
  
  const handleStartTurn = useCallback(() => {
    if (!gameState) return;
    setGameState({ ...gameState, status: GameStatus.PLAYING });
  }, [gameState]);
  
  const handlePauseGame = useCallback(() => {
      if (!gameState) return;
      setGameState({ ...gameState, status: GameStatus.PAUSED });
  }, [gameState]);

  const handleResumeGame = useCallback(() => {
      if (!gameState) return;
      setGameState({ ...gameState, status: GameStatus.PLAYING });
  }, [gameState]);

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
          setGameState(newState);
          return newState; // for local update
      });
  }, []);

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
          setGameState(newState);
          return newState;
      });
  }, []);

  const handleUpdateStoryBible = useCallback((newBibleText: string) => {
    setGameState(prev => {
        if (!prev) return null;
        const newState = { ...prev, storyBible: newBibleText };
        setGameState(newState);
        return newState;
    });
  }, []);

  const handleChangeCharacter = useCallback((playerIndex: number, characterIndex: number) => {
    setGameState(prev => {
      if (!prev) return null;
      const updatedPlayers = [...prev.settings.players];
      updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], activeCharacterIndex: characterIndex };
      const newState = { ...prev, settings: { ...prev.settings, players: updatedPlayers }};
      setGameState(newState);
      return newState;
    });
  }, []);

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
    if (!gameState || gameState.status === GameStatus.SETUP) {
      return <GameSetup 
        onGameStart={handleGameStart} 
        isDiscord={isDiscord}
        participants={participants}
        hostId={hostId}
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
      />;
    }
    
    return <GameView 
      gameState={gameState} 
      setGameState={setGameState} 
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
    />;
  };

  return (
    <div>
       {showJournal && gameState && (
        <BrainstormJournalModal 
            journal={gameState.brainstormingJournal} 
            players={gameState.settings.players}
            onClose={() => setShowJournal(false)}
        />
      )}
      <main className="container font-sans">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;