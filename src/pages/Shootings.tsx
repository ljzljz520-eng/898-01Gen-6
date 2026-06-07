import { useState, useEffect, useMemo } from 'react';
import { Check, X, Camera, CalendarClock, AlertTriangle, MessageSquare, Upload } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { ShootingPlan } from '../../shared/types.js';
import Modal from '../components/Modal.js';
import { cn } from '../lib/utils.js';

type TabType = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type CancelReason = '临时有事' | '身体不适' | '天气原因' | '其他';

const TABS: { key: TabType; label: string; color: string }[] = [
  { key: 'pending', label: '待确认', color: 'yellow' },
  { key: 'confirmed', label: '进行中', color: 'blue' },
  { key: 'completed', label: '已完成', color: 'green' },
  { key: 'cancelled', label: '已取消', color: 'red' },
];

const CANCEL_REASONS: CancelReason[] = ['临时有事', '身体不适', '天气原因', '其他'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待确认',
  confirmed: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

const TAB_BORDER_COLORS: Record<string, string> = {
  yellow: 'border-yellow-500 text-yellow-400',
  blue: 'border-blue-500 text-blue-400',
  green: 'border-green-500 text-green-400',
  red: 'border-red-500 text-red-400',
};

export default function Shootings() {
  const { shootings, isLoading, user, fetchShootings, confirmShootingPlan, rejectShootingPlan, completeShootingPlan, cancelShootingPlan } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedShooting, setSelectedShooting] = useState<ShootingPlan | null>(null);
  const [cancelReason, setCancelReason] = useState<CancelReason>('临时有事');
  const [cancelDetail, setCancelDetail] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchShootings();
  }, [fetchShootings]);

  const filteredShootings = useMemo(() => {
    return shootings.filter((s) => s.status === activeTab);
  }, [shootings, activeTab]);

  const getOtherParty = (shooting: ShootingPlan) => {
    if (!user) return null;
    return shooting.requesterId === user.id ? shooting.recipient : shooting.requester;
  };

  const handleConfirm = async (id: number) => {
    setActionLoading(id);
    try {
      await confirmShootingPlan(id);
    } catch (error) {
      console.error('确认失败:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await rejectShootingPlan(id);
    } catch (error) {
      console.error('拒绝失败:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: number) => {
    setActionLoading(id);
    try {
      await completeShootingPlan(id);
    } catch (error) {
      console.error('完成失败:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openCancelModal = (shooting: ShootingPlan) => {
    setSelectedShooting(shooting);
    setCancelReason('临时有事');
    setCancelDetail('');
    setCancelModalOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedShooting) return;
    setActionLoading(selectedShooting.id);
    try {
      const reason = cancelDetail ? `${cancelReason}：${cancelDetail}` : cancelReason;
      await cancelShootingPlan(selectedShooting.id, { reason });
      setCancelModalOpen(false);
      setSelectedShooting(null);
    } catch (error) {
      console.error('取消失败:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = (shooting: ShootingPlan) => {
    console.log('上传作品:', shooting.id);
  };

  const handleViewDetail = (shooting: ShootingPlan) => {
    console.log('查看详情:', shooting.id);
  };

  const renderActionButtons = (shooting: ShootingPlan) => {
    const isLoading = actionLoading === shooting.id;
    const buttons = [];

    switch (shooting.status) {
      case 'pending':
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleConfirm(shooting.id)}
            disabled={isLoading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50'
            )}
          >
            <Check className="w-4 h-4" />
            确认
          </button>,
          <button
            key="reject"
            onClick={() => handleReject(shooting.id)}
            disabled={isLoading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50'
            )}
          >
            <X className="w-4 h-4" />
            拒绝
          </button>
        );
        break;
      case 'confirmed':
        buttons.push(
          <button
            key="complete"
            onClick={() => handleComplete(shooting.id)}
            disabled={isLoading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50'
            )}
          >
            <Check className="w-4 h-4" />
            完成
          </button>,
          <button
            key="cancel"
            onClick={() => openCancelModal(shooting)}
            disabled={isLoading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50'
            )}
          >
            <X className="w-4 h-4" />
            取消
          </button>
        );
        break;
      case 'completed':
        buttons.push(
          <button
            key="upload"
            onClick={() => handleUpload(shooting)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30'
            )}
          >
            <Upload className="w-4 h-4" />
            上传作品
          </button>
        );
        break;
      case 'cancelled':
        buttons.push(
          <button
            key="detail"
            onClick={() => handleViewDetail(shooting)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              'bg-charcoal-600 text-cream-300 border border-charcoal-500 hover:bg-charcoal-500'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            查看详情
          </button>
        );
        break;
    }

    return buttons;
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-charcoal-700 rounded w-3/4" />
                <div className="h-4 bg-charcoal-700 rounded w-1/2" />
              </div>
              <div className="h-6 bg-charcoal-700 rounded-full w-16" />
            </div>
            <div className="h-px bg-charcoal-700" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-charcoal-700 rounded-full" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-charcoal-700 rounded w-24" />
                  <div className="h-3 bg-charcoal-700 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-charcoal-700 rounded w-2/3" />
              <div className="h-4 bg-charcoal-700 rounded w-1/2" />
            </div>
            <div className="h-px bg-charcoal-700" />
            <div className="flex gap-3">
              <div className="h-9 bg-charcoal-700 rounded flex-1" />
              <div className="h-9 bg-charcoal-700 rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => {
    const tabConfig = TABS.find((t) => t.key === activeTab);
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-charcoal-700 rounded-full flex items-center justify-center">
          <CalendarClock className="w-10 h-10 text-charcoal-500" />
        </div>
        <h3 className="text-xl font-semibold text-cream-200 mb-2">
          暂无{tabConfig?.label}的拍摄计划
        </h3>
        <p className="text-cream-500">
          {activeTab === 'pending' && '目前没有需要确认的拍摄邀约'}
          {activeTab === 'confirmed' && '目前没有正在进行的拍摄计划'}
          {activeTab === 'completed' && '完成的拍摄计划会显示在这里'}
          {activeTab === 'cancelled' && '取消的拍摄计划会显示在这里'}
        </p>
      </div>
    );
  };

  const renderCard = (shooting: ShootingPlan) => {
    const otherParty = getOtherParty(shooting);
    const scheduleTitle = shooting.schedule?.title || '自定义拍摄';

    return (
      <div key={shooting.id} className="card animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-cream-100 mb-1 truncate">
                {scheduleTitle}
              </h3>
              <div className="flex items-center gap-2 text-cream-500 text-sm">
                <Camera className="w-4 h-4" />
                <span>{shooting.shootingLocation}</span>
              </div>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border',
                STATUS_COLORS[shooting.status]
              )}
            >
              {STATUS_LABELS[shooting.status]}
            </span>
          </div>

          <div className="h-px bg-charcoal-700 my-4" />

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  otherParty?.avatar ||
                  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'
                }
                alt={otherParty?.realName || '对方'}
                className="w-10 h-10 rounded-full border-2 border-charcoal-600 object-cover"
              />
              <div>
                <p className="text-cream-100 font-medium">
                  {otherParty?.realName || '未知用户'}
                </p>
                <span className="text-xs text-gold-400">
                  {otherParty?.role === 'photographer' ? '摄影师' : '模特'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-cream-400 text-sm">
              <CalendarClock className="w-4 h-4 text-gold-500" />
              <span>{shooting.shootingDate}</span>
            </div>

            {shooting.notes && (
              <div className="flex items-start gap-2 text-cream-400 text-sm">
                <MessageSquare className="w-4 h-4 text-charcoal-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{shooting.notes}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-charcoal-700 my-4" />

          <div className="flex gap-3">{renderActionButtons(shooting)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream-100 mb-2 font-display">
            拍摄<span className="gold-text-gradient">计划管理</span>
          </h1>
          <p className="text-cream-500">管理您的拍摄邀约和合作计划</p>
        </div>

        <div className="bg-charcoal-800/50 backdrop-blur-sm border border-charcoal-700 rounded-xl p-1 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 border-b-2 border-transparent',
                  activeTab === tab.key
                    ? cn(
                        'bg-charcoal-700/50',
                        TAB_BORDER_COLORS[tab.color]
                      )
                    : 'text-cream-500 hover:text-cream-300 hover:bg-charcoal-700/30'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          renderSkeleton()
        ) : filteredShootings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredShootings.map(renderCard)}
          </div>
        ) : (
          renderEmpty()
        )}
      </div>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="取消拍摄计划"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cream-200 font-medium">取消拍摄计划</p>
              <p className="text-cream-500 text-sm mt-1">
                频繁取消可能会影响您的信用评分，请谨慎操作
              </p>
            </div>
          </div>

          <div>
            <label className="form-label">取消原因</label>
            <div className="grid grid-cols-2 gap-3">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border',
                    cancelReason === reason
                      ? 'bg-gold-500/20 text-gold-400 border-gold-500/50'
                      : 'bg-charcoal-700 text-cream-400 border-charcoal-600 hover:border-charcoal-500'
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">详细说明（可选）</label>
            <textarea
              value={cancelDetail}
              onChange={(e) => setCancelDetail(e.target.value)}
              placeholder="请输入详细的取消原因，以便对方了解情况..."
              className="input-field min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 btn-secondary"
            >
              再想想
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading === selectedShooting?.id}
              className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              确认取消
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
