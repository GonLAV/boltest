import React from 'react';

type ColorPickerProps = {
  type: 'text' | 'background';
  colors: Record<string, string>;
  onColorSelect: (color: string) => void;
  position: { top: number; left: number; placement: 'above' | 'below' } | null;
  pickerRef: React.RefObject<HTMLDivElement>;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  type,
  colors,
  onColorSelect,
  position,
  pickerRef
}) => {
  return (
    <div
      ref={pickerRef}
      className={`re-picker-wrapper re-picker-fixed ${position?.placement === 'above' ? 'place-above' : 'place-below'}`}
    >
      <div className="re-picker">
        <div className="re-picker-grid">
          {type === 'background' && (
            <button
              className="re-swatch re-swatch-clear"
              onClick={() => onColorSelect('transparent')}
              title="Clear highlight"
            />
          )}
          {Object.entries(colors).map(([color, swatchClass]) => (
            <button
              key={color}
              className={`re-swatch ${swatchClass}`}
              onClick={() => onColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
