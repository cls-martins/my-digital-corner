import {
  Instagram, MessageCircle, Phone, AtSign, Globe,
  Link as LinkIcon, Twitter, Youtube, Twitch, Github, Mail, Music
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  discord: MessageCircle,
  whatsapp: Phone,
  threads: AtSign,
  google: Mail,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  github: Github,
  spotify: Music,
  music: Music,
  globe: Globe,
  link: LinkIcon,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export function SocialIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICON_MAP[name?.toLowerCase()] || LinkIcon;
  return <Cmp className={className} />;
}
