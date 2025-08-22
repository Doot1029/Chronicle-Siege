
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
        <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button key={i} onClick={() => setRating(ratingValue)} className="focus:outline-none">
                        <StarIcon 
                            className={`w-8 h-8 cursor-pointer transition-colors ${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-500'}`} 
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 animate-slide-in border-2 border-secondary">
                <h2 className="text-2xl font-bold text-center mb-2 text-secondary font-serif">Give Feedback</h2>
                <p className="text-center text-text-secondary mb-4">Your feedback for <span className="font-semibold text-primary">{toPlayer.name}'s</span> last turn:</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Rating</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <label htmlFor="feedback-text" className="block text-sm font-medium text-text-secondary mb-1">Feedback</label>
                        <textarea
                            id="feedback-text"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            className="w-full h-24 p-2 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="Be specific and helpful..."
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>
                
                <div className="flex items-center justify-between mt-6">
                    <button onClick={onClose} className="text-sm text-text-secondary hover:text-white transition">Skip</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 disabled:bg-gray-500 transition-colors"
                    >
                        {isLoading ? 'Checking...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
