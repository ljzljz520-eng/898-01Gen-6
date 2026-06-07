import { cn } from '../lib/utils.js';
import { LucideIcon } from 'lucide-react';

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function Empty({
  icon: Icon,
  title = '暂无数据',
  description,
  actionText,
  onAction,
  className
}: EmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="w-20 h-20 mb-4 bg-charcoal-700 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-charcoal-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-cream-200 mb-2">{title}</h3>
      {description && (
        <p className="text-cream-500 mb-6 max-w-md">{description}</p>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
}
