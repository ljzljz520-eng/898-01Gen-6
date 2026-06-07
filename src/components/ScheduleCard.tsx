import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, User } from 'lucide-react';
import { Schedule } from '../../shared/types.js';

interface ScheduleCardProps {
  schedule: Schedule;
  onBook?: (schedule: Schedule) => void;
}

export default function ScheduleCard({ schedule, onBook }: ScheduleCardProps) {
  const feeLabel = {
    free: '免费',
    paid: `¥${schedule.fee}`,
    negotiable: '面议'
  }[schedule.feeType];

  const statusColor = {
    active: 'bg-green-500/20 text-green-400',
    booked: 'bg-yellow-500/20 text-yellow-400',
    expired: 'bg-gray-500/20 text-gray-400'
  }[schedule.status];

  const statusLabel = {
    active: '可约',
    booked: '已约',
    expired: '已过期'
  }[schedule.status];

  return (
    <div className="card group animate-fade-in-up overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        {schedule.samplePhotos.length > 0 ? (
          <img
            src={schedule.samplePhotos[0]}
            alt={Array.isArray(schedule.style) ? schedule.style.join('、') : schedule.style}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal-700 to-charcoal-800 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-charcoal-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent" />
        
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={schedule.user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
              alt={schedule.user?.realName}
              className="w-8 h-8 rounded-full border-2 border-gold-500/50 object-cover"
            />
            <div>
              <p className="text-cream-100 text-sm font-medium">{schedule.user?.realName}</p>
              <span className="text-xs text-gold-400">
                {schedule.user?.role === 'photographer' ? '摄影师' : '模特'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-cream-100 font-medium mb-2 line-clamp-1">{schedule.title}</h3>
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-4 h-4 text-gold-500" />
          <span className="text-gold-400 font-medium">{Array.isArray(schedule.style) ? schedule.style.join('、') : schedule.style}</span>
          <span className="text-cream-500">·</span>
          <span className="text-cream-400">{feeLabel}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-cream-400 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{schedule.city}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{schedule.date}</span>
          </div>
        </div>
        
        <p className="text-cream-400 text-sm line-clamp-2 mb-4">
          {schedule.description}
        </p>
        
        <div className="flex space-x-2">
          <Link
            to={`/schedule/${schedule.id}`}
            className="flex-1 btn-secondary text-sm py-2 text-center"
          >
            查看详情
          </Link>
          {onBook && schedule.status === 'active' && (
            <button
              onClick={() => onBook(schedule)}
              className="flex-1 btn-primary text-sm py-2"
            >
              发起邀约
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
