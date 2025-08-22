import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Monster, Quest } from '../types';
import { GameStatus } from '../types';
import PlayerHUD from './PlayerHUD';
import MonsterDisplay from './MonsterDisplay';
import { PenIcon, ShopIcon, ShieldIcon, JournalIcon, QuestIcon, PauseIcon, BookOpenIcon, QuestionMarkCircleIcon, SwitchHorizontalIcon, DocumentDownloadIcon, LightbulbIcon, SparklesIcon } from './icons';
import { DIFFICULTY_SETTINGS } from '../constants';
import { generateMonster, generateMonsterImage, getAICritique, getInspirationWord, highlightComplexSentences } from '../services/geminiService';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import LocationView from './LocationView';
import QuestLogModal from './QuestLogModal';
import CreateQuestModal from './CreateQuestModal';
import GameManualModal from './GameManualModal';
import StoryBibleModal from './StoryBibleModal';
import CharacterSwitcherModal from './CharacterSwitcherModal';
import type { User as DiscordUser } from '../types/discord';

interface GameViewProps {
  gameState: GameState;
  setGameState: (state: GameState | null) => void;
  onOpenShop: () => void;
  onThemeChange: (theme: any) => void;
  onOpenJournal: () => void;
  onBrainstormSubmit: (playerId: string, text: string) => void;
  onCreateQuest: (questData: Omit<Quest, 'id' | 'progress' | 'isComplete'>) => void;
  onUpdateStoryBible: (newText: string) => void;
  onPauseGame: () => void;
  onChangeCharacter: (playerIndex: number, characterIndex: number) => void;
  onExportBible: () => void;
  onExportJournal: () => void;
  discordUser: DiscordUser | null;
}

