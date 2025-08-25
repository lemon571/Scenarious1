import { useEffect, useMemo, useState } from 'react';

type ManWithGearProps = {
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  // If you want to pass a different asset path (e.g., for tests)
  src?: string;
};

// This component loads the raw SVG from public and injects it as-is to preserve embedded <style> animations
export default function ManWithGear({
  className,
  style,
  animated = true,
  src = '/manWithGear.svg',
}: ManWithGearProps) {
  const [svg, setSvg] = useState<string>('');

  // Ensure the root <svg> has/doesn't have the "animated" class as requested
  const processedSvg = useMemo(() => {
    if (!svg) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        if (animated) {
          svgEl.classList.add('animated');
        } else {
          svgEl.classList.remove('animated');
        }
      }
      return new XMLSerializer().serializeToString(doc.documentElement);
    } catch {
      return svg;
    }
  }, [svg, animated]);

  useEffect(() => {
    let isActive = true;
    fetch(src)
      .then(r => r.text())
      .then(t => {
        if (isActive) setSvg(t);
      })
      .catch(() => {
        if (isActive) setSvg('');
      });
    return () => {
      isActive = false;
    };
  }, [src]);

  return (
    <div className={className} style={style} dangerouslySetInnerHTML={{ __html: processedSvg }} />
  );
}
