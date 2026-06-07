import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Clock, Tags, Phone, FileText, MessageSquare, Edit, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import CreditScore from '../components/CreditScore.js';
import WorkCard from '../components/WorkCard.js';
import ScheduleCard from '../components/ScheduleCard.js';
import Modal from '../components/Modal.js';
import { Schedule, Work } from '../../shared/types.js';

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    user, 
    isAuthenticated, 
    schedules, 
    works,
    isLoading, 
    fetchSchedules, 
    fetchWorks,
    clearError 
  } = useStore();
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [publisherWorks, setPublisherWorks] = useState<Work[]>([]);
  const [relatedSchedules, setRelatedSchedules] = useState<Schedule[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      clearError();
      await fetchSchedules();
      await fetchWorks({ public: true });
    };
    loadData();
  }, [fetchSchedules, fetchWorks, clearError]);

  useEffect(() => {
    if (id && schedules.length > 0) {
      const found = schedules.find(s => s.id === parseInt(id));
      if (found) {
        setSchedule(found);
        setNotFound(false);
        
        const userWorks = works.filter(w => 
          w.uploaderId === found.userId && w.visibility === 'public'
        ).slice(0, 4);
        setPublisherWorks(userWorks);
        
        const related = schedules.filter(s => 
          s.id !== found.id && 
          s.city === found.city && 
          s.status === 'active'
        ).slice(0, 3);
        setRelatedSchedules(related);
      } else {
        setNotFound(true);
      }
    }
  }, [id, schedules, works]);

  const isOwner = user && schedule && user.id === schedule.userId;

  const feeLabel = schedule ? {
    free: '免费',
    paid: `¥${schedule.fee}`,
    negotiable: '面议'
  }[schedule.feeType] : '';

  const handleInviteClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/schedule/${id}` } });
      return;
    }
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async () => {
    if (!schedule || !user) return;
    
    setIsSubmitting(true);
    try {
      await api.shootings.createShootingPlan({
        scheduleId: schedule.id,
        recipientId: schedule.userId,
        shootingDate: schedule.date,
        shootingLocation: schedule.city,
        notes: inviteMessage
      });
      setIsInviteModalOpen(false);
      setInviteMessage('');
      alert('邀约已发送！');
    } catch (error: any) {
      alert(error.message || '发送失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/schedule/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!schedule) return;
    
    setIsSubmitting(true);
    try {
      await api.schedules.deleteSchedule(schedule.id);
      setIsDeleteModalOpen(false);
      navigate('/schedules');
    } catch (error: any) {
      alert(error.message || '删除失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <AlertTriangle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display text-cream-100 mb-2">档期不存在</h1>
          <p className="text-cream-400 mb-6">您访问的档期可能已被删除或不存在</p>
          <button 
            onClick={() => navigate('/schedules')}
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回档期列表
          </button>
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  return (
    <div className="min-h-screen bg-charcoal-900 py-8 px-4">
      <div className="container max-w-7xl">
        <button 
          onClick={() => navigate('/schedules')}
          className="inline-flex items-center text-cream-400 hover:text-gold-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回档期列表
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <div className="card p-6 animate-fade-in-up">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-display font-semibold text-cream-100 mb-2">
                    {schedule.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-cream-400">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      schedule.status === 'booked' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {schedule.status === 'active' ? '可约' : 
                       schedule.status === 'booked' ? '已约' : '已过期'}
                    </span>
                    <div className="flex items-center">
                      <Tags className="w-4 h-4 mr-1 text-gold-500" />
                      <span className="text-gold-400">
                        {Array.isArray(schedule.style) ? schedule.style.join('、') : schedule.style}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-charcoal-800/50 rounded-xl mb-6">
                <img
                  src={schedule.user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                  alt={schedule.user?.realName}
                  className="w-16 h-16 rounded-full border-2 border-gold-500/50 object-cover mb-4 sm:mb-0 sm:mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-medium text-cream-100">
                      {schedule.user?.realName}
                    </span>
                    <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                      {schedule.user?.role === 'photographer' ? '摄影师' : '模特'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-cream-400">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {schedule.user?.city}
                    </div>
                  </div>
                </div>
                {schedule.user && (
                  <div className="mt-4 sm:mt-0">
                    <CreditScore score={schedule.user.creditScore} size="sm" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center p-3 bg-charcoal-800/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-gold-500 mr-3" />
                  <div>
                    <p className="text-xs text-cream-500">拍摄日期</p>
                    <p className="text-cream-100 font-medium">{schedule.date}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-charcoal-800/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-gold-500 mr-3" />
                  <div>
                    <p className="text-xs text-cream-500">拍摄城市</p>
                    <p className="text-cream-100 font-medium">{schedule.city}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-charcoal-800/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gold-500 mr-3" />
                  <div>
                    <p className="text-xs text-cream-500">费用</p>
                    <p className="text-cream-100 font-medium">{feeLabel}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-charcoal-800/30 rounded-lg">
                  <Clock className="w-5 h-5 text-gold-500 mr-3" />
                  <div>
                    <p className="text-xs text-cream-500">预计时长</p>
                    <p className="text-cream-100 font-medium">{schedule.duration || '待定'}</p>
                  </div>
                </div>
              </div>

              {schedule.workRequirements && (
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-gold-500 mr-2" />
                    <h3 className="text-lg font-medium text-cream-100">作品要求</h3>
                  </div>
                  <div className="p-4 bg-charcoal-800/30 rounded-lg">
                    <p className="text-cream-300 whitespace-pre-wrap">{schedule.workRequirements}</p>
                  </div>
                </div>
              )}

              {schedule.contact && (
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-gold-500 mr-2" />
                    <h3 className="text-lg font-medium text-cream-100">联系方式</h3>
                  </div>
                  <div className="p-4 bg-charcoal-800/30 rounded-lg">
                    <p className="text-cream-300">{schedule.contact}</p>
                  </div>
                </div>
              )}

              {schedule.description && (
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-gold-500 mr-2" />
                    <h3 className="text-lg font-medium text-cream-100">备注说明</h3>
                  </div>
                  <div className="p-4 bg-charcoal-800/30 rounded-lg">
                    <p className="text-cream-300 whitespace-pre-wrap">{schedule.description}</p>
                  </div>
                </div>
              )}

              {schedule.samplePhotos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-cream-100 mb-3">参考样片</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {schedule.samplePhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`样片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-charcoal-600">
                {isOwner ? (
                  <>
                    <button 
                      onClick={handleEdit}
                      className="flex-1 btn-secondary inline-flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑档期
                    </button>
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex-1 btn-danger inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除档期
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleInviteClick}
                    disabled={schedule.status !== 'active'}
                    className={`flex-1 btn-primary inline-flex items-center justify-center ${
                      schedule.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {schedule.status === 'active' ? '发起邀约' : '档期不可约'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 space-y-6">
            {publisherWorks.length > 0 && (
              <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-display font-medium text-cream-100 mb-4">
                  {schedule.user?.realName} 的作品
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {publisherWorks.map(work => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              </div>
            )}

            {relatedSchedules.length > 0 && (
              <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-display font-medium text-cream-100 mb-4">
                  相关推荐档期
                </h3>
                <div className="space-y-4">
                  {relatedSchedules.map(related => (
                    <ScheduleCard key={related.id} schedule={related} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="发起邀约"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-cream-400 text-sm">
            向 <span className="text-gold-400 font-medium">{schedule.user?.realName}</span> 发起拍摄邀约，请填写留言信息：
          </p>
          <div>
            <label className="form-label">邀约留言</label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="请描述您的拍摄需求、想法或其他需要说明的内容..."
              className="input-field min-h-32 resize-none"
            />
          </div>
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
            <p className="text-xs text-gold-400">
              <strong>温馨提示：</strong>邀约发送后，对方将收到通知并可以选择接受或拒绝。请在约定时间准时赴约，爽约将影响您的信用分。
            </p>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              onClick={handleInviteSubmit}
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '发送中...' : '确认发送'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-cream-100 font-medium">确定要删除这个档期吗？</p>
              <p className="text-cream-400 text-sm">此操作不可撤销</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? '删除中...' : '确认删除'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
