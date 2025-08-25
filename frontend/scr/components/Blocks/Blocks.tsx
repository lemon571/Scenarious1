import { Flex } from '@gravity-ui/uikit';
import { useEffect, useRef } from 'react';
import type { Block as BlockType } from '../../types/Block';
import { getRoleDisplayName } from '../../utils/roleMapping';
import Block from '../Block/Block';
import styles from './Blocks.module.css';
import FloatingComments from './FloatingComments';

interface BlocksProps {
  blocks: BlockType[];
  filteredRoles?: string[] | undefined;
  scenarioId?: string;
}

function blockMatchesRoles(block: BlockType, filteredRoles: string[]): boolean {
  if (block.roles.some(role => filteredRoles.includes(getRoleDisplayName(role)))) {
    return true;
  }
  if (block.children && block.children.length > 0) {
    return block.children.some(child => blockMatchesRoles(child, filteredRoles));
  }

  return false;
}

export default function Blocks({ blocks, filteredRoles, scenarioId }: BlocksProps) {
  const visibleBlocks = blocks
    .filter(block => {
      if (!filteredRoles || filteredRoles.length === 0) return true;
      return blockMatchesRoles(block, filteredRoles);
    })
    .slice()
    .sort((a, b) => a.start - b.start);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // After each render, query .timelineRow for elements with data-block-id to map refs for parents and children
  useEffect(() => {
    if (!containerRef.current) return;
    const rows = Array.from(containerRef.current.querySelectorAll(`.${styles.timelineRow}`));
    rows.forEach(row => {
      const el = row.querySelector('[data-block-id]') as HTMLDivElement | null;
      const id = el?.getAttribute('data-block-id');
      if (id) rowRefs.current[id] = el;
      const children = Array.from(row.querySelectorAll('[data-block-id]')) as HTMLDivElement[];
      children.forEach(childEl => {
        const childId = childEl.getAttribute('data-block-id');
        if (childId) rowRefs.current[childId] = childEl;
      });
    });
  });

  return (
    <Flex>
      <div className={styles.blocksContainer} ref={containerRef}>
        {visibleBlocks.map(block => (
          <div key={block.block_id} className={styles.timelineRow}>
            <div className={styles.timelineContent}>
              <Block {...block} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <FloatingComments
          blocks={visibleBlocks}
          containerRef={containerRef}
          rowRefs={rowRefs}
          scenarioId={scenarioId}
        />
      </div>
    </Flex>
  );
}
