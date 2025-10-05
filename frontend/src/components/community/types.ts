export interface ResearchPost {
  id: string;
  author: {
    name: string;
    title: string;
    institution: string;
    avatar: string;
    badges: string[];
  };
  title: string;
  content: string;
  tags: string[];
  attachments?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  category: "AI_MODEL" | "OBSERVATION" | "ANALYSIS" | "DISCUSSION";
}
