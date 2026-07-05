import * as LucideIcons from 'lucide-react';
import { createElement } from 'react';

export function Icon({ name, className, size = 24 }: { name: string, className?: string, size?: number }) {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} size={size} />;
  return createElement(IconComponent, { className, size });
}
