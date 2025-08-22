import React from 'react';
import type { Location, Player } from '../types';
import { MoveIcon } from './icons';

interface LocationViewProps {
    locations: Location[];
    players: Player[];
    playerPositions: Record<string, string>;
    currentPlayerId: string;
    onMove: (newLocationId: string) => void;
    isMyTurn: boolean;
}

const LocationView: React.FC<LocationViewProps> = ({ locations, players, playerPositions, currentPlayerId, onMove, isMyTurn }) => {
    const currentPlayerPosId = playerPositions[currentPlayerId];
    const currentLocation = locations.find(loc => loc.id === currentPlayerPosId);

    if (!currentLocation) {
        return (
            <div className="bg-surface p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-secondary">Current Location</h3>
                <p className="text-text-secondary">Lost in the ether...</p>
            </div>
        );
    }
    
    const playersAtCurrentLocation = players.filter(p => playerPositions[p.id] === currentLocation.id);
    const connectedLocations = currentLocation.connections
        .map(connId => locations.find(loc => loc.id === connId))
        .filter((loc): loc is Location => !!loc);

    return (
        <div className="bg-surface p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-1 text-secondary">Current Location</h3>
            <p className="text-2xl font-bold font-serif text-primary">{currentLocation.name}</p>
            <p className="text-xs text-text-secondary italic mb-3">
                Also here: {playersAtCurrentLocation.map(p => p.name).join(', ')}
            </p>

            <div className="mt-4">
                <h4 className="font-semibold text-text-main mb-2">Travel Options:</h4>
                <div className="flex flex-col gap-2">
                    {connectedLocations.length > 0 ? (
                        connectedLocations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => onMove(loc.id)}
                                className="w-full text-left flex items-center justify-between gap-2 p-2 bg-background hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background"
                                disabled={!isMyTurn}
                            >
                                <span>{loc.name}</span>
                                <MoveIcon className="w-5 h-5 text-primary" />
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary italic">You see no other paths from here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationView;
