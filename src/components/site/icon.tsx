// ============================================================================
// Dynamic Lucide Icon Renderer — maps DB icon names to Lucide components.
// ============================================================================

import {
  GitBranch, Cylinder, FlaskConical, Layers, Waves, Box, Compass,
  Calendar, Briefcase, Users, ShieldCheck, Award, Zap, Target,
  CheckCircle2, TrendingUp, Building2, Factory, Wrench, HardHat,
  Phone, Mail, MapPin, Globe, Clock, Star, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  GitBranch, Cylinder, FlaskConical, Layers, Waves, Box, Compass,
  Calendar, Briefcase, Users, ShieldCheck, Award, Zap, Target,
  CheckCircle2, TrendingUp, Building2, Factory, Wrench, HardHat,
  Phone, Mail, MapPin, Globe, Clock, Star,
};

interface IconProps {
  name: string | null | undefined;
  className?: string;
  fallback?: LucideIcon;
}

export function Icon({ name, className, fallback: Fallback = Building2 }: IconProps) {
  const Cmp = name && iconMap[name] ? iconMap[name] : Fallback;
  return <Cmp className={className} />;
}

export { iconMap };
