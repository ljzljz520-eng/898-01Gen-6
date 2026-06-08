import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Phone,
  FileText,
  Calendar,
  Camera,
  Award,
  Settings,
  Lock,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import CreditScore from '../components/CreditScore.js';
import ScheduleCard from '../components/ScheduleCard.js';
import Empty from '../components/Empty.js';
import { Schedule, CancellationRecord } from '../../shared/types.js';

type TabType = 'profile' | 'schedules' | 'credits' | 'settings';

interface ProfileFormData {
  realName: string;
  city: string;
  phone: string;
  bio: string;
  styles: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const STYLE_OPTIONS = ['人像', '街拍', '婚纱', '夜景', '复古', '小清新', '商业', '时尚', '自然风光'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: storeLoading, fetchSchedules, schedules, works, fetchWorks } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    realName: '',
    city: '',
    phone: '',
    bio: '',
    styles: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [cancellationRecords, setCancellationRecords] = useState<CancellationRecord[]>([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const dataLoadedRef = useRef(false);

  const userSchedules = schedules.filter(s => s.userId === user?.id);
  const completedShootings = works.length;
  const userWorks = works.filter(w => w.uploaderId === user?.id);

  useEffect(() => {
    if (!isAuthenticated && !storeLoading) {
      navigate('/login');
      return;
    }

    if (user) {
      setProfileForm({
        realName: user.realName || '',
        city: user.city || '',
        phone: user.phone || '',
        bio: user.bio || '',
        styles: Array.isArray(user.styles) ? user.styles.join('、') : user.styles || ''
      });
    }

    const loadData = async () => {
      if (dataLoadedRef.current) return;
      dataLoadedRef.current = true;
      setPageLoading(true);
      try {
        await Promise.all([
          fetchSchedules(),
          fetchWorks()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        dataLoadedRef.current = false;
      } finally {
        setPageLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, storeLoading, navigate, user]);

  const loadCancellationRecords = useCallback(async () => {
    if (cancellationRecords.length > 0) return;
    setCreditsLoading(true);
    try {
      const records = await api.users.getCancellationRecords();
      setCancellationRecords(records);
    } catch (error) {
      console.error('Failed to load cancellation records:', error);
    } finally {
      setCreditsLoading(false);
    }
  }, [cancellationRecords.length]);

  useEffect(() => {
    if (activeTab === 'credits' && isAuthenticated) {
      loadCancellationRecords();
    }
  }, [activeTab, isAuthenticated, loadCancellationRecords]);

  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileForm.realName.trim()) {
      errors.realName = '请输入真实姓名';
    }
    if (!profileForm.city.trim()) {
      errors.city = '请输入所在城市';
    }
    if (!profileForm.phone.trim()) {
      errors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      errors.phone = '请输入有效的手机号';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = '请输入原密码';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '密码长度至少6位';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateProfileForm()) return;

    setSubmitLoading(true);
    try {
      const stylesArray = profileForm.styles
        .split(/[、,，\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updatedUser = await api.users.updateProfile({
        realName: profileForm.realName.trim(),
        city: profileForm.city.trim(),
        phone: profileForm.phone.trim(),
        bio: profileForm.bio.trim(),
        styles: stylesArray
      });

      useStore.setState({ user: updatedUser });
      setIsEditing(false);
      setSuccessMessage('资料更新成功');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败，请重试';
      setFormErrors({ submit: message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validatePasswordForm()) return;

    setSubmitLoading(true);
    try {
      await api.users.updateProfile({
        oldPassword: passwordForm.oldPassword,
        password: passwordForm.newPassword
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('密码修改成功');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : '修改失败，请重试';
      setFormErrors({ submit: message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        realName: user.realName || '',
        city: user.city || '',
        phone: user.phone || '',
        bio: user.bio || '',
        styles: Array.isArray(user.styles) ? user.styles.join('、') : user.styles || ''
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (pageLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
          <p className="text-cream-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: '基本资料', icon: User },
    { id: 'schedules' as TabType, label: '我的档期', icon: Calendar },
    { id: 'credits' as TabType, label: '信用记录', icon: Award },
    { id: 'settings' as TabType, label: '账号设置', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <img
                    src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                    alt={user.realName}
                    className="w-24 h-24 rounded-full border-4 border-gold-500/30 object-cover shadow-gold-glow"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-charcoal-900" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-cream-100 font-display">{user.realName}</h2>
                <span className="px-3 py-1 mt-2 rounded-full text-xs font-medium bg-gold-500/20 text-gold-400">
                  {user.role === 'photographer' ? '摄影师' : '模特'}
                </span>
                <div className="flex items-center mt-2 text-cream-400 text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-gold-500" />
                  <span>{user.city}</span>
                </div>
              </div>

              <div className="py-6 border-y border-charcoal-700 mb-6">
                <div className="flex justify-center">
                  <CreditScore score={user.creditScore} size="lg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-500">{userSchedules.length}</p>
                  <p className="text-xs text-cream-400 mt-1">发布档期</p>
                </div>
                <div className="text-center border-x border-charcoal-700">
                  <p className="text-2xl font-bold text-gold-500">{completedShootings}</p>
                  <p className="text-xs text-cream-400 mt-1">拍摄完成</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-500">{userWorks.length}</p>
                  <p className="text-xs text-cream-400 mt-1">作品数</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="card">
              <div className="flex border-b border-charcoal-700 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'text-gold-500 border-b-2 border-gold-500 bg-gold-500/5'
                          : 'text-cream-400 hover:text-cream-200 hover:bg-charcoal-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {successMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    {successMessage}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-cream-100 font-display">基本资料</h3>
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="btn-secondary text-sm py-2 px-4 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          编辑资料
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn-secondary text-sm py-2 px-4 flex items-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            取消
                          </button>
                          <button
                            type="submit"
                            disabled={submitLoading}
                            className="btn-primary text-sm py-2 px-4 flex items-center"
                          >
                            {submitLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            保存
                          </button>
                        </div>
                      )}
                    </div>

                    {formErrors.submit && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {formErrors.submit}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label flex items-center">
                          <User className="w-4 h-4 mr-2 text-gold-500" />
                          真实姓名
                        </label>
                        <input
                          type="text"
                          value={profileForm.realName}
                          onChange={(e) => setProfileForm({ ...profileForm, realName: e.target.value })}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-charcoal-800/50 text-cream-500 cursor-not-allowed' : ''}`}
                          placeholder="请输入真实姓名"
                        />
                        {formErrors.realName && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.realName}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gold-500" />
                          所在城市
                        </label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-charcoal-800/50 text-cream-500 cursor-not-allowed' : ''}`}
                          placeholder="请输入所在城市"
                        />
                        {formErrors.city && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gold-500" />
                          手机号
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-charcoal-800/50 text-cream-500 cursor-not-allowed' : ''}`}
                          placeholder="请输入手机号"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label flex items-center">
                          <Award className="w-4 h-4 mr-2 text-gold-500" />
                          擅长风格
                        </label>
                        <input
                          type="text"
                          value={profileForm.styles}
                          onChange={(e) => setProfileForm({ ...profileForm, styles: e.target.value })}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-charcoal-800/50 text-cream-500 cursor-not-allowed' : ''}`}
                          placeholder="多个风格用顿号分隔，如：人像、街拍"
                        />
                        {isEditing && (
                          <p className="mt-1 text-xs text-cream-500">
                            可选风格：{STYLE_OPTIONS.join('、')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="form-label flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gold-500" />
                        个人简介
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className={`input-field resize-none ${!isEditing ? 'bg-charcoal-800/50 text-cream-500 cursor-not-allowed' : ''}`}
                        placeholder="介绍一下自己，让别人更好地了解你..."
                      />
                    </div>
                  </form>
                )}

                {activeTab === 'schedules' && (
                  <div>
                    <h3 className="text-xl font-semibold text-cream-100 font-display mb-6">我的档期</h3>
                    {pageLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                          <div key={i} className="card animate-pulse">
                            <div className="h-48 bg-charcoal-700" />
                            <div className="p-4 space-y-3">
                              <div className="h-4 bg-charcoal-700 rounded w-3/4" />
                              <div className="h-3 bg-charcoal-700 rounded w-1/2" />
                              <div className="h-3 bg-charcoal-700 rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userSchedules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userSchedules.map((schedule: Schedule) => (
                          <ScheduleCard key={schedule.id} schedule={schedule} />
                        ))}
                      </div>
                    ) : (
                      <Empty
                        icon={Calendar}
                        title="暂无发布的档期"
                        description="发布你的第一个拍摄档期，开始寻找合作机会"
                        actionText="发布档期"
                        onAction={() => navigate('/schedule/create')}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'credits' && (
                  <div>
                    <h3 className="text-xl font-semibold text-cream-100 font-display mb-6">信用记录</h3>
                    {creditsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 rounded-lg bg-charcoal-800 animate-pulse">
                            <div className="h-4 bg-charcoal-700 rounded w-1/4 mb-2" />
                            <div className="h-3 bg-charcoal-700 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-charcoal-700 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : cancellationRecords.length > 0 ? (
                      <div className="space-y-4">
                        {cancellationRecords.map((record) => (
                          <div
                            key={record.id}
                            className="p-4 rounded-lg bg-charcoal-800/50 border border-charcoal-700 hover:border-red-500/30 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
                                  <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                  <p className="text-cream-300 font-medium">取消拍摄</p>
                                  <p className="text-xs text-cream-500">{formatDate(record.createdAt)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-red-400 font-bold">-{record.creditDeducted} 分</p>
                                <p className="text-xs text-cream-500">信用分</p>
                              </div>
                            </div>
                            <div className="ml-13">
                              <p className="text-cream-400 text-sm">
                                <span className="text-cream-500">取消原因：</span>
                                {record.reason}
                              </p>
                              <p className="text-cream-500 text-xs mt-1">
                                距离拍摄时间 {record.hoursBeforeShooting} 小时
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        icon={Award}
                        title="信用记录良好"
                        description="你还没有任何取消记录，继续保持良好的信用！"
                      />
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                    <h3 className="text-xl font-semibold text-cream-100 font-display mb-6">修改密码</h3>

                    {formErrors.submit && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {formErrors.submit}
                      </div>
                    )}

                    <div>
                      <label className="form-label flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-gold-500" />
                        当前密码
                      </label>
                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="input-field"
                        placeholder="请输入当前密码"
                        autoComplete="current-password"
                      />
                      {formErrors.oldPassword && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.oldPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-gold-500" />
                        新密码
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input-field"
                        placeholder="请输入新密码（至少6位）"
                        autoComplete="new-password"
                      />
                      {formErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-gold-500" />
                        确认新密码
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="input-field"
                        placeholder="请再次输入新密码"
                        autoComplete="new-password"
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full btn-primary py-3 flex items-center justify-center"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          修改中...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          确认修改
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
