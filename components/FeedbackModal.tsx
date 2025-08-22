
import React, { useState } from 'react';
import type { Player } from '../types';
import { isFeedbackConstructive } from '../services/geminiService';
import { StarIcon } from './icons';

interface FeedbackModalProps {
  fromPlayer: Player;
  toPlayer: Player;
  onClose: () => void;
  onSubmit: (feedback: string, rating: number) => void;
}

const StarRatingInput: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button key={i} onClick={() => setRating(ratingValue)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>
                        <StarIcon 
                            className="w-8 h-8"
                            style={{color: ratingValue <= rating ? '#FBBF24' : '#4B5563', transition: 'color 0.2s'}}
                            filled={ratingValue <= rating}
                        />
                    </button>
                );
            })}
        </div>
    );
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ fromPlayer, toPlayer, onClose, onSubmit }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!feedback.trim() || rating === 0) {
            setError("Feedback text and a star rating are required.");
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await isFeedbackConstructive(feedback);
        if (result.isConstructive) {
            onSubmit(feedback, rating);
        } else {
            setError(`AI Moderator: This feedback may not be constructive. Reason: ${result.reason}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content size-md" style={{borderColor: 'var(--color-secondary)'}}>
                <h2 className="font-serif" style={{fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-secondary)'}}>Give Feedback</h2>
                <p style={{textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}>Your feedback for <span style={{fontWeight: 600, color: 'var(--color-primary)'}}>{toPlayer.name}'s</span> last turn:</p>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div>
                        <label className="form-label" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>Rating</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <label htmlFor="feedback-text" className="form-label" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>Feedback</label>
                        <textarea
                            id="feedback-text"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            className="form-textarea"
                            style={{height: '6rem'}}
                            placeholder="Be specific and helpful..."
                        />
                    </div>
                    {error && <p style={{color: '#F87171', fontSize: '0.875rem', textAlign: 'center'}}>{error}</p>}
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem'}}>
                    <button onClick={onClose} style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer'}}>Skip</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn btn-secondary"
                        style={{width: 'auto'}}
                    >
                        {isLoading ? 'Checking...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;