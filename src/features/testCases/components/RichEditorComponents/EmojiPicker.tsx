import React from 'react';

type EmojiPickerProps = {
  emojis: string[];
  onEmojiSelect: (emoji: string) => void;
  position: { top: number; left: number; placement: 'above' | 'below' } | null;
  pickerRef: React.RefObject<HTMLDivElement>;
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  emojis,
  onEmojiSelect,
  position,
  pickerRef
}) => {
  return (
    <div
      ref={pickerRef}
      className={`re-picker-wrapper re-picker-fixed ${position?.placement === 'above' ? 'place-above' : 'place-below'}`}
    >
      <div className="re-emoji-picker">
        <div className="re-emoji-grid">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              className="re-emoji-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onEmojiSelect(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
