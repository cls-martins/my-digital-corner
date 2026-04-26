export type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  font: string;
  cursor: "default" | "glow" | "none" | "ring";
  effects: string[]; // particles, grid, scanlines, bigtext
  textAnimation: "none" | "glitch" | "shimmer" | "typewriter";
};

export type Badge = { label: string; color: string };

export type ProfileRow = {
  id: string;
  display_name: string;
  handle: string;
  bio: string;
  avatar_url: string | null;
  avatar_decoration: string | null;
  banner_url: string | null;
  background_video_url: string | null;
  background_image_url: string | null;
  audio_url: string | null;
  audio_title: string | null;
  audio_artist: string | null;
  badges: Badge[];
  theme: Theme;
  views: number;
};

export type LinkRow = {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: string;
  position: number;
};

export type CommentRow = {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
};
