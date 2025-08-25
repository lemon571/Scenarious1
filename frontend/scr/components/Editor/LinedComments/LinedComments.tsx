import { useEffect, useState, useRef } from 'react';
import type { useEditor } from '@tiptap/react';
import type { Comment } from '../../../types';
import styles from './LinedComments.module.css';
import CommentBlock from '../../CommentBlock/CommentBlock.tsx';

type Props = {
  editor: ReturnType<typeof useEditor>;
  editorContainerRef: React.RefObject<HTMLDivElement>;
  comments: Comment[];
};

type PositionedComment = Comment & { top: number; left: number; height: number };

const COMMENT_CARD_HEIGHT = 66; // px, fallback before first measure

export default function LinedComments({ editor, editorContainerRef, comments }: Props) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positionedComments, setPositionedComments] = useState<PositionedComment[]>([]);
  const [initialRender, setInitialRender] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | undefined>();

  const recalcLayout = () => {
    if (!editorContainerRef.current || !comments || !editor) return;
    const containerRect = editorContainerRef.current.getBoundingClientRect();

    const positionedComments: Array<PositionedComment> = [];

    comments.forEach(comment => {
      const domAtPos = editor.view.domAtPos(comment.line_position || 0);
      const htmlElm =
        domAtPos.node.nodeType === 3
          ? domAtPos.node.parentElement
          : (domAtPos.node as HTMLHtmlElement);
      const rect = htmlElm?.getBoundingClientRect();
      const top = rect?.top ? rect.top - containerRect.top : containerRect.top;
      const left = containerRect.width + 24;
      const commentHtmlEl = refs.current[comment.id];
      const height = commentHtmlEl?.offsetHeight || COMMENT_CARD_HEIGHT;

      positionedComments.push({ ...comment, top, left, height });
    });

    // Sort by top position
    positionedComments.sort((a, b) => a.top - b.top);

    // Stack to avoid overlap, with small gap
    let lastBottom = -Infinity;
    const layoutedComments = positionedComments.map(comment => {
      let top = comment.top;
      if (top < lastBottom + 4) {
        top = lastBottom + 4;
      }
      lastBottom = top + comment.height;
      return { ...comment, top };
    });

    setPositionedComments(layoutedComments);
    setTimeout(() => setInitialRender(false), 100);
  };

  // Initial calc + recalc on resize
  useEffect(() => {
    recalcLayout();
    const onResize = () => recalcLayout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [editor, editorContainerRef, comments]);

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
      const container = editorContainerRef.current;
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
  }, [expandedId, editorContainerRef]);

  // Observe comment card size changes for dynamic content expansion
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    comments.forEach(comment => {
      const el = refs.current[comment.id];
      if (!el) return;
      const ro = new ResizeObserver(() => recalcLayout());
      ro.observe(el);
      observers.push(ro);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [comments, positionedComments.length]);

  useEffect(() => {
    if (!positionedComments.length) return;
    requestAnimationFrame(() => setAnimate(true));
    return () => setAnimate(false);
  }, [positionedComments]);

  if (!positionedComments.length) {
    // Render invisible for measurement first
    return (
      <div style={{ opacity: 0, pointerEvents: 'none' }}>
        {comments.map(comment => (
          <div key={comment.id} ref={el => (refs.current[comment.id] = el)}>
            <CommentBlock comments={[comment]} expanded={false} />
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
      {positionedComments.map((comment, index) => (
        <div
          key={comment.id}
          style={{
            top: comment.top,
            left: comment.left,
            position: 'absolute',
            transitionDelay: initialRender ? `${index * 100}ms` : undefined,
            width: 'var(--comments-width, 300px)',
          }}
          className={`
            ${styles.commentTooltip}
            ${animate ? styles.enter : ''}
            ${expandedId && expandedId !== comment.id ? styles.hidden : ''}
          `}
          ref={el => (refs.current[comment.id] = el)}
        >
          <CommentBlock
            comments={[comment]}
            expanded={expandedId === comment.id}
            onToggle={next => handleToggle(comment.id, next)}
          />
        </div>
      ))}
    </>
  );
}
