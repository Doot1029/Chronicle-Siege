import React, { useState } from 'react';
import { BookOpenIcon } from './icons';

interface StoryBibleModalProps {
  storyBible: string;
  isHost: boolean;
  onSave: (newText: string) => void;
  onClose: () => void;
}

const StoryBibleModal: React.FC<StoryBibleModalProps> = ({ storyBible, isHost, onSave, onClose }) => {
    const [editText, setEditText] = useState(storyBible);

    const handleSave = () => {
        onSave(editText);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 animate-slide-in border-2 border-blue-500 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-blue-400 font-serif flex items-center gap-2">
                        <BookOpenIcon className="w-7 h-7" />
                        Story Bible
                    </h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {isHost ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full h-full p-3 bg-background border border-gray-600 rounded-lg text-base font-serif focus:ring-2 focus:ring-blue-500"
                            placeholder="Add lore, character details, world rules..."
                        />
                    ) : (
                        <div className="prose prose-invert max-w-none text-text-secondary font-serif leading-relaxed whitespace-pre-wrap">
                            {storyBible}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={onClose} className="text-sm text-text-secondary hover:text-white transition py-2 px-4">Close</button>
                    {isHost && (
                        <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Save & Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryBibleModal;
