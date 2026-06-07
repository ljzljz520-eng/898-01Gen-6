import { useState } from 'react';
import { Eye, Lock, Users, Check, X } from 'lucide-react';
import { Work } from '../../shared/types.js';

interface WorkCardProps {
  work: Work;
  onView?: (work: Work) => void;
  onAuthorize?: (work: Work) => void;
}

export default function WorkCard({ work, onView, onAuthorize }: WorkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const visibilityConfig = {
    private: { icon: Lock, label: '私有', color: 'text-red-400 bg-red-500/20' },
    both: { icon: Users, label: '双方可见', color: 'text-blue-400 bg-blue-500/20' },
    public: { icon: Eye, label: '公开', color: 'text-green-400 bg-green-500/20' }
  }[work.visibility];

  const VisibilityIcon = visibilityConfig.icon;

  const isPendingAuthorization = !work.photographerConfirmed || !work.modelConfirmed;

  return (
    <div 
      className="card group cursor-pointer overflow-hidden"
      onClick={() => onView?.(work)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-700">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={work.imageUrl.startsWith('http') ? work.imageUrl : `http://localhost:3001${work.imageUrl}`}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${visibilityConfig.color}`}>
            <VisibilityIcon className="w-3 h-3" />
            <span>{visibilityConfig.label}</span>
          </span>
          
          {isPendingAuthorization && (
            <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
              <span>待授权</span>
            </span>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-cream-100 font-medium text-sm mb-1 line-clamp-1">{work.title}</h3>
          <div className="flex items-center space-x-2 text-xs text-cream-400">
            {work.photographerConfirmed && (
              <span className="flex items-center text-green-400">
                <Check className="w-3 h-3 mr-1" />
                摄影师已确认
              </span>
            )}
            {work.modelConfirmed && (
              <span className="flex items-center text-green-400">
                <Check className="w-3 h-3 mr-1" />
                模特已确认
              </span>
            )}
            {(!work.photographerConfirmed || !work.modelConfirmed) && (
              <span className="flex items-center text-yellow-400">
                <X className="w-3 h-3 mr-1" />
                待确认
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={work.uploader?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
              alt={work.uploader?.realName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-cream-400">{work.uploader?.realName}</span>
          </div>
          
          {onAuthorize && isPendingAuthorization && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAuthorize(work);
              }}
              className="text-xs px-3 py-1 rounded-md bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors"
            >
              去授权
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
