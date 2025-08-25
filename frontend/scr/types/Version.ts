export type Version = {
  id: string;
  createdAt: number; // UNIX ms
  authorName: string;
  authorAvatar?: string;
  isCurrent?: boolean;
}; 