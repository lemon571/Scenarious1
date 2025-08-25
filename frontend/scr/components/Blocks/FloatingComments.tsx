import { useEffect, useMemo, useRef, useState } from 'react';
import type { Block as BlockType } from '../../types/Block';
import CommentBlock from '../CommentBlock/CommentBlock';
import styles from './Blocks.module.css';

type Props = {
  blocks: BlockType[];
  containerRef: React.RefObject<HTMLDivElement>;
  rowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  scenarioId?: string;
};

export default function FloatingComments({ blocks, containerRef, rowRefs, scenarioId }: Props) {
  type Positioned = {
    block_id: string;
    top: number;
    left: number;
    height: number;
    comments: BlockType['comments'];
  };

  const COMMENT_CARD_COLLAPSED_HEIGHT = 66; // px, fallback before first measure

  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [expandedId, setExpandedId] = useState<string | undefined>();
  const [layout, setLayout] = useState<Positioned[]>([]);
  const [initialRender, setInitialRender] = useState(true);
  const [animate, setAnimate] = useState(false);

  // Flatten parent and child blocks while preserving only those with comments
  const blocksWithComments = useMemo(() => {
    const result: BlockType[] = [];
    blocks.forEach(b => {
      if (b.comments && b.comments.length) result.push(b);
      if (b.children && b.children.length) {
        b.children.forEach(child => {
          if (child.comments && child.comments.length) result.push(child);
        });
      }
    });
    return result;
  }, [blocks]);

  const recalcLayout = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const items: Positioned[] = [];
    blocksWithComments.forEach(block => {
      const rowEl = rowRefs.current[block.block_id];
      const rowRect = rowEl?.getBoundingClientRect();
      const top = rowRect?.top ? rowRect.top - containerRect.top : 0;

      // Align to reserved sidebar: container's right edge + configured gap
      const COMMENTS_GAP = 24; // keep in sync with CSS var --comments-gap
      const left = containerRect.width - containerRect.width + COMMENTS_GAP;
      const commentEl = commentRefs.current[block.block_id];
      const height = commentEl?.offsetHeight || COMMENT_CARD_COLLAPSED_HEIGHT;
      items.push({ block_id: block.block_id, top, left, height, comments: block.comments });

      rowEl?.addEventListener('mouseover', () => {
        if (commentEl) commentEl.style.boxShadow = '0 0 0 2px var(--g-color-line-brand)';
      });
      rowEl?.addEventListener('mouseleave', () => {
        if (commentEl) commentEl.style.boxShadow = 'none';
      });
    });

    items.sort((a, b) => a.top - b.top);

    // stack to avoid overlap, with small gap
    let lastBottom = -Infinity;
    const stacked = items.map(item => {
      let top = item.top;
      if (top < lastBottom + 4) top = lastBottom + 4;
      lastBottom = top + item.height;
      return { ...item, top };
    });

    setLayout(stacked);
    setTimeout(() => setInitialRender(false), 100);
  };

  // Initial calc + recalc on resize
  useEffect(() => {
    recalcLayout();
    const onResize = () => recalcLayout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksWithComments, containerRef, rowRefs]);

  // Recalc on expand/collapse with a short delay to account for inner transitions
  useEffect(() => {
    recalcLayout();
    const t = setTimeout(() => recalcLayout(), 350);
    return () => clearTimeout(t);
  }, [expandedId]);

  // Outside click to collapse
  useEffect(() => {
    if (!expandedId) return;
    const handleClick = (evt: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const clickX = evt.clientX;
      // Right column starts at containerRect.right + gap
      const commentsStartX = containerRect.right + 24;
      const clickedInsideComments = clickX >= commentsStartX;
      if (!clickedInsideComments) setExpandedId(undefined);
    };
    window.addEventListener('click', handleClick, { capture: true } as AddEventListenerOptions);
    return () =>
      window.removeEventListener('click', handleClick, { capture: true } as EventListenerOptions);
  }, [expandedId, containerRef]);

  // Observe comment card size changes for dynamic content expansion
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    blocksWithComments.forEach(block => {
      const el = commentRefs.current[block.block_id];
      if (!el) return;
      const ro = new ResizeObserver(() => recalcLayout());
      ro.observe(el);
      observers.push(ro);
    });
    return () => observers.forEach(o => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksWithComments, layout.length]);

  useEffect(() => {
    if (!layout.length) return;
    requestAnimationFrame(() => setAnimate(true));
    return () => setAnimate(false);
  }, [layout]);

  if (!layout.length) {
    // render invisible for measurement first
    return (
      <div style={{ opacity: 0, pointerEvents: 'none' }}>
        {blocksWithComments.map(block => (
          <div key={block.block_id} ref={el => (commentRefs.current[block.block_id] = el)}>
            <CommentBlock
              comments={block.comments}
              expanded={false}
              scenarioId={scenarioId}
              blockId={block.block_id}
            />
          </div>
        ))}
      </div>
    );
  }

  const handleToggle = (id: string, next: boolean) => {
    setExpandedId(next ? id : undefined);
  };

  return (
    <>
      {layout.map((item, index) => (
        <div
          key={item.block_id}
          style={{
            top: item.top,
            left: item.left,
            position: 'absolute',
            transitionDelay: initialRender ? `${index * 100}ms` : undefined,
            width: 'var(--comments-width)',
          }}
          className={`${styles.floatingComment} ${animate ? styles.floatingCommentEnter : ''} ${expandedId && expandedId !== item.block_id ? styles.floatingCommentHidden : ''}`}
          ref={el => (commentRefs.current[item.block_id] = el)}
        >
          <CommentBlock
            blockId={item.block_id}
            comments={item.comments}
            expanded={expandedId === item.block_id}
            onToggle={next => handleToggle(item.block_id, next)}
            scenarioId={scenarioId}
          />
        </div>
      ))}
    </>
  );
}
