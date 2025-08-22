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
            <div className="card">
                <h3 className="sidebar-section-header">Current Location</h3>
                <p style={{color: 'var(--color-text-secondary)'}}>Lost in the ether...</p>
            </div>
        );
    }
    
    const playersAtCurrentLocation = players.filter(p => playerPositions[p.id] === currentLocation.id);
    const connectedLocations = currentLocation.connections
        .map(connId => locations.find(loc => loc.id === connId))
        .filter((loc): loc is Location => !!loc);

    return (
        <div className="card">
            <h3 className="sidebar-section-header" style={{marginBottom: '0.25rem'}}>Current Location</h3>
            <p className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>{currentLocation.name}</p>
            <p style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '0.75rem'}}>
                Also here: {playersAtCurrentLocation.map(p => p.name).join(', ')}
            </p>

            <div style={{marginTop: '1rem'}}>
                <h4 style={{fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem'}}>Travel Options:</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {connectedLocations.length > 0 ? (
                        connectedLocations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => onMove(loc.id)}
                                disabled={!isMyTurn}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-background)',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-main)'
                                }}
                            >
                                <span>{loc.name}</span>
                                <MoveIcon className="w-5 h-5" style={{color: 'var(--color-primary)'}} />
                            </button>
                        ))
                    ) : (
                        <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic'}}>You see no other paths from here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationView;