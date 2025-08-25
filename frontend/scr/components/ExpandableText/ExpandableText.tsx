import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import styles from './ExpandableText.module.css';
import { ChevronDown } from '@gravity-ui/icons';

interface ExpandableTextProps {
  text: string;
  lines?: number;
}

export const ExpandableText = ({ text, lines = 1 }: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [needsButton, setNeedsButton] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Универсальный пересчет высот и необходимости кнопки
  const recalcHeights = useCallback(() => {
    if (contentRef.current) {
      const scrollH = contentRef.current.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
      const collapsedH = lineHeight * lines;
      setFullHeight(scrollH);
      setCollapsedHeight(collapsedH);
      setNeedsButton(scrollH > collapsedH + 1); // +1px для защиты от погрешностей
    }
  }, [lines]);

  // Пересчет при изменении текста/lines
  useEffect(() => {
    recalcHeights();
  }, [recalcHeights]);

  // Пересчет при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      recalcHeights();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalcHeights]);

  // Обновляем высоту при изменении expanded состояния
  useEffect(() => {
    if (contentRef.current) {
      if (expanded) {
        setFullHeight(contentRef.current.scrollHeight);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
      } else {
        setFullHeight(collapsedHeight);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
      }
    }
  }, [expanded, collapsedHeight]);

  // Обработчик клика с анимацией
  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setIsAnimating(true);
      setExpanded(false);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className={styles.expandableContainer}>
      <div
        className={`${styles.expandableText} ${expanded ? styles.expanded : styles.collapsed}`}
        style={
          {
            '--lines': lines,
            maxHeight: expanded ? fullHeight + 'px' : collapsedHeight + 'px',
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            WebkitLineClamp: isAnimating ? 'none' : expanded ? 'none' : lines,
            display: isAnimating ? 'block' : expanded ? 'block' : '-webkit-box',
          } as React.CSSProperties
        }
        ref={contentRef}
      >
        {text}
      </div>
      {needsButton && (
        <Button view="flat" size="xs" onClick={handleToggle} color="secondary">
          <Icon
            className={`${styles.expandableIcon} ${expanded && styles.opened}`}
            size={15}
            data={ChevronDown}
          />
        </Button>
      )}
    </div>
  );
};