const GameView: React.FC<GameViewProps> = ({ 
    gameState, setGameState, onOpenShop, onThemeChange, onOpenJournal, 
    onBrainstormSubmit, onCreateQuest, onUpdateStoryBible, onPauseGame, onChangeCharacter,
    onExportBible, onExportJournal, discordUser
}) => {
  const [writing, setWriting] = useState('');
  const [brainstormText, setBrainstormText] = useState('');
  const [timer, setTimer] = useState(DIFFICULTY_SETTINGS[gameState.settings.difficulty].timer);
  const [isMonsterSpawning, setIsMonsterSpawning] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '', isHtml: false });
  const [aiCritique, setAiCritique] = useState<{ text: string, isLoading: boolean }>({ text: '', isLoading: false });
  const [feedbackDismissedForTurn, setFeedbackDismissedForTurn] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const storyEndRef = useRef<HTMLDivElement>(null);

  const currentPlayer = gameState.settings.players[gameState.currentPlayerIndex];
  const isMyTurn = gameState.status === GameStatus.PLAYING && (!discordUser || currentPlayer.id === discordUser.id);
  const isHost = !discordUser || gameState.settings.hostId === discordUser.id;

  const activeCharacter = currentPlayer.characters[currentPlayer.activeCharacterIndex];
  const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.settings.players.length) % gameState.settings.players.length;
  const previousPlayer = gameState.settings.players[previousPlayerIndex];
  const difficultySettings = DIFFICULTY_SETTINGS[gameState.settings.difficulty];

  const wordCount = writing.trim().split(/\s+/).filter(Boolean).length;
  
  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setActiveModal(null);
    setIsModalOpen(false);
  };


  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [gameState.story]);
  useEffect(() => { onThemeChange(currentPlayer.theme); }, [currentPlayer.theme, onThemeChange]);

  useEffect(() => {
    if (isMyTurn && gameState.turn > 1 && feedbackDismissedForTurn < gameState.turn && gameState.status === GameStatus.PLAYING) {
        openModal('feedback');
    }
  }, [gameState.turn, feedbackDismissedForTurn, gameState.status, isMyTurn]);

  const advanceTurn = useCallback((moveOnly: boolean = false) => {
    let newStory = gameState.story;
    if (writing.trim() && !moveOnly) {
        newStory += `\n\n${activeCharacter.name || currentPlayer.name} wrote:\n${writing.trim()}`;
    }

    setWriting('');
    setAiCritique({ text: '', isLoading: false });

    let monsterDamage = Math.floor(wordCount * difficultySettings.wordDamageMultiplier);
    let newMonsterState = gameState.monster;
    let newPlayers = [...gameState.settings.players];
    let newLog: string[] = [];
    
    // Coins for writing
    if (!moveOnly) {
        const coinsEarnedForWriting = Math.floor(wordCount / 5);
        if (coinsEarnedForWriting > 0) {
            newLog.push(`${currentPlayer.name} earned ${coinsEarnedForWriting} coins for writing ${wordCount} words.`);
            newPlayers = newPlayers.map(p => 
                p.id === currentPlayer.id ? { ...p, coins: p.coins + coinsEarnedForWriting } : p
            );
        }
    }

    const isPlayerAtMonsterLocation = newMonsterState && gameState.playerPositions[currentPlayer.id] === newMonsterState.locationId;

    // Player attacks monster
    if (newMonsterState && monsterDamage > 0 && isPlayerAtMonsterLocation && !moveOnly) {
        const newHp = Math.max(0, newMonsterState.currentHp - monsterDamage);
        newMonsterState = { ...newMonsterState, currentHp: newHp };
        newLog.push(`${currentPlayer.name} dealt ${monsterDamage} damage to ${newMonsterState.name}!`);
        if (newHp === 0) {
            setModalContent({ title: 'Victory!', body: `You defeated ${newMonsterState.name}! You earned 50 coins and 100 XP.`, isHtml: false });
            setShowModal(true);
            newPlayers = newPlayers.map(p => ({
                ...p,
                coins: p.coins + 50,
                experience: p.experience + 100,
            }));
            newMonsterState = null;
        }
    }

    // Monster attacks player
    if (newMonsterState && isPlayerAtMonsterLocation) {
        let playerToUpdate = newPlayers.find(p => p.id === currentPlayer.id)!;
        const dodged = wordCount >= difficultySettings.dodgeWordCount && !moveOnly;

        if (dodged) {
            newLog.push(`${currentPlayer.name} dodged the attack from ${newMonsterState.name}!`);
        } else {
            playerToUpdate.hearts = Math.max(0, playerToUpdate.hearts - 1);
            if (wordCount === 0 && !moveOnly) {
                newLog.push(`${currentPlayer.name} passed their turn and lost a heart!`);
            } else {
                newLog.push(`${newMonsterState.name} attacks! ${currentPlayer.name} loses a heart.`);
            }
            newPlayers = newPlayers.map(p => p.id === currentPlayer.id ? playerToUpdate : p);
        }
        
        const allPlayersDefeated = newPlayers.every(p => p.hearts === 0);
        if (allPlayersDefeated) {
             setModalContent({ title: 'Party Defeated!', body: `Your party has fallen.`, isHtml: false });
             setShowModal(true);
             setTimeout(() => {
                if (gameState) {
                    setGameState({ ...gameState, status: GameStatus.GAME_OVER, settings: {...gameState.settings, players: newPlayers}} );
                }
             }, 2000);
             return; // Stop further processing
        }
    }
    
    // Auto-use Health Potion if applicable
    let playerAfterCombat = newPlayers.find(p => p.id === currentPlayer.id)!;
    if (playerAfterCombat.hearts < playerAfterCombat.maxHearts && !moveOnly) {
        const potionIndex = playerAfterCombat.inventory.findIndex(item => item.id === 's4' && item.uses && item.uses > 0);
        if (potionIndex !== -1) {
            playerAfterCombat.hearts = Math.min(playerAfterCombat.maxHearts, playerAfterCombat.hearts + 1);
            const potion = { ...playerAfterCombat.inventory[potionIndex] };
            potion.uses! -= 1;
            
            if (potion.uses! <= 0) {
                playerAfterCombat.inventory.splice(potionIndex, 1);
                newLog.push(`${currentPlayer.name} used the last dose of a Health Potion and recovered a heart!`);
            } else {
                playerAfterCombat.inventory[potionIndex] = potion;
                newLog.push(`${currentPlayer.name} used a Health Potion and recovered a heart! ${potion.uses} doses left.`);
            }
            newPlayers = newPlayers.map(p => p.id === currentPlayer.id ? playerAfterCombat : p);
        }
    }

    let newQuests = [...gameState.quests];
    // Update Quests
    if (wordCount > 0 && !moveOnly) {
        newQuests = newQuests.map(quest => {
            if (quest.isComplete || (quest.assigneeId !== 'all' && quest.assigneeId !== currentPlayer.id)) {
                return quest;
            }

            const currentProgress = quest.progress[currentPlayer.id] || 0;
            const newProgress = currentProgress + wordCount;
            const updatedQuest = { ...quest, progress: { ...quest.progress, [currentPlayer.id]: newProgress } };

            if (updatedQuest.targetWordCount && newProgress >= updatedQuest.targetWordCount) {
                updatedQuest.isComplete = true; // For now, single player completion is enough. Could be adapted for group quests.
                newLog.push(`Quest Complete: "${quest.title}"! ${currentPlayer.name} earns ${quest.rewardCoins} coins and ${quest.rewardXp} XP.`);
                newPlayers = newPlayers.map(p => {
                    if (p.id === currentPlayer.id) {
                        return { ...p, coins: p.coins + quest.rewardCoins, experience: p.experience + quest.rewardXp };
                    }
                    return p;
                });
            }
            return updatedQuest;
        });
    }

    // Check for story end condition
    if (gameState.settings.storyLengthWords && newStory.split(/\s+/).length >= gameState.settings.storyLengthWords) {
        if (gameState) {
            setGameState({ ...gameState, story: newStory, status: GameStatus.GAME_OVER });
        }
        return;
    }


    setBattleLog(prev => [...newLog, ...prev].slice(0, 5));
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.settings.players.length;

    setGameState({
      ...gameState,
      status: GameStatus.INTERMISSION,
      story: newStory,
      currentPlayerIndex: nextPlayerIndex,
      turn: nextPlayerIndex === 0 ? gameState.turn + 1 : gameState.turn,
      monster: newMonsterState,
      settings: { ...gameState.settings, players: newPlayers },
      quests: newQuests,
    });
  }, [writing, gameState, setGameState, currentPlayer, activeCharacter, difficultySettings, wordCount]);
  
  const handleTimeout = useCallback(() => {
    let newPlayers = [...gameState.settings.players];
    let newLog: string[] = [];

    const playerToUpdate = newPlayers.find(p => p.id === currentPlayer.id)!;
    playerToUpdate.hearts = Math.max(0, playerToUpdate.hearts - 1);
    newLog.push(`${currentPlayer.name} ran out of time and lost a heart!`);
    newPlayers = newPlayers.map(p => p.id === currentPlayer.id ? playerToUpdate : p);
    
    setWriting('');
    setAiCritique({ text: '', isLoading: false });

    const allPlayersDefeated = newPlayers.every(p => p.hearts === 0);
    if (allPlayersDefeated) {
         setModalContent({ title: 'Party Defeated!', body: `Your party has fallen.`, isHtml: false });
         setShowModal(true);
         setTimeout(() => {
            if (gameState) {
                setGameState({ ...gameState, status: GameStatus.GAME_OVER, settings: { ...gameState.settings, players: newPlayers } });
            }
         }, 2000);
         return;
    }

    setBattleLog(prev => [...newLog, ...prev].slice(0, 5));
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.settings.players.length;

    setGameState({
      ...gameState,
      status: GameStatus.INTERMISSION,
      currentPlayerIndex: nextPlayerIndex,
      turn: nextPlayerIndex === 0 ? gameState.turn + 1 : gameState.turn,
      settings: { ...gameState.settings, players: newPlayers },
    });
}, [gameState, setGameState, currentPlayer]);

  useEffect(() => {
      setTimer(difficultySettings.timer);
  }, [gameState.currentPlayerIndex, difficultySettings.timer]);

  const isPlayerAtMonsterLocation = gameState.monster && gameState.playerPositions[currentPlayer.id] === gameState.monster.locationId;
  const isAnyPlayerAtMonsterLocation = gameState.monster && gameState.settings.players.some(p => gameState.playerPositions[p.id] === gameState.monster?.locationId);

  useEffect(() => {
    if (!isMyTurn || gameState.status !== GameStatus.PLAYING || isModalOpen || !isPlayerAtMonsterLocation) return;
    
    const interval = setInterval(() => {
      setTimer(t => {
        if (t > 1) return t - 1;
        handleTimeout();
        return difficultySettings.timer;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [handleTimeout, difficultySettings.timer, gameState.status, isModalOpen, isPlayerAtMonsterLocation, isMyTurn]);

  const handleSpawnMonster = useCallback(async () => {
    if (isMonsterSpawning) return;
    setIsMonsterSpawning(true);
    setBattleLog(prev => ["A strange presence is coalescing...", ...prev]);
    try {
        const monsterData = await generateMonster(gameState.story);
        const imageUrl = await generateMonsterImage(monsterData.description);
        const newMonster: Monster = {
            ...monsterData,
            maxHp: Math.floor(monsterData.maxHp * difficultySettings.monsterHpMultiplier),
            currentHp: Math.floor(monsterData.maxHp * difficultySettings.monsterHpMultiplier),
            imageUrl: imageUrl,
            locationId: gameState.playerPositions[gameState.settings.hostId!],
        };
        setGameState({ ...gameState, monster: newMonster });
        setBattleLog(prev => [`A wild ${newMonster.name} appears at ${gameState.settings.locations.find(l => l.id === newMonster.locationId)?.name}!`, ...prev].slice(0,5));
    } catch (error) {
        console.error("Failed to spawn monster:", error);
    } finally {
        setIsMonsterSpawning(false);
    }
  }, [gameState, setGameState, isMonsterSpawning, difficultySettings.monsterHpMultiplier]);

  useEffect(() => {
    if(isHost && gameState.turn > 3 && gameState.turn % 5 === 0 && !gameState.monster && !isMonsterSpawning){
        handleSpawnMonster();
    }
  }, [gameState.turn, gameState.monster, isMonsterSpawning, isHost, handleSpawnMonster]);

  const handleGetCritique = async () => {
    setAiCritique({ text: '', isLoading: true });
    const critiqueText = await getAICritique(writing);
    setAiCritique({ text: critiqueText, isLoading: false });
  };
  
  const handleDonate = (fromId: string, toId: string, amount: number) => {
    const newPlayers = gameState.settings.players.map(p => {
        if (p.id === fromId) return { ...p, coins: p.coins - amount };
        if (p.id === toId) return { ...p, coins: p.coins + amount };
        return p;
    });
    setGameState({ ...gameState, settings: { ...gameState.settings, players: newPlayers }});
  };

  const handleFeedbackSubmit = (feedback: string, rating: number) => {
    const newPlayers = gameState.settings.players.map(p => {
        if (p.id === previousPlayer.id) {
            const newFeedback = {
                fromPlayerId: currentPlayer.id,
                fromPlayerName: currentPlayer.name,
                text: feedback,
                rating,
            };
            return { ...p, feedback: [...(p.feedback || []), newFeedback] };
        }
        return p;
    });
    setGameState({ ...gameState, settings: { ...gameState.settings, players: newPlayers }});
    closeModal();
    setFeedbackDismissedForTurn(gameState.turn);
  };
    
  const handleMovePlayer = (newLocationId: string) => {
    if (isPlayerAtMonsterLocation) {
        const monsterLocation = gameState.settings.locations.find(l => l.id === gameState.monster!.locationId);
        const canEscape = monsterLocation!.connections.includes(newLocationId);
        
        if (canEscape) {
            const newLocationName = gameState.settings.locations.find(l => l.id === newLocationId)?.name || 'an unknown place';
            setBattleLog(prev => [`${currentPlayer.name} escapes to ${newLocationName}!`, ...prev].slice(0,5));
            
            const newPlayerPositions = { ...gameState.playerPositions, [currentPlayer.id]: newLocationId };
            const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.settings.players.length;
            setGameState({
                ...gameState,
                status: GameStatus.INTERMISSION,
                currentPlayerIndex: nextPlayerIndex,
                turn: nextPlayerIndex === 0 ? gameState.turn + 1 : gameState.turn,
                playerPositions: newPlayerPositions,
            });
        } else {
            setBattleLog(prev => [`${currentPlayer.name} tries to escape, but is blocked!`, ...prev].slice(0,5));
        }
    } else {
        const newPlayerPositions = { ...gameState.playerPositions, [currentPlayer.id]: newLocationId };
        setGameState({ ...gameState, playerPositions: newPlayerPositions });
    }
};

    const handleBrainstorm = () => {
        if (brainstormText.trim()) {
            onBrainstormSubmit(currentPlayer.id, brainstormText);
            setBrainstormText('');
        }
    };
    
    const handleGetInspiration = async () => {
        const word = await getInspirationWord(gameState.story);
        setModalContent({ title: 'Inspiration Spark', body: `Your word is: <strong class="text-2xl text-primary">${word}</strong>`, isHtml: true });
        setShowModal(true);
    };

    const handleHighlightSentences = async () => {
        const entries = gameState.story.split(/\n\n.* wrote:\n/);
        const lastEntry = entries[entries.length - 1];
        if (!lastEntry || !lastEntry.trim()) {
            setModalContent({ title: 'Word Weave', body: 'Not enough text from the previous turn to analyze.', isHtml: false });
            setShowModal(true);
            return;
        }

        const highlightedText = await highlightComplexSentences(lastEntry);
        const formattedHtml = highlightedText
            .replace(/{{highlight}}/g, '<mark class="bg-secondary/30 text-text-main">')
            .replace(/{{\/highlight}}/g, '</mark>');
        
        setModalContent({ title: 'Word Weave Analysis', body: formattedHtml, isHtml: true });
        setShowModal(true);
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
       {showModal && (
        <Modal title={modalContent.title} onClose={() => setShowModal(false)}>
          {modalContent.isHtml ? <div dangerouslySetInnerHTML={{ __html: modalContent.body }} /> : modalContent.body}
        </Modal>
       )}
       
       {isModalOpen && activeModal === 'feedback' && (
        <FeedbackModal 
          fromPlayer={currentPlayer}
          toPlayer={previousPlayer}
          onClose={() => {
            closeModal();
            setFeedbackDismissedForTurn(gameState.turn);
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
      {isModalOpen && activeModal === 'questLog' && (
        <QuestLogModal 
            quests={gameState.quests}
            players={gameState.settings.players}
            currentPlayerId={currentPlayer.id}
            onClose={closeModal}
        />
      )}
      {isModalOpen && activeModal === 'createQuest' && (
        <CreateQuestModal
            players={gameState.settings.players}
            onCreateQuest={(questData) => {
                onCreateQuest(questData);
                closeModal();
            }}
            onClose={closeModal}
        />
      )}
      {isModalOpen && activeModal === 'manual' && <GameManualModal onClose={closeModal} />}
      {isModalOpen && activeModal === 'bible' && (
          <StoryBibleModal 
            storyBible={gameState.storyBible}
            isHost={isHost}
            onSave={onUpdateStoryBible}
            onClose={closeModal}
          />
      )}
      {isModalOpen && activeModal === 'characterSwitcher' && (
          <CharacterSwitcherModal
            player={currentPlayer}
            onSwitch={(charIndex) => onChangeCharacter(gameState.currentPlayerIndex, charIndex)}
            onClose={closeModal}
          />
      )}
      {/* Left Column: Story */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-surface p-6 rounded-lg shadow-lg h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b-2 border-primary pb-2 mb-4">
            <h2 className="text-2xl font-bold font-serif">The Chronicle</h2>
            <div className="flex items-center gap-2">
                <button onClick={() => openModal('bible')} title="Story Bible" className="text-text-secondary hover:text-primary transition-colors"><BookOpenIcon className="w-6 h-6"/></button>
                <button onClick={onPauseGame} title="Pause Game" className="text-text-secondary hover:text-primary transition-colors" disabled={!isHost}><PauseIcon className="w-6 h-6"/></button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none text-text-secondary font-serif leading-loose whitespace-pre-wrap">
            {gameState.story}
            <div ref={storyEndRef} />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-primary">
                Your Turn: {currentPlayer.name} (as {activeCharacter.name})
              </h3>
               <button onClick={() => openModal('characterSwitcher')} title="Switch Character" className="text-text-secondary hover:text-primary transition-colors" disabled={!isMyTurn}><SwitchHorizontalIcon className="w-5 h-5"/></button>
            </div>
            <button onClick={() => openModal('manual')} title="Game Manual" className="text-text-secondary hover:text-primary transition-colors"><QuestionMarkCircleIcon className="w-6 h-6"/></button>
          </div>
          <textarea
            className="w-full h-40 p-4 bg-background border border-gray-600 rounded-lg text-lg font-serif focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isMyTurn ? (isPlayerAtMonsterLocation ? 'Write to attack, or move to escape!' : 'Continue the story...') : 'Waiting for your turn...'}
            value={writing}
            onChange={(e) => setWriting(e.target.value)}
            disabled={!isMyTurn}
          />
          <div className="flex justify-between items-center mt-2 text-text-secondary">
            <div className="flex items-center gap-2">
               {currentPlayer.inventory.some(item => item.id === 's1') && (
                  <button onClick={handleGetInspiration} disabled={!isMyTurn} className="bg-yellow-600 text-white font-bold text-sm py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:bg-gray-500"><LightbulbIcon className="w-4 h-4" /> Inspire</button>
               )}
               {currentPlayer.inventory.some(item => item.id === 's2') && (
                  <button onClick={handleHighlightSentences} disabled={!isMyTurn} className="bg-cyan-600 text-white font-bold text-sm py-2 px-3 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:bg-gray-500"><SparklesIcon className="w-4 h-4" /> Analyze</button>
               )}
              {currentPlayer.inventory.some(item => item.id === 's3') && (
                  <button
                      onClick={handleGetCritique}
                      disabled={!isMyTurn || aiCritique.isLoading}
                      className="bg-blue-600 text-white font-bold text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-500"
                  >
                    <ShieldIcon className="w-4 h-4" />
                    {aiCritique.isLoading ? "Thinking..." : "Critique"}
                  </button>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <span>Word Count: {wordCount}</span>
              <button
                  onClick={() => advanceTurn(false)}
                  disabled={!isMyTurn}
                  className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                  <PenIcon className="w-5 h-5"/>
                  Submit
              </button>
            </div>
          </div>
          {aiCritique.text && (
            <div className="mt-2 p-3 bg-background rounded-lg border border-blue-500 animate-fade-in">
                <h4 className="font-semibold text-blue-400">Editor's Eye Feedback:</h4>
                <p className="text-sm italic mt-1 whitespace-pre-wrap">{aiCritique.text}</p>
            </div>
          )}
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-secondary">Brainstorming Pad</h3>
            <textarea
                className="w-full h-24 p-2 bg-background border border-gray-600 rounded-lg text-sm font-serif focus:ring-2 focus:ring-blue-500"
                placeholder="Jot down ideas here... (1 coin per 10 words)"
                value={brainstormText}
                onChange={(e) => setBrainstormText(e.target.value)}
            />
            <div className="text-right mt-2">
                <button onClick={handleBrainstorm} className="bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Submit to Journal
                </button>
            </div>
        </div>
      </div>

      {/* Right Column: Game Info */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-surface p-4 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold">Turn {gameState.turn}</p>
            {isPlayerAtMonsterLocation ? (
                <>
                    <p className="text-4xl font-bold text-primary animate-pulse-fast">{timer}</p>
                    <p className="text-text-secondary">seconds remaining</p>
                </>
            ) : (
                <>
                    <p className="text-4xl font-bold text-primary">-:--</p>
                    <p className="text-text-secondary">{isAnyPlayerAtMonsterLocation ? "A battle rages elsewhere!" : "No threats detected"}</p>
                </>
            )}
        </div>
        
        <PlayerHUD players={gameState.settings.players} currentPlayerId={currentPlayer.id} onDonate={handleDonate} />
        
        <LocationView 
            locations={gameState.settings.locations}
            players={gameState.settings.players}
            playerPositions={gameState.playerPositions}
            currentPlayerId={currentPlayer.id}
            onMove={handleMovePlayer}
            isMyTurn={isMyTurn}
        />
        
        {isPlayerAtMonsterLocation ? (
          <MonsterDisplay monster={gameState.monster!} />
        ) : (
          <div className="bg-surface p-4 rounded-lg shadow-lg text-center">
            <p className="text-text-secondary">The air is calm... for now.</p>
            {gameState.monster && <p className="text-xs italic text-red-400">A monster lurks at {gameState.settings.locations.find(l => l.id === gameState.monster?.locationId)?.name}!</p>}
          </div>
        )}

        <div className="bg-surface p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-secondary">Battle Log</h3>
            <ul className="text-sm text-text-secondary space-y-1">
                {battleLog.map((log, i) => <li key={i} className="opacity-75">{log}</li>)}
            </ul>
        </div>
        
        <div className="bg-surface p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-secondary">Player Actions</h3>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => openModal('questLog')} className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                        <QuestIcon className="w-6 h-6" />
                        Quests
                    </button>
                    <button onClick={onOpenJournal} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <JournalIcon className="w-6 h-6" />
                        Journal
                    </button>
                    <button onClick={onExportBible} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        <DocumentDownloadIcon className="w-6 h-6" />
                        Export Bible
                    </button>
                    <button onClick={onExportJournal} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                        <DocumentDownloadIcon className="w-6 h-6" />
                        Export Journal
                    </button>
                </div>
                <button onClick={onOpenShop} className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors">
                    <ShopIcon className="w-6 h-6" />
                    Shop
                </button>
            </div>
        </div>

        {isHost && (
             <div className="bg-surface p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3 text-primary">Host Actions</h3>
                <div className="space-y-2">
                    <button onClick={() => openModal('createQuest')} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Create Quest
                    </button>
                    {!gameState.monster && (
                        <button onClick={handleSpawnMonster} disabled={isMonsterSpawning} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors">
                            {isMonsterSpawning ? 'Summoning...' : 'Summon Monster'}
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameView;