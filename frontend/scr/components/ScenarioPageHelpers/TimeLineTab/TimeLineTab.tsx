import type { Block } from '../../../types';

import { TimeLine } from '../TimeLine/TimeLine';

export default function TimeLineTab({ blocks }: { blocks: Block[] }) {
  return <TimeLine blocks={blocks} />;
}
