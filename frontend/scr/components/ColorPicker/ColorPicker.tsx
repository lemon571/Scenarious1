import React, { useMemo, useState } from 'react';
import { Button, Popover } from '@gravity-ui/uikit';
import styles from './ColorPicker.module.css';
import { useAnimationOnChange } from '../../hooks/useAnimationOnChange';

export type Color = {
  id: string;
  title: string;
  content: string; // any valid CSS color
};

const DEFAULT_COLORS: Color[] = [
  { id: 'slate', title: 'Серый', content: '#93A6B8' },
  { id: 'pink', title: 'Розовый', content: '#F8A7B6' },
  { id: 'amber', title: 'Жёлтый', content: '#F8C978' },
  { id: 'mint', title: 'Мятный', content: '#BCEAD6' },
  { id: 'sky', title: 'Голубой', content: '#A7CBFF' },
  { id: 'zinc', title: 'Туман', content: '#D4DAE0' },
  { id: 'lavender', title: 'Лаванда', content: '#D7C9F8' },
];

interface ColorPickerProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  colors?: Color[];
  className?: string;
  disabled?: boolean;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    { selectedColor, setSelectedColor, colors = DEFAULT_COLORS, className, disabled = false },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const inputRef = useAnimationOnChange<typeof selectedColor, HTMLDivElement>(selectedColor);

    const selectedCss = useMemo(() => selectedColor?.content, [selectedColor]);

    const onPick = (c: Color) => {
      if (disabled) return;
      setSelectedColor(c);
      setOpen(false);
    };

    return (
      <div ref={ref} className={`${styles.wrapper} ${className ?? ''}`} aria-disabled={disabled}>
        <Popover
          open={open}
          onOpenChange={nextOpen => setOpen(Boolean(nextOpen))}
          placement="bottom-start"
          content={
            <div className={styles.palette} role="listbox" aria-label="Выбор цвета">
              {colors.map(c => (
                <Button
                  className={styles.miniColor}
                  style={{
                    backgroundColor: c.content,
                    boxShadow: `0 0 0 ${c.content === selectedCss ? '2' : '0'}px ${c.content}`,
                  }}
                  key={c.id}
                  onClick={() => onPick(c)}
                ></Button>
              ))}
            </div>
          }
        >
          <div ref={inputRef}>
            <Button
              className={styles.color}
              aria-label={`Текущий цвет: ${selectedColor?.title}`}
              style={{ backgroundColor: selectedCss, boxShadow: `0 0 0 2px ${selectedCss}` }}
              disabled={disabled}
              onClick={() => !disabled && setOpen(o => !o)}
            ></Button>
          </div>
        </Popover>
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
