import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-charcoal-900/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className={`relative w-full ${sizeClasses} bg-charcoal-800 border border-charcoal-600 rounded-2xl shadow-2xl animate-fade-in-up`}>
        <div className="flex items-center justify-between p-6 border-b border-charcoal-600">
          <h3 className="font-display text-xl font-semibold text-cream-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
