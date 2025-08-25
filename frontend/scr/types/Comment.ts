export type Author = {
  name: string;
  avatar: string;
};

export type Reply = {
  id: string;
  author: Author;
  description: string;
  time: number; // timestamp in milliseconds
  replies: Reply[];
  block_id: string;
  scenario_id: string;
};

// export type Comment = {
//   id: string;
//   author: Author;
//   description: string;
//   time: number; // timestamp in milliseconds
//   replies: Reply[];
//   block_id: string;
//   scenario_id: string;
//   line_position?: number;
// };

export interface Comment {
  id: string;
  author: { name: string; avatar: string };
  description: string;
  time: number;
  replies: Reply[];
  block_id: string;
  scenario_id: string;
  line_position?: number;
  solved?: boolean;
}
