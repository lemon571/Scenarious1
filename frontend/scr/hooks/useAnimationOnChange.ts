import { useEffect, useRef } from 'react';

const CSS_ANIMATION_CLASSNAME = 'pulseAnimation';

export function useAnimationOnChange<T, K extends HTMLElement>(
  value: T,
  className = CSS_ANIMATION_CLASSNAME,
) {
  const ref = useRef<K | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && ref.current) {
      const el = ref.current;
      el.classList.remove(className);
      void el.offsetWidth; // перезапуск анимации
      el.classList.add(className);
    }
    prevValue.current = value;
  }, [value, className]);

  return ref;
}
