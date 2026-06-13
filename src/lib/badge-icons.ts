import {
  Crown, Sparkles, Verified, Zap, Star, Shield, Award, Flame, Heart, Gem, Rocket, Trophy,
} from "lucide-react";
import type { ComponentType } from "react";

export const BADGE_ICON_MAP: Record<string, ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  sparkles: Sparkles,
  crown: Crown,
  verified: Verified,
  zap: Zap,
  star: Star,
  shield: Shield,
  award: Award,
  flame: Flame,
  heart: Heart,
  gem: Gem,
  rocket: Rocket,
  trophy: Trophy,
};

export const BADGE_ICON_OPTIONS = Object.keys(BADGE_ICON_MAP);
