export type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  font: string;
  cursor: "default" | "glow" | "none" | "ring";
  effects: string[]; // particles, grid, scanlines, bigtext
  textAnimation:
    | "none"
    | "glitch"
    | "shimmer"
    | "typewriter"
    | "rainbow"
    | "wave"
    | "neon-pulse"
    | "fire"
    | "chromatic"
    | "bounce"
    | "flicker";
};

export type Badge = { label: string; color: string; icon?: string };

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
  name_style?: NameStyle;
  entry_effect?: EntryEffect;
};

export type NameStyle =
  | "brackets"
  | "neon"
  | "glitch"
  | "mono"
  | "gradient"
  | "outline"
  | "minimal";

export type EntryEffect =
  | "none"
  | "fade"
  | "click"
  | "typewriter"
  | "glitch"
  | "scan";

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
  parent_id: string | null;
  is_author: boolean;
};

export type PostRow = {
  id: string;
  type: "text" | "image" | "video";
  content: string | null;
  media_url: string | null;
  created_at: string;
};
